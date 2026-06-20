import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PracticeSession from "./PracticeSession";

interface Props {
  params: Promise<{ skillId: string }>;
}

export default async function PracticePage({ params }: Props) {
  const { skillId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: skill } = await supabase
    .from("skills")
    .select("*")
    .eq("id", skillId)
    .single();

  if (!skill) redirect("/app/skills");

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
      skill={skill}
      problems={problems ?? []}
      userId={user.id}
      isPremium={profile?.subscription_status === "premium"}
      problemsToday={problemsToday}
    />
  );
}
