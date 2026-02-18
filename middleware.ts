import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// 인증이 필요한 보호된 라우트
const PROTECTED_ROUTES = ["/dashboard", "/settings"];

// 이미 로그인한 경우 접근을 막을 인증 라우트
const AUTH_ROUTES = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const pathname = nextUrl.pathname;

  // 보호된 라우트에 비로그인 상태로 접근
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 이미 로그인한 상태에서 인증 라우트 접근
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // 정적 파일 및 API 라우트 제외
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
