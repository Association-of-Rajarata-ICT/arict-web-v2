import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for the admin area: if there is no session cookie at all,
 * send the visitor to the login page. Real authorization happens server-side
 * in every admin page and Server Action (lib/auth/session.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession =
    request.cookies.has("authjs.session-token") || request.cookies.has("__Secure-authjs.session-token");
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
