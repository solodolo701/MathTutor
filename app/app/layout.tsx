import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IconRail } from "@/components/layout/IconRail";
import { GlobalHeader } from "@/components/layout/GlobalHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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

  const todayXp = xpToday?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-surface)" }}>
      <IconRail />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <GlobalHeader streakCount={streak?.current ?? 0} xpToday={todayXp} />

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
