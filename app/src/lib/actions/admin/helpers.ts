"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// Helper: increment balance with fallback if RPC not available
export async function safeIncrementBalance(supabase: SupabaseClient, userId: string, amount: number) {
  const { error } = await supabase.rpc("increment_balance", {
    user_id: userId,
    amount,
  });
  if (error) {
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

export async function requireAdmin() {
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
