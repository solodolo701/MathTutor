import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IconRail } from "@/components/layout/IconRail";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { DEMO_MODE } from "@/lib/demo/config";
import { demoState } from "@/lib/demo/data";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  let streakCount = 0;
  let todayXp = 0;

  if (DEMO_MODE) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    streakCount = demoState.streak.current;
    todayXp = demoState.xpEvents
      .filter((e) => new Date(e.created_at) >= todayStart)
      .reduce((sum, e) => sum + e.amount, 0);
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect(`/${lang}/login`);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ data: streak }, { data: xpToday }] = await Promise.all([
      supabase.from("streaks").select("current").eq("user_id", user.id).single(),
      supabase
        .from("xp_events")
        .select("amount")
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString()),
    ]);

    streakCount = streak?.current ?? 0;
    todayXp = xpToday?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-surface)" }}>
      <IconRail lang={lang} nav={dict.nav} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <GlobalHeader
          lang={lang}
          dict={dict}
          streakCount={streakCount}
          xpToday={todayXp}
        />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 32,
          }}
        >
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
