"use server";

import { createServerSupabase } from "@/lib/supabase/server";

// Purchase tasalbar package
export async function purchaseTasalbar(amount: number, paymentRef: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  // Record transaction
  const { error: txError } = await supabase
    .from("tasalbar_transactions")
    .insert({
      user_id: user.id,
      amount,
      type: "buy",
      description: `${amount} тасалбар худалдаж авсан`,
      payment_method: "qpay",
      payment_ref: paymentRef,
    });

  if (txError) throw new Error("Гүйлгээ бүртгэхэд алдаа гарлаа");

  // Update balance
  const { error: balError } = await supabase.rpc("increment_balance", {
    user_id: user.id,
    amount,
  });

  if (balError) throw new Error("Үлдэгдэл шинэчлэхэд алдаа гарлаа");

  return { success: true };
}

// Get user's payment ID
export async function getPaymentId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("payment_id")
    .eq("id", user.id)
    .single();

  return profile?.payment_id ?? null;
}

// Create manual bank transfer purchase request
export async function createManualPurchase(packageId: string, tasalbarAmount: number, tugrugAmount: number) {
  if (tasalbarAmount < 100) return { success: false, error: "Доод хэмжээ 100 тасалбар" };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Нэвтрэх шаардлагатай" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("payment_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { success: false, error: "Профайл олдсонгүй" };

  const transferDesc = `${profile.payment_id} ${tasalbarAmount}`;

  const { error } = await supabase
    .from("tasalbar_purchases")
    .insert({
      user_id: user.id,
      payment_id: profile.payment_id,
      package_id: packageId,
      tasalbar_amount: tasalbarAmount,
      tugrug_amount: tugrugAmount,
      transfer_description: transferDesc,
      status: "pending",
    });

  if (error) return { success: false, error: "Хүсэлт үүсгэхэд алдаа: " + error.message };
  return { success: true };
}

// Get user's pending purchases
export async function getMyPurchases() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("tasalbar_purchases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

// Check if user has active (non-expired) purchase for an episode
export async function checkEpisodePurchase(episodeId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("purchases")
    .select("id, expires_at")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .gt("expires_at", new Date().toISOString())
    .limit(1);

  return (data && data.length > 0);
}

// Get all active purchases for a user (for batch checking)
export async function getActivePurchases() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("purchases")
    .select("episode_id, expires_at")
    .eq("user_id", user.id)
    .gt("expires_at", new Date().toISOString());

  return data ?? [];
}

// Unlock single episode — 48 hours access
export async function unlockEpisode(episodeId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  // Get episode info
  const { data: episode } = await supabase
    .from("episodes")
    .select("*, series:series_id(creator_id, free_episodes)")
    .eq("id", episodeId)
    .single();

  if (!episode) throw new Error("Анги олдсонгүй");
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
    throw new Error("Тасалбар хүрэхгүй байна");
  }

  const cost = episode.tasalbar_cost;
  const creatorShare = Math.round(cost * 0.80);
  const platformShare = cost - creatorShare;
  const creatorId = (episode.series as any).creator_id;
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

  // Deduct from buyer
  await supabase.rpc("increment_balance", {
    user_id: user.id,
    amount: -cost,
  });

  // Record purchase with expiry
  await supabase.from("purchases").insert({
    user_id: user.id,
    episode_id: episodeId,
    tasalbar_spent: cost,
    expires_at: expiresAt,
    is_bundle: false,
  });

  // Record spend transaction
  await supabase.from("tasalbar_transactions").insert({
    user_id: user.id,
    amount: -cost,
    type: "spend",
    description: `Анги нээсэн (48 цаг)`,
    episode_id: episodeId,
  });

  // Credit creator (80%)
  await supabase.rpc("increment_balance", {
    user_id: creatorId,
    amount: creatorShare,
  });

  // Record creator earning
  await supabase.from("creator_earnings").insert({
    creator_id: creatorId,
    episode_id: episodeId,
    buyer_id: user.id,
    total_tasalbar: cost,
    creator_share: creatorShare,
    platform_share: platformShare,
  });

  // Record creator earn transaction
  await supabase.from("tasalbar_transactions").insert({
    user_id: creatorId,
    amount: creatorShare,
    type: "earn",
    description: `Ангийн орлого`,
    episode_id: episodeId,
  });

  return { success: true, expiresAt };
}

// Unlock entire series bundle — 96 hours access
export async function unlockSeriesBundle(seriesId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  // Get series with bundle_price and creator
  const { data: series } = await supabase
    .from("series")
    .select("id, bundle_price, creator_id")
    .eq("id", seriesId)
    .single();

  if (!series) throw new Error("Цуврал олдсонгүй");
  if (!series.bundle_price) throw new Error("Энэ цувралд багц үнэ байхгүй");

  // Get all paid episodes in this series
  const { data: episodes } = await supabase
    .from("episodes")
    .select("id, tasalbar_cost, is_free")
    .eq("series_id", seriesId)
    .eq("status", "published")
    .eq("is_free", false);

  if (!episodes || episodes.length === 0) throw new Error("Төлбөртэй анги байхгүй");

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
    throw new Error("Тасалбар хүрэхгүй байна");
  }

  const creatorShare = Math.round(bundleCost * 0.80);
  const platformShare = bundleCost - creatorShare;
  const expiresAt = new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(); // 96 hours

  // Deduct from buyer
  await supabase.rpc("increment_balance", {
    user_id: user.id,
    amount: -bundleCost,
  });

  // Insert purchases for all episodes
  const purchaseRows = episodesToUnlock.map(ep => ({
    user_id: user.id,
    episode_id: ep.id,
    tasalbar_spent: Math.round(bundleCost / episodesToUnlock.length),
    expires_at: expiresAt,
    is_bundle: true,
  }));

  await supabase.from("purchases").insert(purchaseRows);

  // Record spend transaction
  await supabase.from("tasalbar_transactions").insert({
    user_id: user.id,
    amount: -bundleCost,
    type: "spend",
    description: `Цуврал бүхлээр нээсэн (96 цаг)`,
  });

  // Credit creator (80%)
  await supabase.rpc("increment_balance", {
    user_id: series.creator_id,
    amount: creatorShare,
  });

  // Record creator earning (one record for bundle)
  await supabase.from("creator_earnings").insert({
    creator_id: series.creator_id,
    buyer_id: user.id,
    total_tasalbar: bundleCost,
    creator_share: creatorShare,
    platform_share: platformShare,
  });

  // Record creator earn transaction
  await supabase.from("tasalbar_transactions").insert({
    user_id: series.creator_id,
    amount: creatorShare,
    type: "earn",
    description: `Цуврал багц орлого`,
  });

  return { success: true, expiresAt, unlockedCount: episodesToUnlock.length };
}
