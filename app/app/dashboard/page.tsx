import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/types/supabase";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: profile }, { data: userSkills }, { data: streak }, { data: weekXp }, { data: skills }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_skills").select("*").eq("user_id", user.id),
      supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      supabase.from("xp_events").select("amount").eq("user_id", user.id).gte("created_at", weekStart),
      supabase.from("skills").select("id, name_hu").limit(20),
    ]);

  const totalWeekXp = weekXp?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const masteredCount = userSkills?.filter((us) => us.p_know >= 0.8).length ?? 0;
  const totalSkillCount = skills?.length ?? 10;
  const streakDays = streak?.current ?? 0;
  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Tanuló";

  // Build week dots: streak days elapsed this week (Mon–today)
  const today = new Date();
  const weekDayIndex = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const weekDots = Array.from({ length: 7 }, (_, i) => ({
    filled: i <= weekDayIndex && streakDays > (weekDayIndex - i),
  }));

  // Daily quest progress (mocked from real data)
  const dailySkillId = (userSkills ?? []).find((us) => us.p_know > 0 && us.p_know < 0.8)?.skill_id
    ?? skills?.[0]?.id ?? "linear-equations";
  const dailySkillName =
    skills?.find((s) => s.id === dailySkillId)?.name_hu ?? "Lineáris egyenletek";

  const questProgress = Math.min(userSkills?.length ?? 0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Greeting */}
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--color-ink)" }}>
        Szia, {displayName}! Készen állsz a mai adagra?
      </div>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Task card */}
        <div
          style={{
            background: "linear-gradient(135deg,#5B4FE0,#4238B8)",
            borderRadius: 20,
            padding: 28,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              opacity: 0.8,
            }}
          >
            Mai feladat
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{dailySkillName}</div>
          <div style={{ fontSize: 14, opacity: 0.85 }}>7 feladat · kb. 15 perc</div>
          <Link
            href={`/app/practice/${dailySkillId}`}
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              background: "#fff",
              color: "#4238B8",
              border: "none",
              padding: "12px 22px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            Gyakorlás indítása
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Streak card */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D98324"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flame-flicker"
            >
              <path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c0-2-1-3-1-4 2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-6 5-9z" />
            </svg>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-ink)" }}>
              {streakDays} napos sorozat
            </div>
          </div>

          {/* Week dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {weekDots.map((dot, i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: dot.filled ? "var(--color-amber)" : "transparent",
                  border: `2px solid ${dot.filled ? "var(--color-amber)" : "var(--color-border)"}`,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Shield footnote */}
          {(streak?.shields_available ?? 0) > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-muted)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 3v6c0 5-4 9-8 10C8 21 4 17 4 12V6l8-3z" />
              </svg>
              {streak?.shields_available} sorozat-pajzsod van — egy kihagyott nap sem törli a sorozatot
            </div>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { label: "Elsajátított készségek", value: `${masteredCount} / ${totalSkillCount}` },
          { label: "Heti XP", value: totalWeekXp },
          { label: "Csapat helyezés", value: "#3" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--color-faint)",
                letterSpacing: ".04em",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "var(--color-ink)",
                marginTop: 4,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Daily quests */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 20,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-ink)", marginBottom: 14 }}>
          Napi küldetések
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              label: "Oldj meg 5 lineáris egyenletet",
              done: questProgress,
              total: 5,
              iconBg: "#E9E6FB",
              iconColor: "var(--color-primary)",
              iconPath: "M9 12l2 2 4-4",
            },
            {
              label: "Segíts egy csapattársnak egy tippel",
              done: 0,
              total: 1,
              iconBg: "#FBEBD3",
              iconColor: "var(--color-amber)",
              iconPath: "M12 2l2 7h7l-6 4 2 7-5-4-5 4 2-7-6-4h7z",
            },
            {
              label: "Fejezz be egy teljes napi gyakorlást",
              done: masteredCount > 0 ? 1 : 0,
              total: 1,
              iconBg: "#E4F5EC",
              iconColor: "var(--color-success)",
              iconPath: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
            },
          ].map((quest) => {
            const pct = Math.round((quest.done / quest.total) * 100);
            return (
              <div
                key={quest.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "var(--color-surface)",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                {/* Icon chip */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: quest.iconBg,
                    color: quest.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={quest.iconPath} />
                  </svg>
                </div>

                {/* Label + progress bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)", marginBottom: 6 }}>
                    {quest.label}
                  </div>
                  <div style={{ height: 6, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "var(--color-primary)",
                        borderRadius: 4,
                        transition: "width 0.4s ease-out",
                      }}
                    />
                  </div>
                </div>

                {/* Count */}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-muted)",
                    flexShrink: 0,
                  }}
                >
                  {quest.done}/{quest.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Season progress */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 20,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-ink)" }}>
            Egyenletek Kora — szezon
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-muted)" }}>
            {masteredCount * 2} / 30 mérföldkő
          </div>
        </div>
        <div
          style={{
            height: 10,
            background: "var(--color-surface-2)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(Math.round((masteredCount * 2 / 30) * 100), 100)}%`,
              background: "linear-gradient(90deg,#E8A33D,#5B4FE0)",
              borderRadius: 6,
              transition: "width 0.4s ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
}
