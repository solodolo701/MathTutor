import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import type { NextRequest } from "next/server";
import { DEMO_MODE } from "@/lib/demo/config";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const lang = cookieLocale && isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const next = searchParams.get("next") ?? `/${lang}/app/dashboard`;

  if (DEMO_MODE) {
    return NextResponse.redirect(`${origin}/${lang}/app/dashboard`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/${lang}/login?error=auth_callback_failed`);
}
