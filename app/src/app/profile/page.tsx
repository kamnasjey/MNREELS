import { createServerSupabase } from "@/lib/supabase/server";
import ProfileFeed from "@/components/ProfileFeed";
import { getContinueWatching } from "@/lib/actions/series";
import { redirect } from "next/navigation";

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
    redirect("/auth/login?next=/profile");
  }

  // Step 1: Profile needed for is_creator check and display
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio, is_creator, is_admin, login_streak, last_login_date, tasalbar_balance, payment_id")
    .eq("id", user.id)
    .single();

  // Update login streak (fire-and-forget, non-blocking)
  let loginStreak = profile?.login_streak ?? 0;
  if (profile) {
    const today = new Date().toISOString().split("T")[0];
    const lastLogin = profile.last_login_date ? String(profile.last_login_date) : null;
    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      loginStreak = lastLogin === yesterday ? loginStreak + 1 : 1;
      supabase.from("profiles").update({ login_streak: loginStreak, last_login_date: today }).eq("id", user.id).then(() => {});
    }
  }

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "User";
  const username = profile?.username ?? user.email?.split("@")[0] ?? "user";

  // Step 2: ALL independent queries in parallel — biggest performance win
  const [
    watchHistoryResult,
    followsResult,
    cwData,
    bundlesResult,
    txResult,
    purchaseResult,
    earningsResult,
    creatorSeriesResult,
  ] = await Promise.all([
    // Watch history
    supabase.from("watch_history").select("episode_id").eq("user_id", user.id).order("last_watched_at", { ascending: false }).limit(20),
    // Follows
    supabase.from("follows").select("creator_id").eq("user_id", user.id).not("creator_id", "is", null),
    // Continue watching
    getContinueWatching().catch(() => []),
    // Bundle purchases
    supabase.from("purchases").select("episode_id, expires_at").eq("user_id", user.id).eq("is_bundle", true).gt("expires_at", new Date().toISOString()),
    // Tasalbar transactions
    supabase.from("tasalbar_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    // Tasalbar purchases
    supabase.from("tasalbar_purchases").select("id, tasalbar_amount, tugrug_amount, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    // Creator earnings (only if creator, but query is cheap even if empty)
    profile?.is_creator
      ? supabase.from("creator_earnings").select("creator_share").eq("creator_id", user.id)
      : Promise.resolve({ data: null }),
    // Creator series
    profile?.is_creator
      ? supabase.from("series").select("id, total_views").eq("creator_id", user.id)
      : Promise.resolve({ data: null }),
  ]);

  const watchHistory = watchHistoryResult.data;
  const follows = followsResult.data;
  const bundles = bundlesResult.data;

  // Step 3: Cascade queries that depend on Step 2 results — run in parallel
  const watchEpisodeIds = (watchHistory ?? []).map((wh) => wh.episode_id);
  const bundleEpIds = [...new Set((bundles ?? []).map(b => b.episode_id))];
  const creatorIds = (follows ?? []).map((f) => f.creator_id).filter((id): id is string => id !== null);

  const [watchEpisodesResult, bundleEpisodesResult, creatorsResult, creatorSeriesCountResult] = await Promise.all([
    watchEpisodeIds.length > 0
      ? supabase.from("episodes").select("id, series_id").in("id", watchEpisodeIds)
      : Promise.resolve({ data: [] }),
    bundleEpIds.length > 0
      ? supabase.from("episodes").select("id, series_id").in("id", bundleEpIds)
      : Promise.resolve({ data: [] }),
    creatorIds.length > 0
      ? supabase.from("profiles").select("id, display_name, avatar_url").in("id", creatorIds)
      : Promise.resolve({ data: [] }),
    creatorIds.length > 0
      ? supabase.from("series").select("creator_id").in("creator_id", creatorIds).eq("is_published", true)
      : Promise.resolve({ data: [] }),
  ]);

  // Step 4: Final cascade — series lookups for watched + bundles
  const watchSeriesIds = [...new Set((watchEpisodesResult.data ?? []).map((ep) => ep.series_id))];
  const bundleSeriesIds = [...new Set((bundleEpisodesResult.data ?? []).map(e => e.series_id))];
  const allSeriesIds = [...new Set([...watchSeriesIds, ...bundleSeriesIds])];

  const seriesResult = allSeriesIds.length > 0
    ? await supabase.from("series").select("id, title, category, cover_url").in("id", allSeriesIds)
    : { data: [] };

  const seriesMap = new Map((seriesResult.data ?? []).map(s => [s.id, s]));

  // Build watched series
  const episodesPerSeries = new Map<string, number>();
  for (const ep of (watchEpisodesResult.data ?? [])) {
    episodesPerSeries.set(ep.series_id, (episodesPerSeries.get(ep.series_id) ?? 0) + 1);
  }
  const watchedSeries = watchSeriesIds.map((sid, i) => {
    const s = seriesMap.get(sid);
    return {
      id: sid,
      title: s?.title ?? "",
      creator: "",
      episodes: 0,
      category: s?.category ?? "",
      rating: 0,
      gradient: GRADIENTS[i % GRADIENTS.length],
      watchedEpisodes: episodesPerSeries.get(sid) ?? 1,
      coverUrl: s?.cover_url ?? undefined,
    };
  });

  // Build followed creators
  const seriesCountMap = new Map<string, number>();
  for (const s of (creatorSeriesCountResult.data ?? [])) {
    seriesCountMap.set(s.creator_id, (seriesCountMap.get(s.creator_id) ?? 0) + 1);
  }
  const followedCreators = (creatorsResult.data ?? []).map((c) => ({
    id: c.id,
    name: c.display_name ?? "",
    avatar: (c.display_name ?? "").slice(0, 2),
    seriesCount: seriesCountMap.get(c.id) ?? 0,
    gradient: "from-purple-600 to-indigo-600",
  }));

  // Build continue watching
  const continueWatching = (cwData ?? []).map((item: Record<string, unknown>, i: number) => ({
    episodeId: String(item.episode_id ?? ""),
    seriesId: String(item.series_id ?? ""),
    seriesTitle: String(item.series_title ?? ""),
    episodeNumber: Number(item.episode_number ?? 1),
    progress: Number(item.progress ?? 0),
    gradient: GRADIENTS[i % GRADIENTS.length],
    coverUrl: item.cover_url ? String(item.cover_url) : undefined,
  }));

  // Build bundle purchases
  const expiresPerSeries = new Map<string, string>();
  for (const b of (bundles ?? [])) {
    const ep = (bundleEpisodesResult.data ?? []).find(e => e.id === b.episode_id);
    if (ep) {
      const current = expiresPerSeries.get(ep.series_id);
      if (!current || b.expires_at > current) {
        expiresPerSeries.set(ep.series_id, b.expires_at);
      }
    }
  }
  const bundlePurchases = bundleSeriesIds.map((sid, i) => {
    const s = seriesMap.get(sid);
    return {
      seriesId: sid,
      seriesTitle: s?.title ?? "",
      coverUrl: s?.cover_url ?? undefined,
      expiresAt: expiresPerSeries.get(sid) ?? "",
      gradient: GRADIENTS[i % GRADIENTS.length],
    };
  });

  // Build tasalbar data
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

  // Build creator stats
  let creatorStats: { totalEarnings: number; totalViews: number; seriesCount: number } | undefined;
  if (profile?.is_creator && earningsResult.data && creatorSeriesResult.data) {
    creatorStats = {
      totalEarnings: earningsResult.data.reduce((sum, e) => sum + e.creator_share, 0),
      totalViews: creatorSeriesResult.data.reduce((sum, s) => sum + (s.total_views ?? 0), 0),
      seriesCount: creatorSeriesResult.data.length,
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
        loginStreak,
      }}
      watchedSeries={watchedSeries}
      followedCreators={followedCreators}
      followedSeries={[]}
      continueWatching={continueWatching}
      bundlePurchases={bundlePurchases}
      tasalbar={{
        balance: profile?.tasalbar_balance ?? 0,
        transactions: tasalbarTransactions,
        purchases: tasalbarPurchases,
        paymentId: profile?.payment_id ?? null,
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
