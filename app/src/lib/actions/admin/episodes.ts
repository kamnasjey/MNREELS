"use server";

import { requireAdmin } from "./helpers";

// ============ EPISODE MODERATION ============

export async function getPendingEpisodes() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("episodes")
    .select(`
      id, title, episode_number, status, video_url, created_at,
      series:series_id(id, title, creator_id, profiles:creator_id(display_name))
    `)
    .in("status", ["moderation", "processing"])
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function approveEpisode(episodeId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("episodes")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", episodeId);

  if (error) throw new Error("Зөвшөөрөхөд алдаа: " + error.message);
  return { success: true };
}

export async function rejectEpisode(episodeId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("episodes")
    .update({ status: "rejected" })
    .eq("id", episodeId);

  if (error) throw new Error("Татгалзахад алдаа: " + error.message);
  return { success: true };
}

export async function getAllEpisodes() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("episodes")
    .select(`
      id, title, episode_number, status, views, video_url, created_at, published_at,
      series:series_id(id, title, profiles:creator_id(display_name))
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}
