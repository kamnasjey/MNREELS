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

// Unlock episode with tasalbar
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

  // Check if already purchased
  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .single();

  if (existing) return { success: true, alreadyPurchased: true };

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
  const creatorShare = Math.round(cost * 0.85);
  const platformShare = cost - creatorShare;
  const creatorId = (episode.series as any).creator_id;

  // Execute purchase (deduct, record, split)
  // Deduct from buyer
  await supabase.rpc("increment_balance", {
    user_id: user.id,
    amount: -cost,
  });

  // Record purchase
  await supabase.from("purchases").insert({
    user_id: user.id,
    episode_id: episodeId,
    tasalbar_spent: cost,
  });

  // Record spend transaction
  await supabase.from("tasalbar_transactions").insert({
    user_id: user.id,
    amount: -cost,
    type: "spend",
    description: `Анги нээсэн`,
    episode_id: episodeId,
  });

  // Credit creator (85%)
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

  return { success: true };
}
