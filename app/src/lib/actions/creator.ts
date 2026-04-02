"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

async function safeIncrementBalance(supabase: SupabaseClient, userId: string, amount: number) {
  const { error } = await supabase.rpc("increment_balance", { user_id: userId, amount });
  if (error) {
    const { data: profile } = await supabase.from("profiles").select("tasalbar_balance").eq("id", userId).single();
    const { error: directErr } = await supabase.from("profiles").update({ tasalbar_balance: (profile?.tasalbar_balance ?? 0) + amount }).eq("id", userId);
    if (directErr) throw new Error("Үлдэгдэл шинэчлэхэд алдаа: " + directErr.message);
  }
}

export async function registerAsCreator(formData: {
  displayName: string;
  phone: string;
  bankName: string;
  bankAccount: string;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: formData.displayName,
      phone: formData.phone,
      bank_name: formData.bankName,
      bank_account: formData.bankAccount,
      is_creator: true,
    })
    .eq("id", user.id);

  if (error) throw new Error("Бүртгэхэд алдаа: " + error.message);
  return { success: true };
}

export async function getCreatorDashboard() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) return null;

  // Get series
  const { data: series } = await supabase
    .from("series")
    .select("*, episodes(count, views:views.sum())")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  // Get total earnings
  const { data: earnings } = await supabase
    .from("creator_earnings")
    .select("creator_share")
    .eq("creator_id", user.id)
    .eq("is_withdrawn", false);

  const totalEarnings = earnings?.reduce((sum, e) => sum + e.creator_share, 0) ?? 0;

  // Get total views
  const { data: viewData } = await supabase
    .from("episodes")
    .select("views, series!inner(creator_id)")
    .eq("series.creator_id", user.id);

  const totalViews = viewData?.reduce((sum, e) => sum + (e as { views: number }).views, 0) ?? 0;

  return {
    profile,
    series: series ?? [],
    totalEarnings,
    totalViews,
  };
}

export async function requestWithdrawal(amount: number) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтрэх шаардлагатай");

  const { data: profile } = await supabase
    .from("profiles")
    .select("bank_name, bank_account, tasalbar_balance")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Профайл олдсонгүй");
  if (!profile.bank_name || !profile.bank_account) throw new Error("Банкны мэдээлэл бүрэн биш");
  if (profile.tasalbar_balance < amount) throw new Error("Үлдэгдэл хүрэхгүй");

  const { error } = await supabase.from("withdrawals").insert({
    creator_id: user.id,
    tasalbar_amount: amount,
    tugrug_amount: amount * 50,
    bank_name: profile.bank_name,
    bank_account: profile.bank_account,
  });

  if (error) throw new Error("Хүсэлт илгээхэд алдаа");

  // Deduct balance
  await safeIncrementBalance(supabase, user.id, -amount);

  // Record transaction
  await supabase.from("tasalbar_transactions").insert({
    user_id: user.id,
    amount: -amount,
    type: "withdraw",
    description: `${amount} тасалбар татсан (${amount * 50}₮)`,
  });

  return { success: true };
}
