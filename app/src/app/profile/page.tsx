import { createServerSupabase } from "@/lib/supabase/server";
import { getFollowedCreators } from "@/lib/actions/series";
import { mockSeries, mockCreators } from "@/lib/mock-data";
import ProfileFeed from "@/components/ProfileFeed";

const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
  "from-amber-800 to-yellow-900",
  "from-pink-800 to-fuchsia-900",
  "from-emerald-800 to-green-900",
];

export default async function ProfilePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <ProfileFeed
        user={{ username: "", displayName: "", avatarInitial: "?", bio: "", followingCount: 0 }}
        watchedSeries={[]}
        followedCreators={[]}
        followedSeries={[]}
        isLoggedIn={false}
      />
    );
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "User";
  const username = profile?.username ?? user.email?.split("@")[0] ?? "user";

  // Fetch watch history + followed creators in parallel
  const [watchHistory, followedData] = await Promise.all([
    supabase
      .from("watch_history")
      .select("episode_id, progress, completed, episodes:episode_id(id, series_id, series:series_id(id, title, category, cover_url, free_episodes))")
      .eq("user_id", user.id)
      .order("last_watched_at", { ascending: false })
      .limit(20)
      .then(({ data }) => data ?? []),
    getFollowedCreators().catch(() => []),
  ]);

  // Process watched series (deduplicate by series)
  const watchedSeriesMap = new Map<string, { id: string; title: string; creator: string; episodes: number; category: string; rating: number; gradient: string; watchedEpisodes: number; coverUrl?: string }>();
  for (const wh of watchHistory) {
    const ep = wh.episodes as Record<string, unknown> | undefined;
    const series = ep?.series as Record<string, unknown> | undefined;
    if (!series) continue;
    const seriesId = String(series.id);
    if (watchedSeriesMap.has(seriesId)) {
      watchedSeriesMap.get(seriesId)!.watchedEpisodes++;
      continue;
    }
    watchedSeriesMap.set(seriesId, {
      id: seriesId,
      title: String(series.title ?? ""),
      creator: "",
      episodes: 0,
      category: String(series.category ?? ""),
      rating: 0,
      gradient: GRADIENTS[watchedSeriesMap.size % GRADIENTS.length],
      watchedEpisodes: 1,
      coverUrl: series.cover_url ? String(series.cover_url) : undefined,
    });
  }

  const hasRealWatchData = watchedSeriesMap.size > 0;
  const watchedSeries = hasRealWatchData
    ? Array.from(watchedSeriesMap.values())
    : mockSeries.map((s) => ({
        id: s.id,
        title: s.title,
        creator: s.creator,
        episodes: s.episodes,
        category: s.category,
        rating: s.rating,
        gradient: s.gradient,
        watchedEpisodes: 3,
      }));

  // Process followed creators
  const hasRealFollowData = followedData.length > 0;
  const followedCreators = hasRealFollowData
    ? followedData.map((f: Record<string, unknown>) => {
        const p = f.profiles as Record<string, unknown> | undefined;
        return {
          id: String(p?.id ?? f.creator_id),
          name: String(p?.display_name ?? ""),
          avatar: String(p?.display_name ?? "").slice(0, 2),
          seriesCount: 0,
          gradient: "from-purple-600 to-indigo-600",
        };
      })
    : mockCreators.slice(0, 3);

  return (
    <ProfileFeed
      user={{
        username,
        displayName,
        avatarInitial: displayName.slice(0, 1).toUpperCase(),
        bio: profile?.bio ?? "Кино үзэх дуртай",
        followingCount: followedData.length || 12,
      }}
      watchedSeries={watchedSeries}
      followedCreators={followedCreators}
      followedSeries={[]}
      isLoggedIn={true}
    />
  );
}
