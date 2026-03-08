import { getAllPublishedSeries, getContinueWatching } from "@/lib/actions/series";
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

const CATEGORIES = ["Бүгд", "Уран сайхан", "Романтик", "Комеди", "Аймшиг", "Адал явдал", "Гэмт хэрэг", "Түүх"];

export default async function HomePage() {
  // Single query for all series, derive trending/new from it
  const [allSeries, continueWatchingRaw] = await Promise.all([
    getAllPublishedSeries().catch(() => []),
    getContinueWatching().catch(() => []),
  ]);

  const mapSeries = (list: Record<string, unknown>[]) =>
    list.map((s, i) => ({
      id: String(s.id),
      title: String(s.title ?? ""),
      creator: String((s.profiles as Record<string, unknown>)?.display_name ?? ""),
      creatorAvatar: String((s.profiles as Record<string, unknown>)?.display_name ?? "").slice(0, 2),
      episodes: Number((s.episodes as { count: number }[])?.[0]?.count ?? 0),
      category: String(s.category ?? ""),
      rating: Number(s.rating ?? 0),
      views: formatViews(Number(s.total_views ?? 0)),
      gradient: String(s.gradient ?? GRADIENTS[i % GRADIENTS.length]),
      freeEpisodes: Number(s.free_episodes ?? 3),
      coverUrl: s.cover_url ? String(s.cover_url) : undefined,
    }));

  const mapped = mapSeries(allSeries);
  // Derive trending (by views) and new (by position = newest first) from single query
  const trendingList = [...mapped].sort((a, b) => {
    const parseViews = (v: string) => v.endsWith("K") ? parseFloat(v) * 1000 : parseInt(v) || 0;
    return parseViews(b.views) - parseViews(a.views);
  }).slice(0, 10);
  const newList = mapped.slice(0, 10);

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
        seriesList={mapped}
        trendingList={trendingList}
        newList={newList}
        categories={CATEGORIES}
        continueWatching={continueWatching.length > 0 ? continueWatching : undefined}
      />
    </DeviceGate>
  );
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
