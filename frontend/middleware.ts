import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/favorites", "/bookings", "/apply", "/dashboard"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function hasCognitoTokenCookie(req: NextRequest) {
  // Amplify/Cognito typically stores tokens in cookies like:
  // CognitoIdentityServiceProvider.<clientId>.<username>.idToken
  // Names vary, so we do a contains match.
  const cookies = req.cookies.getAll();
  return cookies.some((c) => c.name.includes("CognitoIdentityServiceProvider") && c.name.endsWith(".idToken"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtectedPath(pathname)) return NextResponse.next();

  // NOTE: Amplify v6 commonly stores tokens in localStorage (not cookies),
  // so a strict cookie check can cause redirect loops even when authenticated.
  // We only enforce redirects when an auth cookie is present; otherwise let the
  // client-side ProtectedRoute handle it.
  if (!hasCognitoTokenCookie(req)) return NextResponse.next();

  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/favorites/:path*", "/bookings/:path*", "/apply/:path*", "/dashboard/:path*"],
};

