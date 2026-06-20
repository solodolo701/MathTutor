import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Trophy, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function SkillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("grade")
    .eq("id", user.id)
    .single();

  const grade = profile?.grade ?? 9;

  const [{ data: skills }, { data: userSkills }] = await Promise.all([
    supabase.from("skills").select("*").order("sort_order"),
    supabase.from("user_skills").select("*").eq("user_id", user.id),
  ]);

  const userSkillMap = new Map(userSkills?.map((us) => [us.skill_id, us]) ?? []);
  const skillNameMap = new Map(skills?.map((s) => [s.id, s.name_hu]) ?? []);

  const gradeSkills = skills?.filter((s) => s.grade === grade) ?? [];
  const otherGradeSkills = skills?.filter((s) => s.grade !== grade) ?? [];

  function isUnlocked(skill: typeof gradeSkills[0]) {
    if (!skill.prerequisites || skill.prerequisites.length === 0) return true;
    return skill.prerequisites.every((prereqId) => {
      const us = userSkillMap.get(prereqId);
      return us && us.p_know >= 0.8;
    });
  }

  function getMissingPrereqs(skill: typeof gradeSkills[0]): string[] {
    if (!skill.prerequisites) return [];
    return skill.prerequisites
      .filter((prereqId) => {
        const us = userSkillMap.get(prereqId);
        return !us || us.p_know < 0.8;
      })
      .map((prereqId) => skillNameMap.get(prereqId) ?? prereqId);
  }

  function SkillCard({ skill, dimmed = false }: { skill: typeof gradeSkills[0]; dimmed?: boolean }) {
    const userSkill = userSkillMap.get(skill.id);
    const p_know = userSkill?.p_know ?? 0;
    const pct = Math.round(p_know * 100);
    const unlocked = isUnlocked(skill);
    const mastered = p_know >= 0.8;
    const missingPrereqs = unlocked ? [] : getMissingPrereqs(skill);

    const borderColor = mastered
      ? "var(--color-mastery-border)"
      : unlocked
      ? "var(--color-border-base)"
      : "var(--color-border-subtle)";

    const bgColor = mastered
      ? "var(--color-mastery-950)"
      : "var(--color-bg-card)";

    return (
      <div
        className="relative rounded-xl p-5 border transition-all"
        style={{
          background: bgColor,
          borderColor,
          opacity: dimmed ? 0.55 : 1,
          boxShadow: mastered ? "var(--shadow-glow-mastery)" : undefined,
        }}
      >
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          {mastered ? (
            <Trophy size={18} style={{ color: "var(--color-mastery-400)" }} />
          ) : !unlocked ? (
            <Lock size={16} style={{ color: "var(--color-text-disabled)" }} />
          ) : null}
        </div>

        {/* Topic area */}
        <div className="mb-2">
          <span className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            {skill.topic_area}
          </span>
        </div>

        <h3 className="font-semibold mb-1 pr-6" style={{ color: "var(--color-text-primary)" }}>
          {skill.name_hu}
        </h3>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
          {skill.description_hu}
        </p>

        {/* Mastery bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
            <span>Elsajátítás</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: "var(--color-bg-hover)" }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: mastered ? "var(--color-mastery-500)" : "var(--color-brand-500)",
              }}
            />
          </div>
        </div>

        {unlocked ? (
          <Link
            href={`/app/practice/${skill.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: mastered ? "var(--color-mastery-950)" : "var(--color-brand-500)",
              color: mastered ? "var(--color-mastery-400)" : "white",
              border: mastered ? `1px solid var(--color-mastery-border)` : undefined,
            }}
          >
            {mastered ? "Ismétlés" : "Gyakorlás"}
            <ChevronRight size={14} />
          </Link>
        ) : (
          <div>
            <p className="text-xs mb-1" style={{ color: "var(--color-text-disabled)" }}>
              Előfeltételek szükségesek:
            </p>
            <ul className="space-y-0.5">
              {missingPrereqs.slice(0, 2).map((name) => (
                <li key={name} className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                  <Lock size={10} />
                  {name}
                </li>
              ))}
              {missingPrereqs.length > 2 && (
                <li className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
                  +{missingPrereqs.length - 2} további
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          {grade}. osztály képességei
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Haladj sorban — az előfeltételek teljesítése után új képességek nyílnak meg.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gradeSkills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {otherGradeSkills.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--color-text-muted)" }}>
            Egyéb évfolyamok
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherGradeSkills.slice(0, 6).map((skill) => (
              <SkillCard key={skill.id} skill={skill} dimmed />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
