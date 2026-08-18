import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessAdmin, canManageUsers } from "@/lib/roles";

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const role = typeof request.auth?.user?.role === "string" ? request.auth.user.role : null;

  if (pathname.startsWith("/organisateur")) {
    if (!request.auth?.user) {
      const loginUrl = new URL("/connexion", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/scan")) {
    if (!request.auth?.user) {
      const loginUrl = new URL("/connexion", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/compte")) {
    if (!request.auth?.user) {
      const loginUrl = new URL("/connexion", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!request.auth?.user) {
      const loginUrl = new URL("/connexion", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!canAccessAdmin(role)) {
      return NextResponse.redirect(new URL("/compte", request.nextUrl.origin));
    }
    if (pathname.startsWith("/admin/users") && !canManageUsers(role)) {
      return NextResponse.redirect(new URL("/admin", request.nextUrl.origin));
    }
  }

  return NextResponse.next();
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
