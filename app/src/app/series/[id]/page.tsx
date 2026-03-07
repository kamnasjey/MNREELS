import { getSeriesWithEpisodes } from "@/lib/actions/series";
import { createServerSupabase } from "@/lib/supabase/server";
import { mockSeries } from "@/lib/mock-data";
import SeriesDetail from "@/components/SeriesDetail";
import { notFound } from "next/navigation";

const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
  "from-amber-800 to-yellow-900",
  "from-pink-800 to-fuchsia-900",
  "from-emerald-800 to-green-900",
];

const EPISODE_TITLES = [
  "Эхлэл", "Нууц", "Мөрдлөг", "Учрал", "Хүлээлт",
  "Тэмцэл", "Нөхөрлөл", "Эргэлт", "Итгэл", "Зоригт",
  "Харанхуй", "Гэрэл", "Хайр", "Тулаан", "Төгсгөл",
];

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try real data first
  const realData = await getSeriesWithEpisodes(id).catch(() => null);

  if (realData) {
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

    // Check if current user follows this creator
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

  // Fallback to mock data
  const mockItem = mockSeries.find((s) => s.id === id);
  if (!mockItem) return notFound();

  const mockEpisodes = Array.from(
    { length: Math.min(mockItem.episodes, 15) },
    (_, i) => ({
      id: `${mockItem.id}-ep-${i + 1}`,
      number: i + 1,
      title: EPISODE_TITLES[i] ?? `Анги ${i + 1}`,
      duration: `${3 + Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      isFree: i < mockItem.freeEpisodes,
      views: `${Math.floor(Math.random() * 50 + 5)}K`,
    })
  );

  return (
    <SeriesDetail
      series={{
        ...mockItem,
        creatorId: "",
        description: undefined,
      }}
      episodes={mockEpisodes}
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
