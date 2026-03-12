import { createServerSupabase } from "@/lib/supabase/server";
import CreatorDashboardFeed from "@/components/CreatorDashboardFeed";

const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
  "from-amber-800 to-yellow-900",
  "from-pink-800 to-fuchsia-900",
  "from-emerald-800 to-green-900",
];

const emptyStats = {
  totalEarnings: 0,
  totalViews: "0",
  weeklyGrowth: "0",
  followers: "0",
  totalEpisodes: 0,
  avgViewsPerEpisode: "0",
  topSeriesTitle: "",
  topSeriesViews: "0",
  revenuePerView: "0",
};

export default async function CreatorDashboard() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const empty = (
    <CreatorDashboardFeed series={[]} stats={emptyStats} isCreator={false} />
  );

  if (!user) return empty;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) return empty;

  // Run remaining queries in parallel
  const [seriesResult, earningsResult, followersResult, weekAgoViewsResult, pendingEpisodesResult] = await Promise.all([
    supabase
      .from("series")
      .select("id, title, total_views, cover_url, episodes(count)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("creator_earnings")
      .select("creator_share, episode_id, episodes:episode_id(series_id)")
      .eq("creator_id", user.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id),
    supabase
      .from("episodes")
      .select("views, series:series_id!inner(creator_id)")
      .eq("series.creator_id", user.id)
      .gte("published_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("episodes")
      .select("series_id, series:series_id!inner(creator_id)")
      .eq("series.creator_id", user.id)
      .in("status", ["moderation", "processing"]),
  ]);

  const creatorSeries = seriesResult.data ?? [];
  const allEarnings = earningsResult.data ?? [];

  // Calculate earnings per series
  const earningsPerSeries = new Map<string, number>();
  let totalEarnings = 0;
  for (const e of allEarnings) {
    const share = Number((e as Record<string, unknown>).creator_share ?? 0);
    totalEarnings += share;
    const seriesId = ((e as Record<string, unknown>).episodes as Record<string, unknown>)?.series_id as string;
    if (seriesId) {
      earningsPerSeries.set(seriesId, (earningsPerSeries.get(seriesId) ?? 0) + share);
    }
  }

  // Pending episodes per series
  const pendingPerSeries = new Set<string>();
  for (const ep of (pendingEpisodesResult.data ?? []) as { series_id: string }[]) {
    pendingPerSeries.add(ep.series_id);
  }

  // Weekly views
  const weeklyViews = (weekAgoViewsResult.data ?? []).reduce(
    (sum: number, ep: Record<string, unknown>) => sum + Number(ep.views ?? 0), 0
  );

  const totalViewsNum = creatorSeries.reduce(
    (sum: number, s: Record<string, unknown>) => sum + Number(s.total_views ?? 0), 0
  );

  const totalEpisodes = creatorSeries.reduce(
    (sum: number, s: Record<string, unknown>) => sum + Number((s.episodes as { count: number }[])?.[0]?.count ?? 0), 0
  );

  const series = creatorSeries.map((s: Record<string, unknown>, i: number) => ({
    id: String(s.id),
    title: String(s.title ?? ""),
    episodes: Number((s.episodes as { count: number }[])?.[0]?.count ?? 0),
    views: formatViews(Number(s.total_views ?? 0)),
    viewsNum: Number(s.total_views ?? 0),
    gradient: GRADIENTS[i % GRADIENTS.length],
    earnings: earningsPerSeries.get(String(s.id)) ?? 0,
    coverUrl: s.cover_url ? String(s.cover_url) : undefined,
    hasPending: pendingPerSeries.has(String(s.id)),
  }));

  // Find top series
  const topSeries = [...series].sort((a, b) => b.viewsNum - a.viewsNum)[0];

  const stats = {
    totalEarnings,
    totalViews: formatViews(totalViewsNum),
    weeklyGrowth: weeklyViews > 0 ? "+" + formatViews(weeklyViews) : "0",
    followers: formatViews(followersResult.count ?? 0),
    totalEpisodes,
    avgViewsPerEpisode: totalEpisodes > 0 ? formatViews(Math.round(totalViewsNum / totalEpisodes)) : "0",
    topSeriesTitle: topSeries?.title ?? "",
    topSeriesViews: topSeries?.views ?? "0",
    revenuePerView: totalViewsNum > 0 ? (totalEarnings / totalViewsNum).toFixed(2) : "0",
  };

  return (
    <CreatorDashboardFeed
      series={series}
      stats={stats}
      isCreator={true}
    />
  );
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
