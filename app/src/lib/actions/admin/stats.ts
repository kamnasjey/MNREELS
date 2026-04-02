"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "./helpers";

// ============ DASHBOARD STATS ============

export async function getAdminStats() {
  const { supabase } = await requireAdmin();

  // Calculate "active" threshold: users who logged in within last 24 hours
  const activeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  // Recent activity: last 7 days
  const weekThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersResult, creatorsResult, pendingEpisodesResult, pendingWithdrawalsResult,
    pendingPurchasesResult, recentTransactionsResult, platformEarningsResult,
    totalEpisodesResult, totalSeriesResult, activeUsersResult, weeklyUsersResult,
    verifiedCreatorsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_creator", true),
    supabase.from("episodes").select("*", { count: "exact", head: true }).eq("status", "moderation"),
    supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tasalbar_purchases").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("purchases").select("tasalbar_spent"),
    supabase.from("purchases").select("tasalbar_spent"),
    supabase.from("episodes").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("series").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_seen_at", activeThreshold),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_seen_at", weekThreshold),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_creator", true).eq("creator_verified", true),
  ]);

  // purchases table = source of truth (critical path дээр бичигддэг)
  const totalRevenue = (recentTransactionsResult.data ?? []).reduce(
    (sum: number, t: { tasalbar_spent: number }) => sum + (t.tasalbar_spent ?? 0), 0
  );

  // Platform gets 20% of all purchases
  const platformRevenue = Math.round(totalRevenue * 0.20);

  return {
    totalUsers: usersResult.count ?? 0,
    totalCreators: creatorsResult.count ?? 0,
    verifiedCreators: verifiedCreatorsResult.count ?? 0,
    activeUsers24h: activeUsersResult.count ?? 0,
    activeUsers7d: weeklyUsersResult.count ?? 0,
    totalSeries: totalSeriesResult.count ?? 0,
    totalEpisodes: totalEpisodesResult.count ?? 0,
    pendingEpisodes: pendingEpisodesResult.count ?? 0,
    pendingWithdrawals: pendingWithdrawalsResult.count ?? 0,
    pendingPurchases: pendingPurchasesResult.count ?? 0,
    totalRevenue,
    platformRevenue,
  };
}

export async function getOnlineUsers() {
  const { supabase } = await requireAdmin();

  const onlineThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, is_creator, is_admin, last_seen_at")
    .gte("last_seen_at", onlineThreshold)
    .order("last_seen_at", { ascending: false });

  return data ?? [];
}

// ============ CHECK ADMIN STATUS ============

export async function checkIsAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin === true;
}
