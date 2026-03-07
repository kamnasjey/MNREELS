"use server";

import { createServerSupabase } from "@/lib/supabase/server";

// Gradient colors for series without cover images
const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
  "from-amber-800 to-yellow-900",
  "from-pink-800 to-fuchsia-900",
  "from-emerald-800 to-green-900",
];

function assignGradient(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

export async function getAllPublishedSeries() {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from("series")
    .select("*, profiles:creator_id(display_name, username, avatar_url), episodes(count)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((s: Record<string, unknown>, i: number) => ({
    ...s,
    gradient: assignGradient(i),
  }));
}

export async function getNewSeries() {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from("series")
    .select("*, profiles:creator_id(display_name)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return (data ?? []).map((s: Record<string, unknown>, i: number) => ({
    ...s,
    gradient: assignGradient(i),
  }));
}

export async function searchSeries(query: string) {
  const supabase = await createServerSupabase();

  const { data } = await supabase.rpc("search_series", {
    search_query: query,
  });

  return (data ?? []).map((s: Record<string, unknown>, i: number) => ({
    ...s,
    gradient: assignGradient(i),
  }));
}

export async function getContinueWatching() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.rpc("get_continue_watching", {
    p_user_id: user.id,
  });

  return data ?? [];
}

export async function getFollowedCreators() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("follows")
    .select("creator_id, profiles:creator_id(id, display_name, username, avatar_url)")
    .eq("user_id", user.id)
    .not("creator_id", "is", null);

  return data ?? [];
}

export async function followCreator(creatorId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  const { error } = await supabase
    .from("follows")
    .insert({ user_id: user.id, creator_id: creatorId });

  if (error && error.code !== "23505") throw new Error(error.message);
}

export async function unfollowCreator(creatorId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  await supabase
    .from("follows")
    .delete()
    .eq("user_id", user.id)
    .eq("creator_id", creatorId);
}

export async function saveWatchProgress(episodeId: string, progress: number, completed: boolean) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("watch_history")
    .upsert({
      user_id: user.id,
      episode_id: episodeId,
      progress,
      completed,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: "user_id,episode_id" });
}

export async function createSeries(formData: {
  title: string;
  description: string;
  category: string;
  ageRating: string;
  coverUrl?: string;
  freeEpisodes?: number;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  // Verify user is creator
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) throw new Error("Бүтээгч биш байна");

  const { data, error } = await supabase
    .from("series")
    .insert({
      creator_id: user.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      age_rating: formData.ageRating,
      cover_url: formData.coverUrl,
      free_episodes: formData.freeEpisodes ?? 3,
    })
    .select()
    .single();

  if (error) throw new Error("Цуврал үүсгэхэд алдаа: " + error.message);
  return data;
}

export async function getCreatorSeries() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("series")
    .select("*, episodes(count)")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getSeriesWithEpisodes(seriesId: string) {
  const supabase = await createServerSupabase();

  const { data: series } = await supabase
    .from("series")
    .select("*, profiles:creator_id(username, display_name, avatar_url)")
    .eq("id", seriesId)
    .single();

  if (!series) return null;

  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("series_id", seriesId)
    .eq("status", "published")
    .order("episode_number", { ascending: true });

  return { ...(series as Record<string, unknown>), episodes: episodes ?? [] };
}

export async function getTrendingSeries() {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from("series")
    .select("*, profiles:creator_id(display_name, avatar_url)")
    .eq("is_published", true)
    .order("total_views", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function getSeriesByCategory(category: string) {
  const supabase = await createServerSupabase();

  let query = supabase
    .from("series")
    .select("*, profiles:creator_id(display_name)")
    .eq("is_published", true)
    .order("rating", { ascending: false })
    .limit(10);

  if (category !== "Бүгд") {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return data ?? [];
}
