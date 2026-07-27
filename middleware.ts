import { NextResponse } from "next/server";

// Supabase auth is not connected in this deployment — run wide open so
// the app can be reviewed without a backend. Restore the Supabase-backed
// session check here once auth is wired up.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
