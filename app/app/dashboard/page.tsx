import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo/config";
import { DEMO_PROFILE, DEMO_SKILLS, demoState } from "@/lib/demo/data";

/* Page-scoped motion. Kept here (not in globals.css) so this file owns its
   own choreography, and every rule is disabled under prefers-reduced-motion. */
const DASH_CSS = `
@keyframes dashRise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dash-rise {
  animation: dashRise .5s cubic-bezier(.16,1,.3,1) both;
  animation-delay: var(--d, 0s);
}
@keyframes dashGrow { from { width: 0; } }
.dash-bar {
  animation: dashGrow .9s cubic-bezier(.16,1,.3,1) both;
  animation-delay: var(--d, .25s);
}
@keyframes dashDot {
  from { opacity: 0; transform: scale(.3); }
  to   { opacity: 1; transform: scale(1); }
}
.dash-dot {
  animation: dashDot .38s cubic-bezier(.34,1.56,.64,1) both;
  animation-delay: var(--d, 0s);
}
.dash-cta svg { transition: transform .18s ease; }
.dash-cta:hover svg { transform: translateX(3px); }
.dash-quest { transition: background .18s ease, border-color .18s ease; }
.dash-quest:hover { background: var(--color-surface-2); }
@media (prefers-reduced-motion: reduce) {
  .dash-rise, .dash-bar, .dash-dot { animation: none; opacity: 1; transform: none; }
  .dash-cta:hover svg { transform: none; }
}
`;

