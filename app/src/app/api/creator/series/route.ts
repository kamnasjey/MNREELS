import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("series")
    .select("id, title")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}
