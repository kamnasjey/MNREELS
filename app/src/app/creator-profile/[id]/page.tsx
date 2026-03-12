import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CreatorPublicProfile from "@/components/CreatorPublicProfile";
import { getCreatorPosts } from "@/lib/actions/posts";

const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
  "from-amber-800 to-yellow-900",
];

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  // Get creator profile
  const { data: creator } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, is_creator")
    .eq("id", id)
    .single();

  if (!creator || !creator.is_creator) return notFound();

  // Get creator's published series
  const { data: series } = await supabase
    .from("series")
    .select("id, title, cover_url, category, total_views, episodes(count)")
    .eq("creator_id", id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Get follower count
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", id);

  // Check if current user follows this creator
  let isFollowing = false;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("creator_id", id)
      .single();
    isFollowing = !!follow;
  }

  // Get creator posts
  const posts = await getCreatorPosts(id);

  const seriesList = (series ?? []).map((s: Record<string, unknown>, i: number) => ({
    id: String(s.id),
    title: String(s.title ?? ""),
    coverUrl: s.cover_url ? String(s.cover_url) : undefined,
    category: String(s.category ?? ""),
    episodes: Array.isArray(s.episodes) ? (s.episodes[0] as Record<string, number>)?.count ?? 0 : 0,
    gradient: GRADIENTS[i % GRADIENTS.length],
  }));

  return (
    <CreatorPublicProfile
      creator={{
        id: creator.id,
        name: creator.display_name ?? "",
        avatarUrl: creator.avatar_url ?? undefined,
        bio: creator.bio ?? "",
        followerCount: followerCount ?? 0,
        seriesCount: seriesList.length,
      }}
      series={seriesList}
      posts={posts.map((p: Record<string, unknown>) => {
        const profile = p.profiles as Record<string, unknown> | undefined;
        return {
          id: String(p.id),
          imageUrl: p.image_url ? String(p.image_url) : undefined,
          caption: String(p.caption ?? ""),
          createdAt: String(p.created_at),
          creatorName: String(profile?.display_name ?? ""),
          creatorAvatar: profile?.avatar_url ? String(profile.avatar_url) : undefined,
          commentCount: Number(p.comment_count ?? 0),
        };
      })}
      initialFollowing={isFollowing}
      isLoggedIn={!!user}
    />
  );
}