export default async function DashboardPage() {
  let displayName: string;
  let totalWeekXp: number;
  let masteredCount: number;
  let totalSkillCount: number;
  let streakDays: number;
  let shieldsAvailable: number;
  let dailySkillId: string;
  let dailySkillName: string;
  let questProgress: number;

  if (DEMO_MODE) {
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    displayName = DEMO_PROFILE.display_name;
    totalWeekXp = demoState.xpEvents
      .filter((e) => new Date(e.created_at) >= weekStart)
      .reduce((sum, e) => sum + e.amount, 0);
    const userSkillEntries = Array.from(demoState.userSkills.entries());
    masteredCount = userSkillEntries.filter(([, us]) => us.p_know >= 0.8).length;
    totalSkillCount = DEMO_SKILLS.length;
    streakDays = demoState.streak.current;
    shieldsAvailable = demoState.streak.shields_available;

    const inProgress = userSkillEntries.find(([, us]) => us.p_know > 0 && us.p_know < 0.8);
    dailySkillId = inProgress?.[0] ?? DEMO_SKILLS[0].id;
    dailySkillName = DEMO_SKILLS.find((s) => s.id === dailySkillId)?.name_hu ?? "Lineáris egyenletek";
    questProgress = Math.min(userSkillEntries.length, 5);
  } else {
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

    totalWeekXp = weekXp?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
    masteredCount = userSkills?.filter((us) => us.p_know >= 0.8).length ?? 0;
    totalSkillCount = skills?.length ?? 10;
    streakDays = streak?.current ?? 0;
    shieldsAvailable = streak?.shields_available ?? 0;
    displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Tanuló";

    dailySkillId = (userSkills ?? []).find((us) => us.p_know > 0 && us.p_know < 0.8)?.skill_id
      ?? skills?.[0]?.id ?? "linear-equations";
    dailySkillName =
      skills?.find((s) => s.id === dailySkillId)?.name_hu ?? "Lineáris egyenletek";

    questProgress = Math.min(userSkills?.length ?? 0, 5);
  }

  // Build week dots: streak days elapsed this week (Mon–today)
  const today = new Date();
  const weekDayIndex = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const WEEKDAY_LABELS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
  const weekDots = Array.from({ length: 7 }, (_, i) => ({
    filled: i <= weekDayIndex && streakDays > (weekDayIndex - i),
    isToday: i === weekDayIndex,
    isFuture: i > weekDayIndex,
    label: WEEKDAY_LABELS[i],
  }));

  const masteryPct = totalSkillCount > 0 ? Math.round((masteredCount / totalSkillCount) * 100) : 0;
  const seasonMilestones = masteredCount * 2;
  const seasonPct = Math.min(Math.round((seasonMilestones / 30) * 100), 100);

  const greeting =
    streakDays > 0
      ? `Ma is tartod a sorozatot — ${streakDays}. nap. Egy rövid kör, és megvan.`
      : "Egy 15 perces kör most elindítja a sorozatodat.";

  const quests = [
    {
      label: "Oldj meg 5 lineáris egyenletet",
      done: questProgress,
      total: 5,
      accent: "var(--color-primary)",
      iconPath: "M9 12l2 2 4-4",
    },
    {
      label: "Segíts egy csapattársnak egy tippel",
      done: 0,
      total: 1,
      accent: "var(--color-amber-darker)",
      iconPath: "M12 2l2 7h7l-6 4 2 7-5-4-5 4 2-7-6-4h7z",
    },
    {
      label: "Fejezz be egy teljes napi gyakorlást",
      done: masteredCount > 0 ? 1 : 0,
      total: 1,
      accent: "var(--color-success)",
      iconPath: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
    },
  ];

  const questsDone = quests.filter((q) => q.done >= q.total).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style dangerouslySetInnerHTML={{ __html: DASH_CSS }} />

      {/* Greeting */}
      <div className="dash-rise">
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--color-ink)", margin: 0 }}>
          Szia, {displayName}!
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-muted)", margin: "6px 0 0" }}>
          {greeting}
        </p>
      </div>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Task card — the single most important action on the page */}
        <div
          className="dash-rise"
          style={
            {
              "--d": ".06s",
              background:
                "linear-gradient(135deg, var(--color-primary-solid), var(--color-primary-dark))",
              borderRadius: 20,
              padding: 28,
              color: "var(--color-on-primary)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: "var(--shadow-card)",
              position: "relative",
              overflow: "hidden",
            } as React.CSSProperties
          }
        >
          {/* Decorative depth — pure shape, no text on top of it */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: -60,
              top: -70,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "var(--color-on-primary)",
              opacity: 0.07,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              opacity: 0.85,
            }}
          >
            Mai feladat
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{dailySkillName}</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>7 feladat · kb. 15 perc · +70 XP</div>
          <Link
            href={`/app/practice/${dailySkillId}`}
            className="dash-cta hover-lift"
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              background: "var(--color-on-primary)",
              color: "var(--color-primary-solid)",
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
          className="dash-rise"
          style={
            {
              "--d": ".12s",
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 20,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            } as React.CSSProperties
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-amber-darker)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flame-flicker"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c0-2-1-3-1-4 2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-6 5-9z" />
            </svg>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-ink)" }}>
              {streakDays} napos sorozat
            </div>
          </div>

          {/* Week dots — labelled so the row reads as a calendar, not decoration */}
          <div style={{ display: "flex", gap: 8 }}>
            {weekDots.map((dot, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
              >
                <div
                  className="dash-dot"
                  title={dot.filled ? "Teljesítve" : dot.isFuture ? "Még hátra van" : "Kihagyva"}
                  style={
                    {
                      "--d": `${0.2 + i * 0.06}s`,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: dot.filled ? "var(--color-amber)" : "transparent",
                      border: `2px solid ${
                        dot.filled
                          ? "var(--color-amber)"
                          : dot.isToday
                            ? "var(--color-primary)"
                            : "var(--color-border)"
                      }`,
                      boxShadow: dot.isToday ? "var(--shadow-glow-streak)" : "none",
                      flexShrink: 0,
                    } as React.CSSProperties
                  }
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: dot.isToday ? "var(--color-primary)" : "var(--color-faint)",
                  }}
                >
                  {dot.label}
                </span>
              </div>
            ))}
          </div>

          {/* Shield footnote */}
          {shieldsAvailable > 0 && (
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 3l8 3v6c0 5-4 9-8 10C8 21 4 17 4 12V6l8-3z" />
              </svg>
              {shieldsAvailable} sorozat-pajzsod van — egy kihagyott nap sem törli a sorozatot
            </div>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          {
            label: "Elsajátított készségek",
            value: `${masteredCount} / ${totalSkillCount}`,
            pct: masteryPct,
            barColor: "var(--color-amber)",
          },
          {
            label: "Heti XP",
            value: totalWeekXp,
            pct: Math.min(Math.round((totalWeekXp / 500) * 100), 100),
            barColor: "var(--color-primary)",
          },
          {
            label: "Csapat helyezés",
            value: "#3",
            pct: null,
            barColor: "var(--color-primary)",
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="dash-rise"
            style={
              {
                "--d": `${0.18 + i * 0.06}s`,
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: 18,
              } as React.CSSProperties
            }
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
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.value}
            </div>
            {stat.pct !== null && (
              <div
                style={{
                  height: 5,
                  background: "var(--color-surface-2)",
                  borderRadius: 3,
                  overflow: "hidden",
                  marginTop: 10,
                }}
              >
                <div
                  className="dash-bar"
                  style={
                    {
                      "--d": `${0.35 + i * 0.06}s`,
                      height: "100%",
                      width: `${stat.pct}%`,
                      background: stat.barColor,
                      borderRadius: 3,
                    } as React.CSSProperties
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Daily quests */}
      <div
        className="dash-rise"
        style={
          {
            "--d": ".36s",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            padding: 24,
          } as React.CSSProperties
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 14,
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-ink)", margin: 0 }}>
            Napi küldetések
          </h2>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-muted)" }}>
            {questsDone}/{quests.length} kész
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {quests.map((quest, i) => {
            const complete = quest.done >= quest.total;
            const pct = Math.round((quest.done / quest.total) * 100);
            return (
              <div
                key={quest.label}
                className="dash-quest"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "var(--color-surface)",
                  border: `1px solid ${complete ? "var(--color-success)" : "transparent"}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                {/* Icon chip — accent on card so the mark keeps 3:1 in both themes */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "var(--color-card)",
                    border: `1.5px solid ${quest.accent}`,
                    color: quest.accent,
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
                  <div style={{ height: 6, background: "var(--color-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      className="dash-bar"
                      style={
                        {
                          "--d": `${0.5 + i * 0.08}s`,
                          height: "100%",
                          width: `${pct}%`,
                          background: complete ? "var(--color-success)" : "var(--color-primary)",
                          borderRadius: 4,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>

                {/* Count */}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: complete ? "var(--color-success)" : "var(--color-muted)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {complete && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {quest.done}/{quest.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Season progress */}
      <div
        className="dash-rise"
        style={
          {
            "--d": ".42s",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            padding: 24,
          } as React.CSSProperties
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-ink)", margin: 0 }}>
            Egyenletek Kora — szezon
          </h2>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-muted)", fontVariantNumeric: "tabular-nums" }}>
            {seasonMilestones} / 30 mérföldkő
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
            className="dash-bar"
            style={
              {
                "--d": ".55s",
                height: "100%",
                width: `${seasonPct}%`,
                background: "linear-gradient(90deg, var(--color-amber), var(--color-primary))",
                borderRadius: 6,
              } as React.CSSProperties
            }
          />
        </div>
        <p style={{ fontSize: 12, color: "var(--color-faint)", margin: "8px 0 0" }}>
          Minden elsajátított készség 2 mérföldkövet ad a szezonban.
        </p>
      </div>
    </div>
  );
}
