"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function updateActiveSession(sessionId: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("profiles")
    .update({ active_session_id: sessionId })
    .eq("id", user.id);
}

export async function getActiveSession(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("active_session_id")
    .eq("id", user.id)
    .single();

  return data?.active_session_id ?? null;
}
