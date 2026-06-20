import { redirect } from "next/navigation";
import Link from "next/link";
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

  const gradeSkills = skills?.filter((s) => s.grade === grade) ?? [];
  const otherGradeSkills = skills?.filter((s) => s.grade !== grade) ?? [];

  function isUnlocked(skill: typeof gradeSkills[0]) {
    if (!skill.prerequisites || skill.prerequisites.length === 0) return true;
    return skill.prerequisites.every((prereqId) => {
      const userSkill = userSkillMap.get(prereqId);
      return userSkill && userSkill.p_know >= 0.8;
    });
  }

  function renderSkillCard(skill: typeof gradeSkills[0]) {
    const userSkill = userSkillMap.get(skill.id);
    const p_know = userSkill?.p_know ?? 0;
    const unlocked = isUnlocked(skill);
    const mastered = p_know >= 0.8;

    return (
      <div
        key={skill.id}
        className={`relative bg-zinc-900 border rounded-xl p-5 transition-all ${
          mastered
            ? "border-yellow-700 bg-yellow-950/20"
            : unlocked
            ? "border-indigo-700 hover:border-indigo-500"
            : "border-zinc-800 opacity-60"
        }`}
      >
        {/* Status icon */}
        <div className="absolute top-4 right-4 text-xl">
          {mastered ? "🏆" : unlocked ? "" : "🔒"}
        </div>

        <div className="mb-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wide">
            {skill.topic_area}
          </span>
        </div>

        <h3 className="font-semibold text-white mb-1">{skill.name_hu}</h3>
        <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{skill.description_hu}</p>

        {/* Progress ring / bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Elsajátítás</span>
            <span>{Math.round(p_know * 100)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                mastered ? "bg-yellow-500" : "bg-indigo-500"
              }`}
              style={{ width: `${p_know * 100}%` }}
            />
          </div>
        </div>

        {unlocked ? (
          <Link
            href={`/app/practice/${skill.id}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mastered
                ? "bg-yellow-900 hover:bg-yellow-800 text-yellow-300"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {mastered ? "Ismétlés" : "Gyakorlás"} →
          </Link>
        ) : (
          <div className="text-xs text-zinc-600">
            Előfeltételek szükségesek
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">{grade}. osztály képességei</h1>
        <p className="text-zinc-400 mt-1">
          Haladj sorban — az előfeltételek teljesítése után új képességek nyílnak meg.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gradeSkills.map(renderSkillCard)}
      </div>

      {otherGradeSkills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-400 mb-4">
            Egyéb évfolyamok
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {otherGradeSkills.slice(0, 6).map(renderSkillCard)}
          </div>
        </div>
      )}
    </div>
  );
}
