"use server";

import { createServerSupabase } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createServerSupabase>>;

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

export async function getAllPublishedSeries(supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();

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

export async function getNewSeries(supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();

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

export async function searchSeries(query: string, supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();

  const { data } = await supabase.rpc("search_series", {
    search_query: query,
  });

  return (data ?? []).map((s: Record<string, unknown>, i: number) => ({
    ...s,
    gradient: assignGradient(i),
  }));
}

export async function getContinueWatching(supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.rpc("get_continue_watching", {
    p_user_id: user.id,
  });

  return data ?? [];
}

export async function getSeriesWithEpisodes(seriesId: string, supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();

  const { data: series, error } = await supabase
    .from("series")
    .select("*, profiles:creator_id(username, display_name, avatar_url)")
    .eq("id", seriesId)
    .single();

  if (error) {
    console.error("getSeriesWithEpisodes error:", error.message, "seriesId:", seriesId);
  }
  if (!series) return null;

  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("series_id", seriesId)
    .eq("status", "published")
    .order("episode_number", { ascending: true });

  return { ...(series as Record<string, unknown>), episodes: episodes ?? [] };
}

export async function getTrendingSeries(supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();

  const { data } = await supabase
    .from("series")
    .select("*, profiles:creator_id(display_name, avatar_url)")
    .eq("is_published", true)
    .order("total_views", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function getSeriesByCategory(category: string, supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();

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

export async function getCreatorSeries(supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("series")
    .select("*, episodes(count)")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

// Get the next episode number for a series
export async function getNextEpisodeNumber(seriesId: string, supabase?: SupabaseServer): Promise<number> {
  if (!supabase) supabase = await createServerSupabase();
  const { data } = await supabase
    .from("episodes")
    .select("episode_number")
    .eq("series_id", seriesId)
    .order("episode_number", { ascending: false })
    .limit(1)
    .single();

  return (data?.episode_number || 0) + 1;
}
