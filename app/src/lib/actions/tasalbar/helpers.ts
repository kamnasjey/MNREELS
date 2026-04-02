"use server";

import { SupabaseClient } from "@supabase/supabase-js";

// Helper: increment balance with fallback if RPC not available
export async function safeIncrementBalance(supabase: SupabaseClient, userId: string, amount: number) {
  const { error } = await supabase.rpc("increment_balance", {
    user_id: userId,
    amount,
  });
  if (error) {
    // Fallback: direct update
    const { data: profile } = await supabase
      .from("profiles")
      .select("tasalbar_balance")
      .eq("id", userId)
      .single();
    const current = profile?.tasalbar_balance ?? 0;
    const { error: directErr } = await supabase
      .from("profiles")
      .update({ tasalbar_balance: current + amount })
      .eq("id", userId);
    if (directErr) throw new Error("Үлдэгдэл шинэчлэхэд алдаа: " + directErr.message);
  }
}
