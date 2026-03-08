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
  const { id } = await params;

  const realData = await getSeriesWithEpisodes(id).catch(() => null);
  if (!realData) return notFound();

  const profile = realData.profiles as Record<string, unknown> | undefined;
  const creatorId = String(realData.creator_id ?? "");
  const episodes = (realData.episodes as Record<string, unknown>[]).map((ep, i) => ({
    id: String(ep.id),
    number: Number(ep.episode_number ?? i + 1),
    title: String(ep.title ?? `Анги ${i + 1}`),
    duration: formatDuration(Number(ep.duration_seconds ?? 0)),
    isFree: i < Number(realData.free_episodes ?? 3),
    views: formatViews(Number(ep.view_count ?? 0)),
  }));

  let isFollowing = false;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && creatorId) {
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("creator_id", creatorId)
      .single();
    isFollowing = !!follow;
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
      }}
      episodes={episodes}
      initialFollowing={isFollowing}
    />
  );
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
