import { createServerSupabase } from "@/lib/supabase/server";
import { getAllPublishedSeries } from "@/lib/actions/series";
import SearchFeed from "@/components/SearchFeed";

// Revalidate every 10 minutes
export const revalidate = 600;

const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
  "from-amber-800 to-yellow-900",
  "from-pink-800 to-fuchsia-900",
  "from-emerald-800 to-green-900",
];

export default async function SearchPage() {
  // Reuse a single Supabase client; derive categories from fetched data
  const supabase = await createServerSupabase();
  const allSeries = await getAllPublishedSeries(supabase);

  // Derive categories from already-fetched series instead of a separate query
  const uniqueCategories = ["Бүгд", ...new Set(allSeries.map((s: Record<string, unknown>) => s.category).filter(Boolean))] as string[];

  const seriesList = allSeries.map((s: Record<string, unknown>, i: number) => {
    const profile = s.profiles as Record<string, unknown> | undefined;
    return {
      id: String(s.id),
      title: String(s.title ?? ""),
      creator: String(profile?.display_name ?? ""),
      creatorId: String(s.creator_id ?? ""),
      episodes: Array.isArray(s.episodes) ? (s.episodes[0] as Record<string, number>)?.count ?? 0 : 0,
      category: String(s.category ?? ""),
      rating: Number(s.rating ?? 0),
      gradient: GRADIENTS[i % GRADIENTS.length],
      coverUrl: s.cover_url ? String(s.cover_url) : undefined,
    };
  });

  // Extract unique creators
  const creatorMap = new Map<string, { id: string; name: string; avatar: string; seriesCount: number; gradient: string }>();
  for (const s of seriesList) {
    if (!s.creatorId) continue;
    const existing = creatorMap.get(s.creatorId);
    if (existing) {
      existing.seriesCount++;
    } else {
      creatorMap.set(s.creatorId, {
        id: s.creatorId,
        name: s.creator,
        avatar: s.creator.slice(0, 2),
        seriesCount: 1,
        gradient: GRADIENTS[creatorMap.size % GRADIENTS.length],
      });
    }
  }

  return (
    <SearchFeed
      seriesList={seriesList}
      creatorsList={Array.from(creatorMap.values())}
      categories={uniqueCategories}
    />
  );
}
