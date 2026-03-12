import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      // Update active_session_id for single-device enforcement
      const sessionId = data.session.access_token.slice(-16);
      await supabase
        .from("profiles")
        .update({ active_session_id: sessionId })
        .eq("id", data.session.user.id);

      // Desktop -> creator dashboard
      const headerList = await headers();
      const ua = headerList.get("user-agent") ?? "";
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          ua
        );

      if (!isMobile && next === "/") {
        return NextResponse.redirect(`${origin}/creator`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
