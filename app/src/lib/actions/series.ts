"use server";

import { createServerSupabase } from "@/lib/supabase/server";

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
