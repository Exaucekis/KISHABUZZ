import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessAdmin, canManageUsers } from "@/lib/roles";

const NO_STORE = "private, no-cache, no-store, max-age=0, must-revalidate";

function withNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", NO_STORE);
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return response;
}

function loginRedirect(origin: string, pathname: string) {
  const loginUrl = new URL("/connexion", origin);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return withNoStore(NextResponse.redirect(loginUrl));
}

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;
  const role = typeof request.auth?.user?.role === "string" ? request.auth.user.role : null;

  if (pathname.startsWith("/organisateur") || pathname.startsWith("/scan") || pathname.startsWith("/compte")) {
    if (!request.auth?.user) return loginRedirect(origin, pathname);
    return withNoStore(NextResponse.next());
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!request.auth?.user) return loginRedirect(origin, pathname);
    if (!canAccessAdmin(role)) {
      return withNoStore(NextResponse.redirect(new URL("/compte", origin)));
    }
    if (pathname.startsWith("/admin/users") && !canManageUsers(role)) {
      return withNoStore(NextResponse.redirect(new URL("/admin", origin)));
    }
  }

  return withNoStore(NextResponse.next());
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/compte",
    "/compte/:path*",
    "/scan",
    "/scan/:path*",
    "/organisateur",
    "/organisateur/:path*",
  ],
};
