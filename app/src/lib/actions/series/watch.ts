"use server";

import { createServerSupabase } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createServerSupabase>>;

export async function saveWatchProgress(episodeId: string, progress: number, completed: boolean, supabase?: SupabaseServer) {
  if (!supabase) supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Check if this is a first-time view (no existing watch_history record)
  const { data: existing } = await supabase
    .from("watch_history")
    .select("id")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .single();

  await supabase
    .from("watch_history")
    .upsert({
      user_id: user.id,
      episode_id: episodeId,
      progress,
      completed,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: "user_id,episode_id" });

  // If first time watching this episode, increment view counts
  if (!existing) {
    // Get episode's series_id
    const { data: episode } = await supabase
      .from("episodes")
      .select("series_id, views")
      .eq("id", episodeId)
      .single();

    if (episode) {
      // Increment episode views and series total_views in parallel
      await Promise.all([
        supabase
          .from("episodes")
          .update({ views: (episode.views ?? 0) + 1 })
          .eq("id", episodeId),
        supabase.rpc("increment_series_views", { p_series_id: episode.series_id }),
      ]);
    }
  }
}
