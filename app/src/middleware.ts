import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Public routes — pages handle their own auth
const publicRoutes = ["/auth", "/terms", "/landing", "/watch", "/series", "/profile", "/tasalbar", "/following", "/search"];

// Desktop allowed routes
const desktopAllowedPrefixes = ["/creator", "/admin", "/auth", "/terms", "/landing", "/api", "/watch", "/series", "/profile", "/tasalbar", "/following", "/search"];

function isMobileUA(ua: string): boolean {
  return /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static assets and API routes
  if (path.startsWith("/api/") || path.startsWith("/_next/")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const ua = request.headers.get("user-agent") ?? "";
  const isPublic = path === "/" || publicRoutes.some((route) => path.startsWith(route));

  // Desktop restriction (skip on localhost for dev testing)
  const host = request.headers.get("host") ?? "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  if (!isLocalhost && !isMobileUA(ua) && !desktopAllowedPrefixes.some(p => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  // For public routes: use fast getSession() (local cookie read, no network call)
  // For protected routes: use getUser() (validates with Supabase server, refreshes token)
  let user = null;
  if (isPublic) {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user ?? null;
  } else {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // Logged-in user on login page → redirect home
  if (user && path.startsWith("/auth/login")) {
    const url = request.nextUrl.clone();
    url.pathname = isMobileUA(ua) ? "/" : "/creator";
    return NextResponse.redirect(url);
  }

  // Unauthenticated on protected route → redirect to login
  if (!isPublic && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    if (path !== "/") {
      url.searchParams.set("next", path);
    }
    return NextResponse.redirect(url);
  }

  // Admin route protection
  if (user && path.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
