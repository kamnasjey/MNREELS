import { createServerSupabase } from "@/lib/supabase/server";
import CreatorDashboardFeed from "@/components/CreatorDashboardFeed";

const GRADIENTS = [
  "from-purple-800 to-indigo-900",
  "from-cyan-800 to-teal-900",
  "from-red-800 to-rose-900",
  "from-amber-800 to-yellow-900",
  "from-pink-800 to-fuchsia-900",
  "from-emerald-800 to-green-900",
];

export default async function CreatorDashboard() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const empty = (
    <CreatorDashboardFeed
      series={[]}
      stats={{ totalEarnings: 0, totalViews: "0", weeklyGrowth: "0", followers: "0" }}
      isCreator={false}
    />
  );

  if (!user) return empty;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) return empty;

  // Run remaining queries in parallel
  const [seriesResult, earningsResult, followersResult] = await Promise.all([
    supabase
      .from("series")
      .select("id, title, total_views, cover_url, episodes(count)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasalbar_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "creator_earning"),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id),
  ]);

  const creatorSeries = seriesResult.data ?? [];
  const totalEarnings = (earningsResult.data ?? []).reduce(
    (sum: number, t: Record<string, unknown>) => sum + Number(t.amount ?? 0),
    0
  );

  const series = creatorSeries.map((s: Record<string, unknown>, i: number) => ({
    id: String(s.id),
    title: String(s.title ?? ""),
    episodes: Number((s.episodes as { count: number }[])?.[0]?.count ?? 0),
    views: formatViews(Number(s.total_views ?? 0)),
    gradient: GRADIENTS[i % GRADIENTS.length],
    earnings: 0,
    coverUrl: s.cover_url ? String(s.cover_url) : undefined,
  }));

  const stats = {
    totalEarnings,
    totalViews: formatViews(
      creatorSeries.reduce(
        (sum: number, s: Record<string, unknown>) => sum + Number(s.total_views ?? 0),
        0
      )
    ),
    weeklyGrowth: "+0",
    followers: formatViews(followersResult.count ?? 0),
  };

  return (
    <CreatorDashboardFeed
      series={series}
      stats={stats}
      isCreator={true}
    />
  );
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
