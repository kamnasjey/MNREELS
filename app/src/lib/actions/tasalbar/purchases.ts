"use server";

import { createServerSupabase } from "@/lib/supabase/server";

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
