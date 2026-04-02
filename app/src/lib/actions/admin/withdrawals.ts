"use server";

import { requireAdmin } from "./helpers";
import { safeIncrementBalance } from "./helpers";

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
      await safeIncrementBalance(supabase, withdrawal.creator_id, withdrawal.tasalbar_amount);

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
