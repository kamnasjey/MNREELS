import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/auth", "/terms", "/landing"];

// Routes allowed on desktop (creator content management only)
const desktopAllowedPrefixes = ["/creator", "/admin", "/auth", "/terms", "/landing", "/api"];

function isMobileUA(ua: string): boolean {
  return /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const ua = request.headers.get("user-agent") ?? "";

  // Desktop restriction: only allow creator/admin/auth routes
  if (!isMobileUA(ua) && !desktopAllowedPrefixes.some(p => path.startsWith(p))) {
    // Desktop trying to access mobile-only routes → redirect to landing
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  // Allow public routes without auth
  const isPublic = publicRoutes.some((route) => path.startsWith(route));

  // Redirect unauthenticated users to login (except public routes)
  if (!isPublic && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    if (path !== "/") {
      url.searchParams.set("next", path);
    }
    return NextResponse.redirect(url);
  }

  // Session enforcement: check active_session_id
  if (user && !isPublic) {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      const currentSessionId = session.session.access_token.slice(-16);

      const { data: profile } = await supabase
        .from("profiles")
        .select("active_session_id")
        .eq("id", user.id)
        .single();

      if (
        profile?.active_session_id &&
        profile.active_session_id !== currentSessionId
      ) {
        // Another device logged in — force logout
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set("kicked", "true");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
