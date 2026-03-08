import { createServerSupabase } from "@/lib/supabase/server";
import { getCreatorSeries } from "@/lib/actions/series";
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

  if (!user) {
    return (
      <CreatorDashboardFeed
        series={[]}
        stats={{ totalEarnings: 0, totalViews: "0", weeklyGrowth: "0", followers: "0" }}
        isCreator={false}
      />
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) {
    return (
      <CreatorDashboardFeed
        series={[]}
        stats={{ totalEarnings: 0, totalViews: "0", weeklyGrowth: "0", followers: "0" }}
        isCreator={false}
      />
    );
  }

  const creatorSeries = await getCreatorSeries().catch(() => []);

  // Fetch earnings from tasalbar_transactions
  const { data: earnings } = await supabase
    .from("tasalbar_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("type", "creator_earning");

  const totalEarnings = (earnings ?? []).reduce(
    (sum: number, t: Record<string, unknown>) => sum + Number(t.amount ?? 0),
    0
  );

  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", user.id);

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
    followers: formatViews(followerCount ?? 0),
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
