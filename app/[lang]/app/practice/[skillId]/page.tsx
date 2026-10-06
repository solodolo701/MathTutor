import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PracticeSession from "./PracticeSession";
import { DEMO_MODE } from "@/lib/demo/config";
import { DEMO_USER_ID, getDemoSkills, getDemoProblems } from "@/lib/demo/data";

interface Props {
  params: Promise<{ lang: string; skillId: string }>;
}

export default async function PracticePage({ params }: Props) {
  const { lang, skillId } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  if (DEMO_MODE) {
    const skill = getDemoSkills(lang).find((s) => s.id === skillId);
    if (!skill) redirect(`/${lang}/app/skills`);

    const problems = getDemoProblems(lang, skillId).slice(0, 14);

    return (
      <PracticeSession
        lang={lang}
        skill={skill}
        problems={problems}
        userId={DEMO_USER_ID}
        isPremium={false}
        problemsToday={0}
      />
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login`);

  const { data: skill } = await supabase
    .from("skills")
    .select("*")
    .eq("id", skillId)
    .single();

  if (!skill) redirect(`/${lang}/app/skills`);

  // Check freemium limit for free users
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  let problemsToday = 0;
  if (profile?.subscription_status === "free") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("problem_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString());
    problemsToday = count ?? 0;
  }

  // Get 12 problems for this skill
  const { data: problems } = await supabase
    .from("problems")
    .select("*")
    .eq("skill_id", skillId)
    .order("difficulty")
    .limit(14);

  return (
    <PracticeSession
        lang={lang}
      skill={skill}
      problems={problems ?? []}
      userId={user.id}
      isPremium={profile?.subscription_status === "premium"}
      problemsToday={problemsToday}
    />
  );
}
