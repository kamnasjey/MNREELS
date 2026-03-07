import { getAllPublishedSeries } from "@/lib/actions/series";
import { mockSeries, mockCreators, categories } from "@/lib/mock-data";
import SearchFeed from "@/components/SearchFeed";

export default async function SearchPage() {
  const allSeries = await getAllPublishedSeries().catch(() => []);
  const hasRealData = allSeries.length > 0;

  const seriesList = hasRealData
    ? allSeries.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        title: String(s.title ?? ""),
        creator: String((s.profiles as Record<string, unknown>)?.display_name ?? ""),
        episodes: Number((s.episodes as { count: number }[])?.[0]?.count ?? 0),
        category: String(s.category ?? ""),
        rating: Number(s.rating ?? 0),
        views: formatViews(Number(s.total_views ?? 0)),
        gradient: String(s.gradient ?? "from-purple-800 to-indigo-900"),
        coverUrl: s.cover_url ? String(s.cover_url) : undefined,
      }))
    : mockSeries.map((s) => ({
        id: s.id,
        title: s.title,
        creator: s.creator,
        episodes: s.episodes,
        category: s.category,
        rating: s.rating,
        views: s.views,
        gradient: s.gradient,
      }));

  const creatorsList = hasRealData
    ? extractCreators(allSeries)
    : mockCreators;

  return (
    <SearchFeed
      seriesList={seriesList}
      creatorsList={creatorsList}
      categories={categories}
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
