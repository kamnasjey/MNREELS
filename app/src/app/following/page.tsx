import { createServerSupabase } from "@/lib/supabase/server";
import { getFollowingFeed, getCreatorPosts } from "@/lib/actions/posts";
import FollowingFeed from "@/components/FollowingFeed";
import { redirect } from "next/navigation";

export default async function FollowingPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/following");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  const isCreator = profile?.is_creator ?? false;

  const mapPosts = (rawPosts: Record<string, unknown>[]) =>
    rawPosts.map((p) => {
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

  // Fetch following posts and user's own posts in parallel, reusing single client
  const [rawFollowing, rawMyPosts] = await Promise.all([
    getFollowingFeed(supabase),
    isCreator ? getCreatorPosts(user.id, supabase) : Promise.resolve([]),
  ]);

  return (
    <FollowingFeed
      posts={mapPosts(rawFollowing)}
      myPosts={mapPosts(rawMyPosts as Record<string, unknown>[])}
      isLoggedIn={true}
      isCreator={isCreator}
      currentUserId={user.id}
    />
  );
}
