import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/";

  // Handle OAuth errors (e.g., user denied access, provider error)
  if (error) {
    const errorMsg = errorDescription || error;
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorMsg)}`
    );
  }

  if (code) {
    const supabase = await createServerSupabase();
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    if (data.session) {
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

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
