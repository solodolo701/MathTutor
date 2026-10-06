import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, isLocale, matchLocale } from "./lib/i18n/config";

/**
 * Locale routing.
 *
 * This is `proxy.ts`, not `middleware.ts`. Next.js 16 deprecated the
 * middleware convention, and on Vercel it still deploys as an Edge Function,
 * which previously failed to bundle and returned MIDDLEWARE_INVOCATION_FAILED
 * on every request. Proxy defaults to the Node.js runtime and avoids that.
 * The import below is relative for the same reason — the Edge bundler did not
 * resolve the `@/` alias here, even though it works everywhere else.
 */

const COOKIE = "NEXT_LOCALE";

/** Paths that must never be redirected into a locale. */
function isExempt(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname) // any static asset with an extension
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isExempt(pathname)) return NextResponse.next();

  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) {
    // Already localised. Remember it so a direct visit to /de/... keeps
    // German on the next bare-path visit.
    const response = NextResponse.next();
    if (request.cookies.get(COOKIE)?.value !== first) {
      response.cookies.set(COOKIE, first, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  // An explicit earlier choice outranks the browser's header: someone who
  // switched to English should not be bounced back by their OS language.
  const saved = request.cookies.get(COOKIE)?.value;
  const locale =
    saved && isLocale(saved) ? saved : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Everything except Next internals and files with an extension; the
    // handler re-checks anyway, this just avoids waking it needlessly.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};

export { LOCALES, DEFAULT_LOCALE };
