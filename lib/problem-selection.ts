import { createClient } from "@/lib/supabase/server";
import { estimatePCorrect } from "@/lib/bkt";
import type { Problem } from "@/types/supabase";

export interface SessionProblem {
  problem_id: string;
  phase: "warmup" | "practice" | "review";
  skill_id: string;
}

export async function selectNextProblem(
  userId: string,
  skillId: string
): Promise<Problem | null> {
  const supabase = await createClient();

  // Get current p_know for the skill
  const { data: userSkill } = await supabase
    .from("user_skills")
    .select("p_know")
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .single();

  const p_know = userSkill?.p_know ?? 0.1;

  // Find problems attempted correctly in last 24h (to exclude)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentAttempts } = await supabase
    .from("problem_attempts")
    .select("problem_id")
    .eq("user_id", userId)
    .eq("correct", true)
    .gte("created_at", since);

  const excludeIds = recentAttempts?.map((a) => a.problem_id) ?? [];

  // Get all problems for this skill
  const { data: problems } = await supabase
    .from("problems")
    .select("*")
    .eq("skill_id", skillId)
    .order("difficulty");

  if (!problems || problems.length === 0) return null;

  // Filter excluded and find closest to 70% success rate
  const available = problems.filter((p) => !excludeIds.includes(p.id));
  if (available.length === 0) {
    // If all recently correct, allow all problems
    return selectClosestToTarget(problems, p_know);
  }

  return selectClosestToTarget(available, p_know);
}

function selectClosestToTarget(problems: Problem[], p_know: number): Problem {
  const TARGET_P_CORRECT = 0.7;
  let best = problems[0];
  let bestDiff = Math.abs(estimatePCorrect(p_know, problems[0].difficulty) - TARGET_P_CORRECT);

  for (const problem of problems) {
    const pCorrect = estimatePCorrect(p_know, problem.difficulty);
    const diff = Math.abs(pCorrect - TARGET_P_CORRECT);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = problem;
    }
  }
  return best;
}

export async function buildDailySession(userId: string): Promise<SessionProblem[]> {
  const supabase = await createClient();
  const session: SessionProblem[] = [];
  const now = new Date().toISOString();

  // 1. Warmup: skills with next_review_at <= now, sorted by p_know asc (weakest first)
  const { data: dueForReview } = await supabase
    .from("user_skills")
    .select("skill_id, p_know")
    .eq("user_id", userId)
    .lte("next_review_at", now)
    .order("p_know", { ascending: true })
    .limit(3);

  for (const us of dueForReview ?? []) {
    const problem = await selectNextProblem(userId, us.skill_id);
    if (problem) {
      session.push({ problem_id: problem.id, phase: "warmup", skill_id: us.skill_id });
    }
  }

  // 2. Practice: current active skill (lowest p_know not yet mastered)
  const { data: activeSkills } = await supabase
    .from("user_skills")
    .select("skill_id, p_know")
    .eq("user_id", userId)
    .lt("p_know", 0.8)
    .is("mastered_at", null)
    .order("p_know", { ascending: false })
    .limit(1);

  // If no in-progress skill, find first available skill for the user
  let practiceSkillId: string | null = activeSkills?.[0]?.skill_id ?? null;

  if (!practiceSkillId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("grade")
      .eq("id", userId)
      .single();

    const { data: availableSkills } = await supabase
      .from("skills")
      .select("id")
      .eq("grade", profile?.grade ?? 9)
      .order("sort_order")
      .limit(1);

    practiceSkillId = availableSkills?.[0]?.id ?? null;
  }

  if (practiceSkillId) {
    for (let i = 0; i < 8; i++) {
      const problem = await selectNextProblem(userId, practiceSkillId);
      if (problem) {
        session.push({ problem_id: problem.id, phase: "practice", skill_id: practiceSkillId });
      }
    }
  }

  // 3. Review: mastered skills with next_review_at <= now
  const { data: masteredForReview } = await supabase
    .from("user_skills")
    .select("skill_id, p_know")
    .eq("user_id", userId)
    .gte("p_know", 0.8)
    .lte("next_review_at", now)
    .limit(3);

  for (const us of masteredForReview ?? []) {
    const problem = await selectNextProblem(userId, us.skill_id);
    if (problem) {
      session.push({ problem_id: problem.id, phase: "review", skill_id: us.skill_id });
    }
  }

  return session;
}
