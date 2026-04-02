"use server";

import { requireAdmin } from "./helpers";
import { safeIncrementBalance } from "./helpers";

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
  try {
    const { supabase } = await requireAdmin();

    // Get purchase info
    const { data: purchase } = await supabase
      .from("tasalbar_purchases")
      .select("user_id, tasalbar_amount, status")
      .eq("id", purchaseId)
      .single();

    if (!purchase) return { success: false, error: "Хүсэлт олдсонгүй" };
    if (purchase.status !== "pending") return { success: false, error: "Аль хэдийн шийдвэрлэсэн" };

    // Update status
    const { error: updateError } = await supabase
      .from("tasalbar_purchases")
      .update({ status: "approved", processed_at: new Date().toISOString() })
      .eq("id", purchaseId);

    if (updateError) return { success: false, error: "Алдаа: " + updateError.message };

    // Credit tasalbar to user
    await safeIncrementBalance(supabase, purchase.user_id, purchase.tasalbar_amount);

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
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Тодорхойгүй алдаа" };
  }
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
