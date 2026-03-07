import { createServerSupabase } from "@/lib/supabase/server";
import { getCreatorSeries } from "@/lib/actions/series";
import { mockSeries } from "@/lib/mock-data";
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

  // Check if user is creator
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

  // Fetch creator's series
  const creatorSeries = await getCreatorSeries().catch(() => []);
  const hasRealData = creatorSeries.length > 0;

  // Fetch earnings
  const { data: earnings } = await supabase
    .from("transactions")
    .select("amount")
    .eq("creator_id", user.id)
    .eq("type", "episode_unlock");

  const totalEarnings = (earnings ?? []).reduce(
    (sum: number, t: Record<string, unknown>) => sum + Number(t.amount ?? 0),
    0
  );

  // Fetch follower count
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", user.id);

  const series = hasRealData
    ? creatorSeries.map((s: Record<string, unknown>, i: number) => ({
        id: String(s.id),
        title: String(s.title ?? ""),
        episodes: Number((s.episodes as { count: number }[])?.[0]?.count ?? 0),
        views: formatViews(Number(s.total_views ?? 0)),
        gradient: GRADIENTS[i % GRADIENTS.length],
        earnings: 0,
        coverUrl: s.cover_url ? String(s.cover_url) : undefined,
      }))
    : mockSeries.slice(0, 3).map((s) => ({
        id: s.id,
        title: s.title,
        episodes: s.episodes,
        views: s.views,
        gradient: s.gradient,
        earnings: Number(s.views.replace("K", "")) * 17,
        hasPending: s.id === "3",
      }));

  const stats = hasRealData
    ? {
        totalEarnings,
        totalViews: formatViews(
          creatorSeries.reduce(
            (sum: number, s: Record<string, unknown>) => sum + Number(s.total_views ?? 0),
            0
          )
        ),
        weeklyGrowth: "+0",
        followers: formatViews(followerCount ?? 0),
      }
    : {
        totalEarnings: 4350,
        totalViews: "89K",
        weeklyGrowth: "+342",
        followers: "12.5K",
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
