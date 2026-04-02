import { createServerSupabase } from "@/lib/supabase/server";
import WatchView from "@/components/WatchView";
import { notFound } from "next/navigation";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();

    // Fetch episode with series info (must be first — need series_id)
    const { data: episode } = await supabase
      .from("episodes")
      .select("*, series:series_id(id, title, creator_id, free_episodes, profiles:creator_id(display_name))")
      .eq("id", id)
      .single();

    if (!episode) return notFound();

    const series = (episode.series ?? {}) as Record<string, unknown>;
    const profile = (series.profiles ?? null) as Record<string, unknown> | null;
    const epNumber = Number(episode.episode_number ?? 1);
    const freeEpisodes = Number(series.free_episodes ?? 3);

    // Fetch all episodes + auth in PARALLEL (both independent)
    const [allEpisodesResult, userResult] = await Promise.all([
      supabase
        .from("episodes")
        .select("id, title, episode_number, duration, video_url, is_free, tasalbar_cost")
        .eq("series_id", String(series.id))
        .eq("status", "published")
        .not("video_url", "is", null)
        .order("episode_number", { ascending: true }),
      supabase.auth.getUser(),
    ]);

    const allEpisodes = allEpisodesResult.data;
    const user = userResult.data.user;

    // Get user's active purchases (needs both user.id and episodeIds)
    const episodeIds = (allEpisodes ?? []).map(e => String(e.id));
    let purchasedIds = new Set<string>();

    if (user && episodeIds.length > 0) {
      const { data: purchases } = await supabase
        .from("purchases")
        .select("episode_id")
        .eq("user_id", user.id)
        .in("episode_id", episodeIds)
        .gt("expires_at", new Date().toISOString());

      purchasedIds = new Set((purchases ?? []).map(p => String(p.episode_id)));
    }

    const episodes = (allEpisodes ?? []).map((ep) => {
      const isFree = ep.is_free || Number(ep.episode_number) <= freeEpisodes;
      return {
        id: String(ep.id),
        title: String(ep.title ?? `Анги ${ep.episode_number}`),
        number: Number(ep.episode_number),
        duration: formatDuration(Number(ep.duration ?? 0)),
        videoUrl: String(ep.video_url ?? ""),
        isFree,
        isUnlocked: isFree || purchasedIds.has(String(ep.id)),
        tasalbarCost: Number(ep.tasalbar_cost ?? 1),
      };
    });

    // Find the index of the clicked episode for initial scroll position
    const startIndex = episodes.findIndex(ep => ep.id === String(episode.id));

    // If current episode isn't in the list at all, add it at its correct position
    if (startIndex < 0) {
      const isFreeFirst = episode.is_free || epNumber <= freeEpisodes;
      const insertEp = {
        id: String(episode.id),
        title: String(episode.title ?? `Анги ${epNumber}`),
        number: epNumber,
        duration: formatDuration(Number(episode.duration ?? 0)),
        videoUrl: String(episode.video_url ?? ""),
        isFree: isFreeFirst,
        isUnlocked: isFreeFirst || purchasedIds.has(String(episode.id)),
        tasalbarCost: Number(episode.tasalbar_cost ?? 1),
      };
      // Insert at correct position by episode number
      const insertAt = episodes.findIndex(e => e.number > epNumber);
      if (insertAt === -1) {
        episodes.push(insertEp);
      } else {
        episodes.splice(insertAt, 0, insertEp);
      }
    }

    return (
      <WatchView
        episodes={episodes}
        seriesId={String(series.id)}
        seriesTitle={String(series.title ?? "")}
        creator={String(profile?.display_name ?? "")}
        isLoggedIn={!!user}
        startIndex={Math.max(0, episodes.findIndex(ep => ep.id === String(episode.id)))}
      />
    );
  } catch (err) {
    console.error("WatchPage error:", err);
    return notFound();
  }
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
