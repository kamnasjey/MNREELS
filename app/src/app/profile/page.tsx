import { createServerSupabase } from "@/lib/supabase/server";
import ProfileFeed from "@/components/ProfileFeed";
import { getContinueWatching } from "@/lib/actions/series";

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
        continueWatching={[]}
        bundlePurchases={[]}
        tasalbar={{ balance: 0, transactions: [], purchases: [], paymentId: null }}
        isLoggedIn={false}
      />
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio, is_creator, is_admin")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "User";
  const username = profile?.username ?? user.email?.split("@")[0] ?? "user";

  // Watch history
  const { data: watchHistory } = await supabase
    .from("watch_history")
    .select("episode_id")
    .eq("user_id", user.id)
    .order("last_watched_at", { ascending: false })
    .limit(20);

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

  // Followed creators
  const { data: follows } = await supabase
    .from("follows")
    .select("creator_id")
    .eq("user_id", user.id)
    .not("creator_id", "is", null);

  let followedCreators: { id: string; name: string; avatar: string; seriesCount: number; gradient: string }[] = [];

  if (follows && follows.length > 0) {
    const creatorIds = follows.map((f) => f.creator_id).filter((id): id is string => id !== null);
    const { data: creators } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", creatorIds);

    // Get series count per creator
    const { data: creatorSeries } = await supabase
      .from("series")
      .select("creator_id")
      .in("creator_id", creatorIds)
      .eq("is_published", true);

    const seriesCountMap = new Map<string, number>();
    for (const s of creatorSeries ?? []) {
      seriesCountMap.set(s.creator_id, (seriesCountMap.get(s.creator_id) ?? 0) + 1);
    }

    followedCreators = (creators ?? []).map((c) => ({
      id: c.id,
      name: c.display_name ?? "",
      avatar: (c.display_name ?? "").slice(0, 2),
      seriesCount: seriesCountMap.get(c.id) ?? 0,
      gradient: "from-purple-600 to-indigo-600",
    }));
  }

  // Continue watching
  let continueWatching: { episodeId: string; seriesId: string; seriesTitle: string; episodeNumber: number; progress: number; gradient: string; coverUrl?: string }[] = [];
  try {
    const cwData = await getContinueWatching();
    continueWatching = (cwData ?? []).map((item: Record<string, unknown>, i: number) => ({
      episodeId: String(item.episode_id ?? ""),
      seriesId: String(item.series_id ?? ""),
      seriesTitle: String(item.series_title ?? ""),
      episodeNumber: Number(item.episode_number ?? 1),
      progress: Number(item.progress ?? 0),
      gradient: GRADIENTS[i % GRADIENTS.length],
      coverUrl: item.cover_url ? String(item.cover_url) : undefined,
    }));
  } catch { /* ignore */ }

  // Active bundle purchases
  let bundlePurchases: { seriesId: string; seriesTitle: string; coverUrl?: string; expiresAt: string; gradient: string }[] = [];
  try {
    const { data: bundles } = await supabase
      .from("purchases")
      .select("episode_id, expires_at")
      .eq("user_id", user.id)
      .eq("is_bundle", true)
      .gt("expires_at", new Date().toISOString());

    if (bundles && bundles.length > 0) {
      // Get episode → series mapping
      const bundleEpIds = [...new Set(bundles.map(b => b.episode_id))];
      const { data: bundleEps } = await supabase
        .from("episodes")
        .select("id, series_id")
        .in("id", bundleEpIds);

      const seriesIdsFromBundles = [...new Set((bundleEps ?? []).map(e => e.series_id))];
      const { data: bundleSeriesData } = await supabase
        .from("series")
        .select("id, title, cover_url")
        .in("id", seriesIdsFromBundles);

      // Find latest expires_at per series
      const expiresPerSeries = new Map<string, string>();
      for (const b of bundles) {
        const ep = (bundleEps ?? []).find(e => e.id === b.episode_id);
        if (ep) {
          const current = expiresPerSeries.get(ep.series_id);
          if (!current || b.expires_at > current) {
            expiresPerSeries.set(ep.series_id, b.expires_at);
          }
        }
      }

      bundlePurchases = (bundleSeriesData ?? []).map((s, i) => ({
        seriesId: s.id,
        seriesTitle: s.title ?? "",
        coverUrl: s.cover_url ?? undefined,
        expiresAt: expiresPerSeries.get(s.id) ?? "",
        gradient: GRADIENTS[i % GRADIENTS.length],
      }));
    }
  } catch { /* ignore */ }

  // Tasalbar data
  const { data: tasalbarProfile } = await supabase
    .from("profiles")
    .select("tasalbar_balance, payment_id")
    .eq("id", user.id)
    .single();

  const tasalbarBalance = tasalbarProfile?.tasalbar_balance ?? 0;
  const paymentId = tasalbarProfile?.payment_id ?? null;

  const [txResult, purchaseResult] = await Promise.all([
    supabase
      .from("tasalbar_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("tasalbar_purchases")
      .select("id, tasalbar_amount, tugrug_amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const tasalbarTransactions = (txResult.data ?? []).map((tx: Record<string, unknown>) => ({
    id: String(tx.id),
    type: String(tx.type ?? "spend"),
    amount: Number(tx.amount ?? 0),
    desc: String(tx.description ?? ""),
    time: formatTimeAgo(String(tx.created_at ?? "")),
  }));

  const tasalbarPurchases = (purchaseResult.data ?? []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    tasalbar_amount: Number(p.tasalbar_amount ?? 0),
    tugrug_amount: Number(p.tugrug_amount ?? 0),
    status: String(p.status ?? "pending"),
    created_at: String(p.created_at ?? ""),
  }));

  // Creator stats
  let creatorStats: { totalEarnings: number; totalViews: number; seriesCount: number } | undefined;
  if (profile?.is_creator) {
    const [earningsResult, seriesResult] = await Promise.all([
      supabase.from("creator_earnings").select("creator_share").eq("creator_id", user.id),
      supabase.from("series").select("id, total_views").eq("creator_id", user.id),
    ]);

    const totalEarnings = (earningsResult.data ?? []).reduce((sum, e) => sum + e.creator_share, 0);
    const totalViews = (seriesResult.data ?? []).reduce((sum, s) => sum + (s.total_views ?? 0), 0);

    creatorStats = {
      totalEarnings,
      totalViews,
      seriesCount: seriesResult.data?.length ?? 0,
    };
  }

  return (
    <ProfileFeed
      user={{
        username,
        displayName,
        avatarInitial: displayName.slice(0, 1).toUpperCase(),
        avatarUrl: profile?.avatar_url ?? undefined,
        bio: profile?.bio ?? "",
        followingCount: follows?.length ?? 0,
        isCreator: profile?.is_creator ?? false,
        isAdmin: profile?.is_admin ?? false,
        creatorStats,
      }}
      watchedSeries={watchedSeries}
      followedCreators={followedCreators}
      followedSeries={[]}
      continueWatching={continueWatching}
      bundlePurchases={bundlePurchases}
      tasalbar={{
        balance: tasalbarBalance,
        transactions: tasalbarTransactions,
        purchases: tasalbarPurchases,
        paymentId,
      }}
      isLoggedIn={true}
    />
  );
}

function formatTimeAgo(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHours < 1) return "Саяхан";
  if (diffHours < 24) return `${diffHours} цагийн өмнө`;
  if (diffDays === 1) return "Өчигдөр";
  return `${diffDays} өдрийн өмнө`;
}
