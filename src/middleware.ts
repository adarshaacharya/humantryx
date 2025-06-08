import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { type Session } from "@/server/auth";

const protectedRoutes = ["/dashboard", "/admin"];
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/forgot-password",
  "/auth-callback",
];

const organizationRoutes = ["/organization-setup"];

export default async function authMiddleware(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const pathName = request.nextUrl.pathname;

  const isAuthRoute = authRoutes.includes(pathName);
  const isProtectedRoute =
    protectedRoutes.includes(pathName) ||
    pathName.startsWith("/dashboard") ||
    pathName.startsWith("/admin");
  const isOrganizationRoute = organizationRoutes.includes(pathName);
  const isAdminRoute = pathName.startsWith("/admin");

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: env.BETTER_AUTH_URL,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  // if user is superadmin and trying to access dashboard, redirect to admin
  if (session?.user?.role === "super_admin" && pathName === "/dashboard") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // If trying to access admin routes without super_admin role
  if (isAdminRoute && (!session || session.user.role !== "super_admin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is authenticated but email is not verified
  if (
    session?.user &&
    !session.user.emailVerified &&
    pathName !== "/verify-email" &&
    pathName !== "/auth-callback"
  ) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  // If authenticated with verified email and trying to access auth routes
  if (isAuthRoute && session?.user?.emailVerified) {
    if (session.user.role === "super_admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Skip organization check for auth-callback as it handles pending invitations
    if (pathName === "/auth-callback") {
      return NextResponse.next();
    }

    // if (!session.session.activeOrganizationId) {
    //   return NextResponse.redirect(new URL("/organization-setup", request.url));
    // }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If verified user without organization tries to access protected routes (except super admins)
  if (
    isProtectedRoute &&
    session?.user?.emailVerified &&
    !session.session.activeOrganizationId &&
    session.user.role !== "super_admin" &&
    !pathName.startsWith("/accept-invitation") &&
    pathName !== "/auth-callback"
  ) {
    return NextResponse.redirect(new URL("/organization-setup", request.url));
  }

  // If user with organization tries to access organization setup, redirect to dashboard
  // (skip for super admins as they don't need organizations)
  if (
    isOrganizationRoute &&
    session?.user?.emailVerified &&
    (session.session.activeOrganizationId ||
      session.user.role === "super_admin")
  ) {
    return NextResponse.redirect(
      new URL(
        session.user.role === "super_admin" ? "/admin" : "/dashboard",
        request.url,
      ),
    );
  }

  // If trying to access protected routes without authentication
  if (isProtectedRoute && !session) {
    let callbackUrl = request.nextUrl.pathname;

    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodeedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${encodeedCallbackUrl}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|$).*)",
  ],
};
