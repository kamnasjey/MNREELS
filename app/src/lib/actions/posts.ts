"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function getFollowingFeed() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get followed creator IDs
  const { data: follows } = await supabase
    .from("follows")
    .select("creator_id")
    .eq("user_id", user.id)
    .not("creator_id", "is", null);

  if (!follows || follows.length === 0) return [];

  const creatorIds = follows.map(f => f.creator_id).filter(Boolean);

  // Get posts from followed creators
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles:creator_id(display_name, avatar_url)")
    .in("creator_id", creatorIds)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get comment counts
  if (posts && posts.length > 0) {
    const postIds = posts.map(p => p.id);
    const { data: commentCounts } = await supabase
      .from("comments")
      .select("post_id")
      .in("post_id", postIds);

    const countMap = new Map<string, number>();
    for (const c of commentCounts ?? []) {
      countMap.set(c.post_id, (countMap.get(c.post_id) ?? 0) + 1);
    }

    return posts.map(p => ({
      ...p,
      comment_count: countMap.get(p.id) ?? 0,
    }));
  }

  return posts ?? [];
}

export async function getCreatorPosts(creatorId: string) {
  const supabase = await createServerSupabase();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles:creator_id(display_name, avatar_url)")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (posts && posts.length > 0) {
    const postIds = posts.map(p => p.id);
    const { data: commentCounts } = await supabase
      .from("comments")
      .select("post_id")
      .in("post_id", postIds);

    const countMap = new Map<string, number>();
    for (const c of commentCounts ?? []) {
      countMap.set(c.post_id, (countMap.get(c.post_id) ?? 0) + 1);
    }

    return posts.map(p => ({
      ...p,
      comment_count: countMap.get(p.id) ?? 0,
    }));
  }

  return posts ?? [];
}

export async function createPost(imageUrl: string | null, caption: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  // Verify creator
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) throw new Error("Бүтээгч биш");

  const { data, error } = await supabase
    .from("posts")
    .insert({
      creator_id: user.id,
      image_url: imageUrl,
      caption: caption.trim(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePost(postId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("creator_id", user.id);

  return { success: true };
}

export async function getComments(postId: string) {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from("comments")
    .select("*, profiles:user_id(display_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(100);

  return data ?? [];
}

export async function addComment(postId: string, content: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  const trimmed = content.trim();
  if (!trimmed) throw new Error("Хоосон коммент");

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: trimmed,
    })
    .select("*, profiles:user_id(display_name, avatar_url)")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
