"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function updateDisplayName(displayName: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Нэвтрэх шаардлагатай" };

  const trimmed = displayName.trim();
  if (!trimmed || trimmed.length < 1) {
    return { success: false, error: "Нэр хоосон байж болохгүй" };
  }
  if (trimmed.length > 50) {
    return { success: false, error: "Нэр 50 тэмдэгтээс хэтрэхгүй байх ёстой" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", user.id);

  if (error) return { success: false, error: "Алдаа: " + error.message };
  return { success: true };
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Нэвтрэх шаардлагатай" };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) return { success: false, error: "Алдаа: " + error.message };
  return { success: true };
}

export async function getMyProfile() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, payment_id, is_creator, is_admin, tasalbar_balance, avatar_url")
    .eq("id", user.id)
    .single();

  return profile;
}
