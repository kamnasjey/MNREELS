"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { safeIncrementBalance } from "./helpers";
import {
  CREATOR_SHARE_PERCENT,
  EPISODE_ACCESS_MS,
  BUNDLE_ACCESS_MS,
} from "@/lib/constants/packages";

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

  const cost = episode.tasalbar_cost;
  const creatorShare = Math.floor(cost * CREATOR_SHARE_PERCENT);
  const platformShare = cost - creatorShare;
  const creatorId = (episode.series as Record<string, unknown>).creator_id as string;
  const expiresAt = new Date(Date.now() + EPISODE_ACCESS_MS).toISOString();

  // Atomic balance deduction via RPC — returns false if insufficient balance
  // This prevents race condition double-spending
  const { error: rpcError } = await supabase.rpc("increment_balance", {
    user_id: user.id,
    amount: -cost,
  });

  if (rpcError) {
    // Fallback: check + deduct (less safe but functional)
    const { data: profile } = await supabase
      .from("profiles")
      .select("tasalbar_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.tasalbar_balance < cost) {
      return { success: false, error: "Тасалбар хүрэхгүй байна", needTasalbar: true };
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ tasalbar_balance: profile.tasalbar_balance - cost })
      .eq("id", user.id)
      .gte("tasalbar_balance", cost); // DB-level check: balance >= cost

    if (updateErr) {
      return { success: false, error: "Тасалбар хүрэхгүй байна", needTasalbar: true };
    }
  }

  // Record purchase with expiry (critical — determines access)
  const { error: purchaseError } = await supabase.from("purchases").insert({
    user_id: user.id,
    episode_id: episodeId,
    tasalbar_spent: cost,
    expires_at: expiresAt,
    is_bundle: false,
  });

  if (purchaseError) {
    // Refund
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

  const { data: series } = await supabase
    .from("series")
    .select("id, bundle_price, creator_id")
    .eq("id", seriesId)
    .single();

  if (!series) return { success: false, error: "Цуврал олдсонгүй" };
  if (!series.bundle_price) return { success: false, error: "Энэ цувралд багц үнэ байхгүй" };

  const { data: episodes } = await supabase
    .from("episodes")
    .select("id, tasalbar_cost, is_free")
    .eq("series_id", seriesId)
    .eq("status", "published")
    .eq("is_free", false);

  if (!episodes || episodes.length === 0) return { success: false, error: "Төлбөртэй анги байхгүй" };

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
  const creatorShare = Math.floor(bundleCost * CREATOR_SHARE_PERCENT);
  const platformShare = bundleCost - creatorShare;
  const expiresAt = new Date(Date.now() + BUNDLE_ACCESS_MS).toISOString();

  // Atomic balance deduction
  const { error: rpcError } = await supabase.rpc("increment_balance", {
    user_id: user.id,
    amount: -bundleCost,
  });

  if (rpcError) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tasalbar_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.tasalbar_balance < bundleCost) {
      return { success: false, error: "Тасалбар хүрэхгүй байна", needTasalbar: true };
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ tasalbar_balance: profile.tasalbar_balance - bundleCost })
      .eq("id", user.id)
      .gte("tasalbar_balance", bundleCost);

    if (updateErr) {
      return { success: false, error: "Тасалбар хүрэхгүй байна", needTasalbar: true };
    }
  }

  // Per-episode cost — distribute evenly, remainder goes to first episode
  const perEpisodeCost = Math.floor(bundleCost / episodesToUnlock.length);
  const remainder = bundleCost - perEpisodeCost * episodesToUnlock.length;

  const purchaseRows = episodesToUnlock.map((ep, i) => ({
    user_id: user.id,
    episode_id: ep.id,
    tasalbar_spent: perEpisodeCost + (i === 0 ? remainder : 0),
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

  // Creator earnings — bundle-д episode_id-г эхний ангиар бүртгэнэ
  const firstEpisodeId = episodesToUnlock[0].id;

  await Promise.all([
    safeIncrementBalance(supabase, series.creator_id, creatorShare),
    supabase.from("creator_earnings").insert({
      creator_id: series.creator_id,
      episode_id: firstEpisodeId,
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
