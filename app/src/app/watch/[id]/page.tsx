import { createServerSupabase } from "@/lib/supabase/server";
import WatchView from "@/components/WatchView";
import { notFound } from "next/navigation";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  // Fetch episode with series info
  const { data: episode } = await supabase
    .from("episodes")
    .select("*, series:series_id(id, title, creator_id, free_episodes, profiles:creator_id(display_name))")
    .eq("id", id)
    .single();

  if (!episode) return notFound();

  const series = episode.series as Record<string, unknown>;
  const profile = series.profiles as Record<string, unknown> | undefined;
  const epNumber = Number(episode.episode_number ?? 1);
  const freeEpisodes = Number(series.free_episodes ?? 3);

  // Fetch ALL published episodes from this series (current + onwards) for vertical scroll
  const { data: allEpisodes } = await supabase
    .from("episodes")
    .select("id, title, episode_number, duration_seconds, video_url, is_free, tasalbar_cost")
    .eq("series_id", String(series.id))
    .eq("status", "published")
    .gte("episode_number", epNumber)
    .order("episode_number", { ascending: true });

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's active purchases for episodes in this series
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
      duration: formatDuration(Number(ep.duration_seconds ?? 0)),
      videoUrl: String(ep.video_url ?? ""),
      isFree,
      isUnlocked: isFree || purchasedIds.has(String(ep.id)),
      tasalbarCost: Number(ep.tasalbar_cost ?? 2),
    };
  });

  // If for some reason current episode isn't in the list, add it at start
  if (episodes.length === 0 || episodes[0].id !== String(episode.id)) {
    const isFreeFirst = episode.is_free || epNumber <= freeEpisodes;
    episodes.unshift({
      id: String(episode.id),
      title: String(episode.title ?? `Анги ${epNumber}`),
      number: epNumber,
      duration: formatDuration(Number(episode.duration_seconds ?? 0)),
      videoUrl: String(episode.video_url ?? ""),
      isFree: isFreeFirst,
      isUnlocked: isFreeFirst || purchasedIds.has(String(episode.id)),
      tasalbarCost: Number(episode.tasalbar_cost ?? 2),
    });
  }

  return (
    <WatchView
      episodes={episodes}
      seriesId={String(series.id)}
      seriesTitle={String(series.title ?? "")}
      creator={String(profile?.display_name ?? "")}
      isLoggedIn={!!user}
    />
  );
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
