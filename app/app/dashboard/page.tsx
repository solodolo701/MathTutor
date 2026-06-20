import { redirect } from "next/navigation";
import Link from "next/link";
import { Flame, Zap, Trophy, Shield, ArrowRight, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/types/supabase";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: userSkills }, { data: streak }, { data: recentXp }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("user_skills")
        .select("*")
        .eq("user_id", user.id)
        .order("p_know", { ascending: false })
        .limit(5),
      supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      supabase
        .from("xp_events")
        .select("amount")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

  const skillIds = userSkills?.map((us) => us.skill_id) ?? [];
  const { data: skills } = skillIds.length > 0
    ? await supabase.from("skills").select("id, name_hu, topic_area").in("id", skillIds)
    : { data: [] as Pick<Skill, "id" | "name_hu" | "topic_area">[] };

  const skillMap = new Map(skills?.map((s) => [s.id, s]) ?? []);
  const totalXpThisWeek = recentXp?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const masteredSkills = userSkills?.filter((us) => us.p_know >= 0.8).length ?? 0;
  const isPremium = profile?.subscription_status === "premium";

  const stats = [
    {
      label: "Napi sorozat",
      value: streak?.current ?? 0,
      Icon: Flame,
      color: "var(--color-streak-400)",
      bg: "var(--color-streak-950)",
      border: "var(--color-streak-border)",
    },
    {
      label: "XP ezen a héten",
      value: totalXpThisWeek,
      Icon: Zap,
      color: "var(--color-xp-400)",
      bg: "rgba(234,179,8,0.05)",
      border: "rgba(234,179,8,0.15)",
    },
    {
      label: "Elsajátított",
      value: masteredSkills,
      Icon: Trophy,
      color: "var(--color-mastery-400)",
      bg: "var(--color-mastery-950)",
      border: "var(--color-mastery-border)",
    },
    {
      label: "Sorozatvédő",
      value: streak?.shields_available ?? 0,
      Icon: Shield,
      color: "var(--color-shield-400)",
      bg: "var(--color-shield-950)",
      border: "rgba(96,165,250,0.25)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Szia, {profile?.display_name ?? "Tanuló"}! 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {profile?.grade}. osztály &nbsp;•&nbsp;{" "}
          {isPremium ? (
            <span style={{ color: "var(--color-brand-400)" }}>Prémium fiók</span>
          ) : (
            <span>Ingyenes fiók</span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 border"
            style={{ background: s.bg, borderColor: s.border }}
          >
            <s.Icon size={18} style={{ color: s.color }} className="mb-2" />
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Daily practice CTA */}
      <div
        className="rounded-xl p-6 border relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-brand-950) 0%, rgba(79,70,229,0.15) 100%)",
          borderColor: "var(--color-brand-border)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{
            background: "var(--color-brand-500)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="relative">
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
            Napi feladatsor
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Körülbelül 15 percet vesz igénybe. Bemelegítés, fókuszált gyakorlás és ismétlés.
          </p>
          <Link
            href="/app/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background: "var(--color-brand-500)", color: "white" }}
          >
            <BookOpen size={15} />
            Feladatsor indítása
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Recent skills */}
      {userSkills && userSkills.length > 0 ? (
        <div>
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Legutóbbi képességek
          </h2>
          <div className="space-y-2">
            {userSkills.map((us) => {
              const skill = skillMap.get(us.skill_id);
              const pct = Math.round(us.p_know * 100);
              const mastered = us.p_know >= 0.8;
              return (
                <div
                  key={us.skill_id}
                  className="flex items-center justify-between rounded-xl px-4 py-3 border"
                  style={{
                    background: "var(--color-bg-card)",
                    borderColor: mastered ? "var(--color-mastery-border)" : "var(--color-border-base)",
                  }}
                >
                  <div className="min-w-0 mr-4">
                    <span className="font-medium text-sm block truncate" style={{ color: "var(--color-text-primary)" }}>
                      {skill?.name_hu ?? us.skill_id}
                    </span>
                    {skill?.topic_area && (
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {skill.topic_area}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-20 rounded-full h-1.5" style={{ background: "var(--color-bg-hover)" }}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: mastered ? "var(--color-mastery-500)" : "var(--color-brand-500)",
                        }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: "var(--color-text-muted)" }}>
                      {pct}%
                    </span>
                    <Link
                      href={`/app/practice/${us.skill_id}`}
                      className="px-3 py-1 text-xs rounded-lg font-medium transition-colors"
                      style={{ background: "var(--color-brand-500)", color: "white" }}
                    >
                      Gyakorlás
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="text-center py-14 rounded-xl border"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-base)" }}
        >
          <div className="text-4xl mb-4">🌱</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Kezdd el a tanulást!
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Válassz egy képességet a képességfán, és kezdd el a gyakorlást.
          </p>
          <Link
            href="/app/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: "var(--color-brand-500)", color: "white" }}
          >
            Képességfa megtekintése
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
