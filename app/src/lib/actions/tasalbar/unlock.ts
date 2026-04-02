"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { safeIncrementBalance } from "./helpers";

// Unlock single episode — 48 hours access
export async function unlockEpisode(episodeId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Нэвтрэх шаардлагатай" };

  // Get episode info
  const { data: episode } = await supabase
    .from("episodes")
    .select("*, series:series_id(creator_id, free_episodes)")
    .eq("id", episodeId)
    .single();

  if (!episode) return { success: false, error: "Анги олдсонгүй" };
  if (episode.is_free) return { success: true, alreadyFree: true };

  // Check if already has active purchase (not expired)
  const { data: existing } = await supabase
    .from("purchases")
    .select("id, expires_at")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .gt("expires_at", new Date().toISOString())
    .limit(1);

  if (existing && existing.length > 0) return { success: true, alreadyPurchased: true };

  // Check balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("tasalbar_balance")
    .eq("id", user.id)
    .single();

  if (!profile || profile.tasalbar_balance < episode.tasalbar_cost) {
    return { success: false, error: "Тасалбар хүрэхгүй байна", needTasalbar: true };
  }

  const cost = episode.tasalbar_cost;
  const creatorShare = parseFloat((cost * 0.80).toFixed(2));
  const platformShare = cost - creatorShare;
  const creatorId = (episode.series as any).creator_id;
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

  // Deduct from buyer
  await safeIncrementBalance(supabase, user.id, -cost);

  // Record purchase with expiry (critical — determines access)
  const { error: purchaseError } = await supabase.from("purchases").insert({
    user_id: user.id,
    episode_id: episodeId,
    tasalbar_spent: cost,
    expires_at: expiresAt,
    is_bundle: false,
  });

  if (purchaseError) {
    // Refund if purchase record failed
    await safeIncrementBalance(supabase, user.id, cost);
    return { success: false, error: "Худалдан авалт бүртгэхэд алдаа" };
  }

  // Secondary operations — don't fail the unlock if these error
  try {
    await Promise.all([
      supabase.from("tasalbar_transactions").insert({
        user_id: user.id,
        amount: -cost,
        type: "spend",
        description: `Анги нээсэн (48 цаг)`,
        episode_id: episodeId,
      }),
      safeIncrementBalance(supabase, creatorId, creatorShare),
    ]);
    await Promise.all([
      supabase.from("creator_earnings").insert({
        creator_id: creatorId,
        episode_id: episodeId,
        buyer_id: user.id,
        total_tasalbar: cost,
        creator_share: creatorShare,
        platform_share: platformShare,
      }),
      supabase.from("tasalbar_transactions").insert({
        user_id: creatorId,
        amount: creatorShare,
        type: "earn",
        description: `Ангийн орлого`,
        episode_id: episodeId,
      }),
    ]);
  } catch (err) {
    console.error("Secondary unlock operations failed:", err);
  }

  return { success: true, expiresAt };
}

// Unlock entire series bundle — 96 hours access
export async function unlockSeriesBundle(seriesId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Нэвтрэх шаардлагатай" };

  // Get series with bundle_price and creator
  const { data: series } = await supabase
    .from("series")
    .select("id, bundle_price, creator_id")
    .eq("id", seriesId)
    .single();

  if (!series) return { success: false, error: "Цуврал олдсонгүй" };
  if (!series.bundle_price) return { success: false, error: "Энэ цувралд багц үнэ байхгүй" };

  // Get all paid episodes in this series
  const { data: episodes } = await supabase
    .from("episodes")
    .select("id, tasalbar_cost, is_free")
    .eq("series_id", seriesId)
    .eq("status", "published")
    .eq("is_free", false);

  if (!episodes || episodes.length === 0) return { success: false, error: "Төлбөртэй анги байхгүй" };

  // Check which episodes user already has active purchase for
  const { data: activePurchases } = await supabase
    .from("purchases")
    .select("episode_id")
    .eq("user_id", user.id)
    .in("episode_id", episodes.map(e => e.id))
    .gt("expires_at", new Date().toISOString());

  const alreadyPurchased = new Set((activePurchases ?? []).map(p => p.episode_id));
  const episodesToUnlock = episodes.filter(e => !alreadyPurchased.has(e.id));

  if (episodesToUnlock.length === 0) return { success: true, alreadyPurchased: true };

  const bundleCost = series.bundle_price;

  // Check balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("tasalbar_balance")
    .eq("id", user.id)
    .single();

  if (!profile || profile.tasalbar_balance < bundleCost) {
    return { success: false, error: "Тасалбар хүрэхгүй байна", needTasalbar: true };
  }

  const creatorShare = parseFloat((bundleCost * 0.80).toFixed(2));
  const platformShare = bundleCost - creatorShare;
  const expiresAt = new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(); // 96 hours

  // Deduct from buyer
  await safeIncrementBalance(supabase, user.id, -bundleCost);

  // Insert purchases for all episodes
  const purchaseRows = episodesToUnlock.map(ep => ({
    user_id: user.id,
    episode_id: ep.id,
    tasalbar_spent: Math.round(bundleCost / episodesToUnlock.length),
    expires_at: expiresAt,
    is_bundle: true,
  }));

  await Promise.all([
    supabase.from("purchases").insert(purchaseRows),
    supabase.from("tasalbar_transactions").insert({
      user_id: user.id,
      amount: -bundleCost,
      type: "spend",
      description: `Цуврал бүхлээр нээсэн (96 цаг)`,
    }),
  ]);

  await Promise.all([
    safeIncrementBalance(supabase, series.creator_id, creatorShare),
    supabase.from("creator_earnings").insert({
      creator_id: series.creator_id,
      buyer_id: user.id,
      total_tasalbar: bundleCost,
      creator_share: creatorShare,
      platform_share: platformShare,
    }),
    supabase.from("tasalbar_transactions").insert({
      user_id: series.creator_id,
      amount: creatorShare,
      type: "earn",
      description: `Цуврал багц орлого`,
    }),
  ]);

  return { success: true, expiresAt, unlockedCount: episodesToUnlock.length };
}
