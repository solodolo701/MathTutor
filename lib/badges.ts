import { createClient } from "@/lib/supabase/server";

export type BadgeType =
  | "FIRST_SKILL_MASTERED"
  | "STREAK_7"
  | "STREAK_30"
  | "SQUAD_FIRST_WIN"
  | "PERFECT_SESSION"
  | "COMEBACK"
  | "EARLY_BIRD"
  | "NIGHT_OWL"
  | "GRADE9_COMPLETE"
  | "MATURA_READY";

export type BadgeEvent =
  | { type: "skill_mastered"; skillId: string; grade: number }
  | { type: "session_complete"; correct: number; total: number; incorrectInRow?: number }
  | { type: "streak_updated"; current: number };

export async function checkAndAwardBadges(
  userId: string,
  event: BadgeEvent
): Promise<BadgeType[]> {
  const supabase = await createClient();
  const earned: BadgeType[] = [];

  const { data: existing } = await supabase
    .from("badges")
    .select("badge_type")
    .eq("user_id", userId);

  const existingSet = new Set(existing?.map((b) => b.badge_type) ?? []);

  async function awardIfNew(badge: BadgeType) {
    if (!existingSet.has(badge)) {
      await supabase.from("badges").insert({ user_id: userId, badge_type: badge });
      earned.push(badge);
    }
  }

  if (event.type === "skill_mastered") {
    // Check if this is the first skill mastered
    const { count } = await supabase
      .from("user_skills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("mastered_at", "is", null);

    if ((count ?? 0) === 1) {
      await awardIfNew("FIRST_SKILL_MASTERED");
    }

    // Check Grade 9 completion
    if (event.grade === 9) {
      const { data: grade9Skills } = await supabase
        .from("skills")
        .select("id")
        .eq("grade", 9);

      if (grade9Skills) {
        const { count: masteredCount } = await supabase
          .from("user_skills")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("skill_id", grade9Skills.map((s) => s.id))
          .not("mastered_at", "is", null);

        if ((masteredCount ?? 0) >= grade9Skills.length) {
          await awardIfNew("GRADE9_COMPLETE");
        }
      }
    }
  }

  if (event.type === "session_complete") {
    if (event.correct === event.total && event.total >= 10) {
      await awardIfNew("PERFECT_SESSION");
    }

    if (event.incorrectInRow && event.incorrectInRow >= 3) {
      await awardIfNew("COMEBACK");
    }

    // Time-based badges
    const hour = new Date().getHours();
    if (hour < 8) await awardIfNew("EARLY_BIRD");
    if (hour >= 22) await awardIfNew("NIGHT_OWL");
  }

  if (event.type === "streak_updated") {
    if (event.current >= 7) await awardIfNew("STREAK_7");
    if (event.current >= 30) await awardIfNew("STREAK_30");
  }

  return earned;
}
