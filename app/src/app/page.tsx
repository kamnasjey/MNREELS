import { getTrendingSeries, getNewSeries, getSeriesByCategory, getAllPublishedSeries, getContinueWatching } from "@/lib/actions/series";
import { mockSeries, categories } from "@/lib/mock-data";
import HomeFeed from "@/components/HomeFeed";
import DeviceGate from "@/components/DeviceGate";

const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
  "from-amber-800 to-yellow-900",
  "from-pink-800 to-fuchsia-900",
  "from-emerald-800 to-green-900",
];

export default async function HomePage() {
  // Fetch real data from Supabase
  const [allSeries, trending, newSeries, continueWatchingRaw] = await Promise.all([
    getAllPublishedSeries().catch(() => []),
    getTrendingSeries().catch(() => []),
    getNewSeries().catch(() => []),
    getContinueWatching().catch(() => []),
  ]);

  // Use real data if available, otherwise fall back to mock
  const hasRealData = allSeries.length > 0;

  const seriesList = hasRealData
    ? allSeries.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        title: String(s.title ?? ""),
        creator: String((s.profiles as Record<string, unknown>)?.display_name ?? ""),
        creatorAvatar: String((s.profiles as Record<string, unknown>)?.display_name ?? "").slice(0, 2),
        episodes: Number((s.episodes as { count: number }[])?.[0]?.count ?? 0),
        category: String(s.category ?? ""),
        rating: Number(s.rating ?? 0),
        views: formatViews(Number(s.total_views ?? 0)),
        gradient: String(s.gradient ?? "from-purple-800 to-indigo-900"),
        freeEpisodes: Number(s.free_episodes ?? 3),
        coverUrl: s.cover_url ? String(s.cover_url) : undefined,
      }))
    : mockSeries;

  const trendingList = hasRealData
    ? trending.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        title: String(s.title ?? ""),
        creator: String((s.profiles as Record<string, unknown>)?.display_name ?? ""),
        creatorAvatar: String((s.profiles as Record<string, unknown>)?.display_name ?? "").slice(0, 2),
        episodes: 0,
        category: String(s.category ?? ""),
        rating: Number(s.rating ?? 0),
        views: formatViews(Number(s.total_views ?? 0)),
        gradient: "from-red-800 to-rose-900",
        freeEpisodes: Number(s.free_episodes ?? 3),
        coverUrl: s.cover_url ? String(s.cover_url) : undefined,
      }))
    : mockSeries;

  const newList = hasRealData
    ? newSeries.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        title: String(s.title ?? ""),
        creator: String((s.profiles as Record<string, unknown>)?.display_name ?? ""),
        creatorAvatar: "",
        episodes: 0,
        category: String(s.category ?? ""),
        rating: Number(s.rating ?? 0),
        views: "0",
        gradient: String(s.gradient ?? "from-cyan-800 to-teal-900"),
        freeEpisodes: Number(s.free_episodes ?? 3),
        coverUrl: s.cover_url ? String(s.cover_url) : undefined,
      }))
    : [...mockSeries].reverse();

  // Map continue watching data
  const continueWatching = continueWatchingRaw.map((item: Record<string, unknown>, i: number) => ({
    episodeId: String(item.episode_id ?? ""),
    seriesId: String(item.series_id ?? ""),
    seriesTitle: String(item.series_title ?? ""),
    episodeNumber: Number(item.episode_number ?? 1),
    progress: Number(item.progress_percent ?? 0),
    gradient: GRADIENTS[i % GRADIENTS.length],
    coverUrl: item.cover_url ? String(item.cover_url) : undefined,
  }));

  return (
    <DeviceGate>
      <HomeFeed
        seriesList={seriesList}
        trendingList={trendingList}
        newList={newList}
        categories={categories}
        continueWatching={continueWatching.length > 0 ? continueWatching : undefined}
      />
    </DeviceGate>
  );
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
