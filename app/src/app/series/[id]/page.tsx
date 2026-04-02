import { getSeriesWithEpisodes } from "@/lib/actions/series";
import { createServerSupabase } from "@/lib/supabase/server";
import SeriesDetail from "@/components/SeriesDetail";
import { notFound } from "next/navigation";

const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
];

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
  const { id } = await params;

  const supabase = await createServerSupabase();

  // Fetch series data and auth in PARALLEL (single client, no double creation)
  const [realData, userResult] = await Promise.all([
    getSeriesWithEpisodes(id, supabase).catch(() => null),
    supabase.auth.getUser(),
  ]);
  if (!realData) return notFound();

  const profile = realData.profiles as Record<string, unknown> | undefined;
  const creatorId = String(realData.creator_id ?? "");
  const episodes = (realData.episodes as Record<string, unknown>[]).map((ep, i) => ({
    id: String(ep.id),
    number: Number(ep.episode_number ?? i + 1),
    title: String(ep.title ?? `Анги ${i + 1}`),
    duration: formatDuration(Number(ep.duration ?? 0)),
    isFree: Boolean(ep.is_free) || i < Number(realData.free_episodes ?? 3),
    tasalbarCost: Number(ep.tasalbar_cost ?? 2),
    views: formatViews(Number(ep.views ?? 0)),
  }));

  let isFollowing = false;
  let watchedEpisodeIds: string[] = [];
  const user = userResult.data.user;
  if (user) {
    const episodeIds = episodes.map(e => e.id);

    // Fetch follow status and watched episodes in parallel
    const [followResult, watchResult] = await Promise.all([
      creatorId
        ? supabase.from("follows").select("id").eq("user_id", user.id).eq("creator_id", creatorId).single()
        : Promise.resolve({ data: null }),
      episodeIds.length > 0
        ? supabase.from("watch_history").select("episode_id").eq("user_id", user.id).in("episode_id", episodeIds)
        : Promise.resolve({ data: [] }),
    ]);

    isFollowing = !!followResult.data;
    watchedEpisodeIds = (watchResult.data ?? []).map((w: { episode_id: string }) => String(w.episode_id));
  }

  return (
    <SeriesDetail
      series={{
        id: String(realData.id),
        title: String(realData.title ?? ""),
        creator: String(profile?.display_name ?? ""),
        creatorId,
        creatorAvatar: String(profile?.display_name ?? "").slice(0, 2),
        category: String(realData.category ?? ""),
        rating: Number(realData.rating ?? 0),
        views: formatViews(Number(realData.total_views ?? 0)),
        gradient: GRADIENTS[0],
        episodes: episodes.length,
        freeEpisodes: Number(realData.free_episodes ?? 3),
        coverUrl: realData.cover_url ? String(realData.cover_url) : undefined,
        description: realData.description ? String(realData.description) : undefined,
        bundlePrice: realData.bundle_price ? Number(realData.bundle_price) : undefined,
      }}
      episodes={episodes}
      initialFollowing={isFollowing}
      watchedEpisodeIds={watchedEpisodeIds}
    />
  );
  } catch (err) {
    console.error("SeriesDetailPage error:", err);
    return notFound();
  }
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
