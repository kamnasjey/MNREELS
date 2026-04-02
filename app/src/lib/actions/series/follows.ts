"use server";

import { createServerSupabase } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createServerSupabase>>;

export async function getFollowedCreators(supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("follows")
    .select("creator_id, profiles:creator_id(id, display_name, username, avatar_url)")
    .eq("user_id", user.id)
    .not("creator_id", "is", null);

  return data ?? [];
}

export async function followCreator(creatorId: string, supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  const { error } = await supabase
    .from("follows")
    .insert({ user_id: user.id, creator_id: creatorId });

  if (error && error.code !== "23505") throw new Error(error.message);
}

export async function unfollowCreator(creatorId: string, supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  await supabase
    .from("follows")
    .delete()
    .eq("user_id", user.id)
    .eq("creator_id", creatorId);
}
