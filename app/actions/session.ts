"use server";

import { createClient } from "@/lib/supabase/server";
import { updatePKnow, getNextReviewAt, calculateXP, DEFAULT_BKT_PARAMS } from "@/lib/bkt";
import { buildDailySession, SessionProblem } from "@/lib/problem-selection";
import { DEMO_MODE } from "@/lib/demo/config";
import { demoState, findDemoProblem, getDemoUserSkill } from "@/lib/demo/data";

export interface SubmitAnswerResult {
  correct: boolean;
  xpEarned: number;
  newPKnow: number;
  mastered: boolean;
}

export async function submitAnswer(
  problemId: string,
  userAnswer: string,
  timeMs: number
): Promise<SubmitAnswerResult> {
  if (DEMO_MODE) {
    const problem = findDemoProblem(problemId);
    if (!problem) throw new Error("Problem not found");

    let correct = false;
    if (problem.type === "fill_number" && problem.solution_numeric !== null) {
      const userNum = parseFloat(userAnswer.trim());
      correct = Math.abs(userNum - problem.solution_numeric) < 0.001;
    } else if (problem.solution_latex) {
      correct = userAnswer.trim().toLowerCase() === problem.solution_latex.toLowerCase();
    }

    const current = getDemoUserSkill(problem.skill_id);
    const newPKnow = updatePKnow(current.p_know, correct);
    const nextReviewAt = getNextReviewAt(newPKnow);
    const mastered = newPKnow >= 0.8 && !current.mastered_at;

    demoState.userSkills.set(problem.skill_id, {
      p_know: newPKnow,
      attempts_total: current.attempts_total + 1,
      attempts_correct: current.attempts_correct + (correct ? 1 : 0),
      next_review_at: nextReviewAt.toISOString(),
      mastered_at: mastered ? new Date().toISOString() : current.mastered_at,
    });

    const xpEarned = calculateXP(correct, problem.difficulty);
    demoState.xpEvents.push({
      amount: xpEarned,
      reason: correct ? `correct_${problem.type}` : "effort",
      created_at: new Date().toISOString(),
    });

    return { correct, xpEarned, newPKnow, mastered };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get the problem
  const { data: problem } = await supabase
    .from("problems")
    .select("*")
    .eq("id", problemId)
    .single();

  if (!problem) throw new Error("Problem not found");

  // Check correctness
  let correct = false;
  if (problem.type === "fill_number" && problem.solution_numeric !== null) {
    const userNum = parseFloat(userAnswer.trim());
    correct = Math.abs(userNum - problem.solution_numeric) < 0.001;
  } else if (problem.solution_latex) {
    correct = userAnswer.trim().toLowerCase() === problem.solution_latex.toLowerCase();
  }

  // Get current user skill state
  const { data: userSkill } = await supabase
    .from("user_skills")
    .select("*")
    .eq("user_id", user.id)
    .eq("skill_id", problem.skill_id)
    .single();

  const currentPKnow = userSkill?.p_know ?? DEFAULT_BKT_PARAMS.p_l0;

  // Update BKT
  const newPKnow = updatePKnow(currentPKnow, correct);
  const nextReviewAt = getNextReviewAt(newPKnow);
  const mastered = newPKnow >= 0.8 && !userSkill?.mastered_at;

  // Upsert user_skills
  await supabase.from("user_skills").upsert({
    user_id: user.id,
    skill_id: problem.skill_id,
    p_know: newPKnow,
    attempts_total: (userSkill?.attempts_total ?? 0) + 1,
    attempts_correct: (userSkill?.attempts_correct ?? 0) + (correct ? 1 : 0),
    next_review_at: nextReviewAt.toISOString(),
    mastered_at: mastered ? new Date().toISOString() : userSkill?.mastered_at ?? null,
  });

  // Record attempt
  await supabase.from("problem_attempts").insert({
    user_id: user.id,
    problem_id: problemId,
    correct,
    time_ms: timeMs,
    hint_count: 0,
    ai_hint_used: false,
  });

  // Award XP
  const xpEarned = calculateXP(correct, problem.difficulty);
  await supabase.from("xp_events").insert({
    user_id: user.id,
    amount: xpEarned,
    reason: correct ? `correct_${problem.type}` : "effort",
  });

  return { correct, xpEarned, newPKnow, mastered };
}

export async function startSession(userId: string): Promise<SessionProblem[]> {
  return buildDailySession(userId);
}

export async function getSkillState(userId: string, skillId: string) {
  if (DEMO_MODE) {
    return getDemoUserSkill(skillId);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_skills")
    .select("p_know, mastered_at, next_review_at, attempts_total, attempts_correct")
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .single();
  return data;
}

export async function updateStreak(userId: string): Promise<{ current: number; newShield: boolean }> {
  if (DEMO_MODE) {
    const streak = demoState.streak;
    const today = new Date().toISOString().split("T")[0];
    const lastActive = streak.last_active_date;

    if (lastActive === today) {
      return { current: streak.current, newShield: false };
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    let newCurrent: number;
    let newShield = false;

    if (lastActive === yesterday) {
      newCurrent = streak.current + 1;
    } else if (lastActive && streak.shields_available > 0) {
      newCurrent = streak.current + 1;
      streak.shields_available -= 1;
    } else {
      newCurrent = 1;
    }

    streak.longest = Math.max(newCurrent, streak.longest);

    const shieldMilestones = [3, 7, 14, 30];
    if (shieldMilestones.includes(newCurrent)) {
      streak.shields_available += 1;
      newShield = true;
    }

    streak.current = newCurrent;
    streak.last_active_date = today;

    return { current: newCurrent, newShield };
  }

  const supabase = await createClient();

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const lastActive = streak?.last_active_date;

  if (lastActive === today) {
    return { current: streak?.current ?? 0, newShield: false };
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  let newCurrent: number;
  let shieldsAvailable = streak?.shields_available ?? 0;
  let newShield = false;

  if (lastActive === yesterday) {
    // Consecutive day
    newCurrent = (streak?.current ?? 0) + 1;
  } else if (lastActive && shieldsAvailable > 0) {
    // Missed a day but has shield
    newCurrent = (streak?.current ?? 0) + 1;
    shieldsAvailable -= 1;
  } else {
    newCurrent = 1;
  }

  const longest = Math.max(newCurrent, streak?.longest ?? 0);

  // Award shield at milestones
  const shieldMilestones = [3, 7, 14, 30];
  if (shieldMilestones.includes(newCurrent)) {
    shieldsAvailable += 1;
    newShield = true;
  }

  await supabase.from("streaks").upsert({
    user_id: userId,
    current: newCurrent,
    longest,
    last_active_date: today,
    shields_available: shieldsAvailable,
  });

  return { current: newCurrent, newShield };
}
