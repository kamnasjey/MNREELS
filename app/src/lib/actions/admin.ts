"use server";

import { createServerSupabase } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Админ эрх шаардлагатай");
  return { supabase, user };
}

// ============ DASHBOARD STATS ============

export async function getAdminStats() {
  const { supabase } = await requireAdmin();

  const [usersResult, creatorsResult, pendingEpisodesResult, pendingWithdrawalsResult, pendingPurchasesResult, recentTransactionsResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_creator", true),
    supabase.from("episodes").select("*", { count: "exact", head: true }).eq("status", "moderation"),
    supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tasalbar_purchases").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tasalbar_transactions").select("amount").eq("type", "buy"),
  ]);

  const totalRevenue = (recentTransactionsResult.data ?? []).reduce(
    (sum: number, t: { amount: number }) => sum + t.amount, 0
  );

  return {
    totalUsers: usersResult.count ?? 0,
    totalCreators: creatorsResult.count ?? 0,
    pendingEpisodes: pendingEpisodesResult.count ?? 0,
    pendingWithdrawals: pendingWithdrawalsResult.count ?? 0,
    pendingPurchases: pendingPurchasesResult.count ?? 0,
    totalRevenue,
  };
}

// ============ EPISODE MODERATION ============

export async function getPendingEpisodes() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("episodes")
    .select(`
      id, title, episode_number, status, video_url, created_at,
      series:series_id(id, title, creator_id, profiles:creator_id(display_name))
    `)
    .in("status", ["moderation", "processing"])
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function approveEpisode(episodeId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("episodes")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", episodeId);

  if (error) throw new Error("Зөвшөөрөхөд алдаа: " + error.message);
  return { success: true };
}

export async function rejectEpisode(episodeId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("episodes")
    .update({ status: "rejected" })
    .eq("id", episodeId);

  if (error) throw new Error("Татгалзахад алдаа: " + error.message);
  return { success: true };
}

export async function getAllEpisodes() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("episodes")
    .select(`
      id, title, episode_number, status, views, video_url, created_at, published_at,
      series:series_id(id, title, profiles:creator_id(display_name))
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}

// ============ WITHDRAWAL MANAGEMENT ============

export async function getPendingWithdrawals() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("withdrawals")
    .select(`
      id, tasalbar_amount, tugrug_amount, bank_name, bank_account, status, created_at, processed_at,
      profiles:creator_id(display_name, phone)
    `)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function processWithdrawal(withdrawalId: string, action: "processing" | "completed" | "rejected") {
  const { supabase } = await requireAdmin();

  const updateData: Record<string, unknown> = { status: action };
  if (action === "completed" || action === "rejected") {
    updateData.processed_at = new Date().toISOString();
  }

  // If rejecting, refund the balance
  if (action === "rejected") {
    const { data: withdrawal } = await supabase
      .from("withdrawals")
      .select("creator_id, tasalbar_amount")
      .eq("id", withdrawalId)
      .single();

    if (withdrawal) {
      await supabase.rpc("increment_balance", {
        user_id: withdrawal.creator_id,
        amount: withdrawal.tasalbar_amount,
      });

      await supabase.from("tasalbar_transactions").insert({
        user_id: withdrawal.creator_id,
        amount: withdrawal.tasalbar_amount,
        type: "earn",
        description: "Татах хүсэлт буцаагдсан",
      });
    }
  }

  const { error } = await supabase
    .from("withdrawals")
    .update(updateData)
    .eq("id", withdrawalId);

  if (error) throw new Error("Алдаа: " + error.message);
  return { success: true };
}

// ============ USER/CREATOR MANAGEMENT ============

export async function getAllUsers() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, is_creator, creator_verified, is_admin, tasalbar_balance, created_at, phone, bank_name")
    .order("created_at", { ascending: false })
    .limit(200);

  return data ?? [];
}

export async function getAllCreators() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, phone, bank_name, bank_account, creator_verified, tasalbar_balance, created_at")
    .eq("is_creator", true)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function verifyCreator(creatorId: string, verified: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ creator_verified: verified })
    .eq("id", creatorId);

  if (error) throw new Error("Алдаа: " + error.message);
  return { success: true };
}

export async function setAdmin(userId: string, isAdmin: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) throw new Error("Алдаа: " + error.message);
  return { success: true };
}

// ============ TASALBAR PURCHASES ============

export async function getPendingPurchases() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("tasalbar_purchases")
    .select(`
      id, payment_id, package_id, tasalbar_amount, tugrug_amount, transfer_description, status, created_at, processed_at,
      profiles:user_id(display_name, username, payment_id)
    `)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function approvePurchase(purchaseId: string) {
  const { supabase } = await requireAdmin();

  // Get purchase info
  const { data: purchase } = await supabase
    .from("tasalbar_purchases")
    .select("user_id, tasalbar_amount, status")
    .eq("id", purchaseId)
    .single();

  if (!purchase) throw new Error("Хүсэлт олдсонгүй");
  if (purchase.status !== "pending") throw new Error("Аль хэдийн шийдвэрлэсэн");

  // Update status
  const { error: updateError } = await supabase
    .from("tasalbar_purchases")
    .update({ status: "approved", processed_at: new Date().toISOString() })
    .eq("id", purchaseId);

  if (updateError) throw new Error("Алдаа: " + updateError.message);

  // Credit tasalbar to user
  const { error: balError } = await supabase.rpc("increment_balance", {
    user_id: purchase.user_id,
    amount: purchase.tasalbar_amount,
  });

  if (balError) throw new Error("Үлдэгдэл шинэчлэхэд алдаа: " + balError.message);

  // Record transaction
  await supabase.from("tasalbar_transactions").insert({
    user_id: purchase.user_id,
    amount: purchase.tasalbar_amount,
    type: "buy",
    description: `${purchase.tasalbar_amount} тасалбар худалдаж авсан (банк шилжүүлэг)`,
    payment_method: "bank",
    payment_ref: purchaseId,
  });

  return { success: true };
}

export async function rejectPurchase(purchaseId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("tasalbar_purchases")
    .update({ status: "rejected", processed_at: new Date().toISOString() })
    .eq("id", purchaseId);

  if (error) throw new Error("Алдаа: " + error.message);
  return { success: true };
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
