import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import type { Session } from "@/server/auth";

const protectedRoutes = ["/dashboard"];
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/forgot-password",
];

export default async function authMiddleware(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const pathName = request.nextUrl.pathname;

  const isAuthRoute = authRoutes.includes(pathName);
  const isProtectedRoute = protectedRoutes.includes(pathName);

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: env.BETTER_AUTH_URL,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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
