import { getAllPublishedSeries } from "@/lib/actions/series";
import SearchFeed from "@/components/SearchFeed";

const CATEGORIES = ["Бүгд", "Уран сайхан", "Романтик", "Комеди", "Аймшиг", "Адал явдал", "Гэмт хэрэг", "Түүх"];

export default async function SearchPage() {
  const allSeries = await getAllPublishedSeries().catch(() => []);

  const seriesList = allSeries.map((s: Record<string, unknown>) => ({
    id: String(s.id),
    title: String(s.title ?? ""),
    creator: String((s.profiles as Record<string, unknown>)?.display_name ?? ""),
    episodes: Number((s.episodes as { count: number }[])?.[0]?.count ?? 0),
    category: String(s.category ?? ""),
    rating: Number(s.rating ?? 0),
    views: formatViews(Number(s.total_views ?? 0)),
    gradient: String(s.gradient ?? "from-purple-800 to-indigo-900"),
    coverUrl: s.cover_url ? String(s.cover_url) : undefined,
  }));

  const creatorsList = extractCreators(allSeries);

  return (
    <SearchFeed
      seriesList={seriesList}
      creatorsList={creatorsList}
      categories={CATEGORIES}
    />
  );
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function extractCreators(seriesData: Record<string, unknown>[]) {
  const creatorMap = new Map<string, { id: string; name: string; avatar: string; seriesCount: number; followers: string; gradient: string }>();

  for (const s of seriesData) {
    const profile = s.profiles as Record<string, unknown> | undefined;
    const creatorId = String(s.creator_id ?? "");
    if (!creatorId || creatorMap.has(creatorId)) {
      if (creatorMap.has(creatorId)) {
        creatorMap.get(creatorId)!.seriesCount++;
      }
      continue;
    }
    const name = String(profile?.display_name ?? "");
    creatorMap.set(creatorId, {
      id: creatorId,
      name,
      avatar: name.slice(0, 2),
      seriesCount: 1,
      followers: "0",
      gradient: "from-purple-600 to-indigo-600",
    });
  }

  return Array.from(creatorMap.values());
}
