import { createServerSupabase } from "@/lib/supabase/server";
import { getFollowingFeed } from "@/lib/actions/posts";
import FollowingFeed from "@/components/FollowingFeed";

export default async function FollowingPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <FollowingFeed posts={[]} isLoggedIn={false} isCreator={false} />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  const rawPosts = await getFollowingFeed();

  const posts = rawPosts.map((p: Record<string, unknown>) => {
    const prof = p.profiles as Record<string, unknown> | undefined;
    return {
      id: String(p.id),
      creatorId: String(p.creator_id ?? ""),
      imageUrl: p.image_url ? String(p.image_url) : undefined,
      caption: String(p.caption ?? ""),
      createdAt: String(p.created_at),
      creatorName: String(prof?.display_name ?? ""),
      creatorAvatar: prof?.avatar_url ? String(prof.avatar_url) : undefined,
      commentCount: Number(p.comment_count ?? 0),
    };
  });

  return <FollowingFeed posts={posts} isLoggedIn={true} isCreator={profile?.is_creator ?? false} />;
}
