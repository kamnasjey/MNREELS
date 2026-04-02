"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2";

export async function createSeries(formData: {
  title: string;
  description: string;
  category: string;
  ageRating: string;
  coverUrl?: string;
  freeEpisodes?: number;
}): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Нэвтрэх шаардлагатай" };

    // Verify user is creator
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_creator")
      .eq("id", user.id)
      .single();

    if (!profile?.is_creator) return { success: false, error: "Бүтээгч биш байна" };

    const { data, error } = await supabase
      .from("series")
      .insert({
        creator_id: user.id,
        title: formData.title,
        description: formData.description || "",
        category: formData.category,
        age_rating: formData.ageRating || "Бүгд",
        cover_url: formData.coverUrl ?? null,
        free_episodes: formData.freeEpisodes ?? 3,
      })
      .select()
      .single();

    if (error) {
      console.error("createSeries DB error:", error);
      return { success: false, error: "Цуврал үүсгэхэд алдаа: " + error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("createSeries unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Тодорхойгүй алдаа" };
  }
}

// Delete an episode (creator only)
export async function deleteEpisode(episodeId: string) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Нэвтрэх шаардлагатай" };

    // Get episode with series info to verify ownership
    const { data: episode } = await supabase
      .from("episodes")
      .select("id, series_id, video_url, series:series_id!inner(creator_id)")
      .eq("id", episodeId)
      .single();

    if (!episode) return { success: false, error: "Анги олдсонгүй" };

    const series = episode.series as unknown as { creator_id: string };
    if (series.creator_id !== user.id) return { success: false, error: "Эрх байхгүй" };

    // Delete video from R2 if exists
    if (episode.video_url) {
      try {
        let r2Key = episode.video_url;
        if (r2Key.startsWith("/api/video/")) {
          r2Key = r2Key.replace("/api/video/", "");
        } else if (r2Key.startsWith("http")) {
          r2Key = new URL(r2Key).pathname.replace(/^\//, "");
        }
        if (r2Key) await deleteFromR2(r2Key);
      } catch {
        // Continue even if R2 delete fails
      }
    }

    // Delete related records first (ignore errors - RLS may block some)
    try { await supabase.from("watch_history").delete().eq("episode_id", episodeId); } catch {}
    try { await supabase.from("purchases").delete().eq("episode_id", episodeId); } catch {}
    try { await supabase.from("creator_earnings").delete().eq("episode_id", episodeId); } catch {}

    // Delete the episode
    const { error } = await supabase.from("episodes").delete().eq("id", episodeId);
    if (error) return { success: false, error: "Устгахад алдаа: " + error.message };

    return { success: true };
  } catch (err) {
    console.error("deleteEpisode error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Тодорхойгүй алдаа" };
  }
}

// Delete a series and all its episodes (creator only)
export async function deleteSeries(seriesId: string) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Нэвтрэх шаардлагатай" };

    // Verify ownership
    const { data: series } = await supabase
      .from("series")
      .select("creator_id, cover_url")
      .eq("id", seriesId)
      .single();

    if (!series || series.creator_id !== user.id) return { success: false, error: "Эрх байхгүй" };

    // Get all episodes with video URLs
    const { data: episodes } = await supabase
      .from("episodes")
      .select("id, video_url")
      .eq("series_id", seriesId);

    const episodeIds = (episodes ?? []).map(e => e.id);

    // Delete videos from R2
    for (const ep of (episodes ?? [])) {
      if (ep.video_url) {
        try {
          let r2Key = ep.video_url;
          if (r2Key.startsWith("/api/video/")) {
            r2Key = r2Key.replace("/api/video/", "");
          } else if (r2Key.startsWith("http")) {
            r2Key = new URL(r2Key).pathname.replace(/^\//, "");
          }
          if (r2Key) await deleteFromR2(r2Key);
        } catch {
          // Continue even if R2 delete fails
        }
      }
    }

    // Delete cover from R2
    if (series.cover_url) {
      try {
        let r2Key = series.cover_url;
        if (r2Key.startsWith("/api/video/")) {
          r2Key = r2Key.replace("/api/video/", "");
        } else if (r2Key.startsWith("http")) {
          r2Key = new URL(r2Key).pathname.replace(/^\//, "");
        }
        if (r2Key) await deleteFromR2(r2Key);
      } catch {
        // Continue even if R2 delete fails
      }
    }

    if (episodeIds.length > 0) {
      // Delete related records (ignore errors - RLS may block some)
      try { await supabase.from("watch_history").delete().in("episode_id", episodeIds); } catch {}
      try { await supabase.from("purchases").delete().in("episode_id", episodeIds); } catch {}
      try { await supabase.from("creator_earnings").delete().in("episode_id", episodeIds); } catch {}

      // Delete all episodes
      const { error: epError } = await supabase.from("episodes").delete().eq("series_id", seriesId);
      if (epError) console.error("Episodes delete error:", epError.message);
    }

    // Delete follows for this series (ignore errors)
    try { await supabase.from("follows").delete().eq("creator_id", user.id); } catch {}

    // Delete the series
    const { error } = await supabase.from("series").delete().eq("id", seriesId);
    if (error) return { success: false, error: "Устгахад алдаа: " + error.message };

    return { success: true };
  } catch (err) {
    console.error("deleteSeries error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Тодорхойгүй алдаа" };
  }
}

// Update bundle price for a series (creator only)
export async function updateSeriesBundlePrice(seriesId: string, bundlePrice: number | null) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  // Verify ownership
  const { data: series } = await supabase
    .from("series")
    .select("creator_id")
    .eq("id", seriesId)
    .single();

  if (!series || series.creator_id !== user.id) throw new Error("Эрх байхгүй");

  const { error } = await supabase
    .from("series")
    .update({ bundle_price: bundlePrice })
    .eq("id", seriesId);

  if (error) throw new Error("Алдаа: " + error.message);
  return { success: true };
}
