import { createServerSupabase } from "@/lib/supabase/server";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "User";
  const username = profile?.username ?? user.email?.split("@")[0] ?? "user";

  // Simple watch history query - no nested joins
  const { data: watchHistory } = await supabase
    .from("watch_history")
    .select("episode_id")
    .eq("user_id", user.id)
    .order("last_watched_at", { ascending: false })
    .limit(20);

  // Get unique series from watched episodes
  let watchedSeries: { id: string; title: string; creator: string; episodes: number; category: string; rating: number; gradient: string; watchedEpisodes: number; coverUrl?: string }[] = [];

  if (watchHistory && watchHistory.length > 0) {
    const episodeIds = watchHistory.map((wh) => wh.episode_id);
    const { data: episodes } = await supabase
      .from("episodes")
      .select("id, series_id")
      .in("id", episodeIds);

    if (episodes && episodes.length > 0) {
      const seriesIds = [...new Set(episodes.map((ep) => ep.series_id))];
      const episodesPerSeries = new Map<string, number>();
      for (const ep of episodes) {
        episodesPerSeries.set(ep.series_id, (episodesPerSeries.get(ep.series_id) ?? 0) + 1);
      }

      const { data: seriesData } = await supabase
        .from("series")
        .select("id, title, category, cover_url")
        .in("id", seriesIds);

      watchedSeries = (seriesData ?? []).map((s, i) => ({
        id: s.id,
        title: s.title ?? "",
        creator: "",
        episodes: 0,
        category: s.category ?? "",
        rating: 0,
        gradient: GRADIENTS[i % GRADIENTS.length],
        watchedEpisodes: episodesPerSeries.get(s.id) ?? 1,
        coverUrl: s.cover_url ?? undefined,
      }));
    }
  }

  // Followed creators - simple query
  const { data: follows } = await supabase
    .from("follows")
    .select("creator_id")
    .eq("user_id", user.id)
    .not("creator_id", "is", null);

  let followedCreators: { id: string; name: string; avatar: string; seriesCount: number; gradient: string }[] = [];

  if (follows && follows.length > 0) {
    const creatorIds = follows.map((f) => f.creator_id);
    const { data: creators } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", creatorIds);

    followedCreators = (creators ?? []).map((c) => ({
      id: c.id,
      name: c.display_name ?? "",
      avatar: (c.display_name ?? "").slice(0, 2),
      seriesCount: 0,
      gradient: "from-purple-600 to-indigo-600",
    }));
  }

  return (
    <ProfileFeed
      user={{
        username,
        displayName,
        avatarInitial: displayName.slice(0, 1).toUpperCase(),
        bio: profile?.bio ?? "",
        followingCount: follows?.length ?? 0,
      }}
      watchedSeries={watchedSeries}
      followedCreators={followedCreators}
      followedSeries={[]}
      isLoggedIn={true}
    />
  );
}
