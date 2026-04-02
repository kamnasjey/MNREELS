import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreatorSeriesDetailClient from "./CreatorSeriesDetailClient";

export default async function CreatorSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Get series (must be owned by this creator)
  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .eq("creator_id", user.id)
    .single();

  if (!series) redirect("/creator");

  // Fetch episodes, earnings, and follow count in parallel
  const [
    { data: episodes },
    { data: earnings },
    { count: followCount },
  ] = await Promise.all([
    supabase
      .from("episodes")
      .select("id, title, episode_number, status, views, is_free, tasalbar_cost, video_url, created_at, published_at")
      .eq("series_id", id)
      .order("episode_number", { ascending: true }),
    supabase
      .from("creator_earnings")
      .select("creator_share, episode_id")
      .eq("creator_id", user.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id),
  ]);

  const episodeIds = new Set((episodes ?? []).map((e) => e.id));
  const earningsPerEpisode = new Map<string, number>();
  let totalSeriesEarnings = 0;
  for (const e of earnings ?? []) {
    if (episodeIds.has(e.episode_id)) {
      earningsPerEpisode.set(e.episode_id, (earningsPerEpisode.get(e.episode_id) ?? 0) + e.creator_share);
      totalSeriesEarnings += e.creator_share;
    }
  }

  const totalViews = (episodes ?? []).reduce((sum, ep) => sum + (ep.views ?? 0), 0);

  return (
    <CreatorSeriesDetailClient
      series={series}
      episodes={(episodes ?? []).map((ep) => ({
        ...ep,
        earnings: earningsPerEpisode.get(ep.id) ?? 0,
      }))}
      totalEarnings={totalSeriesEarnings}
      totalViews={totalViews}
      followCount={followCount ?? 0}
    />
  );
}
