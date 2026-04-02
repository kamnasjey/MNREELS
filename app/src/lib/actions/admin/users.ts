"use server";

import { requireAdmin } from "./helpers";

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
