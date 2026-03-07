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
  const isFree = epNumber <= Number(series.free_episodes ?? 3);

  // Find next episode
  const { data: nextEp } = await supabase
    .from("episodes")
    .select("id")
    .eq("series_id", String(series.id))
    .eq("episode_number", epNumber + 1)
    .eq("status", "published")
    .single();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <WatchView
      episode={{
        id: String(episode.id),
        title: String(episode.title ?? `Анги ${epNumber}`),
        number: epNumber,
        duration: formatDuration(Number(episode.duration_seconds ?? 0)),
        videoUrl: String(episode.video_url ?? ""),
        isFree,
      }}
      seriesId={String(series.id)}
      seriesTitle={String(series.title ?? "")}
      creator={String(profile?.display_name ?? "")}
      nextEpisodeId={nextEp?.id ? String(nextEp.id) : undefined}
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
