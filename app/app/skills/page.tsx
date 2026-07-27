import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SkillsTreeClient } from "@/components/skills/SkillsTreeClient";
import type { SkillNode } from "@/components/skills/SkillsTreeClient";
import { DEMO_MODE } from "@/lib/demo/config";
import { DEMO_SKILLS, demoState, getDemoUserSkill } from "@/lib/demo/data";
import type { Skill } from "@/types/supabase";

// Fixed layout positions matching the design prototype
const SKILL_POSITIONS: Record<string, { x: number; y: number }> = {
  "real-numbers":            { x: 90,  y: 90  },
  "algebraic-expressions":   { x: 280, y: 90  },
  "linear-equations":        { x: 470, y: 90  },
  "linear-functions":        { x: 660, y: 90  },
  "systems-of-equations":    { x: 470, y: 230 },
  "basic-geometry":          { x: 90,  y: 340 },
  "triangle-congruence":     { x: 280, y: 340 },
  "statistics-intro":        { x: 90,  y: 470 },
  "combinatorics":           { x: 280, y: 470 },
  "probability":             { x: 470, y: 470 },
};

function getDefaultPos(index: number): { x: number; y: number } {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { x: 90 + col * 180, y: 90 + row * 140 };
}

export default async function SkillsPage() {
  let skills: Skill[];
  let userSkillMap: Map<string, { p_know: number }>;

  if (DEMO_MODE) {
    skills = DEMO_SKILLS;
    userSkillMap = new Map(
      Array.from(demoState.userSkills.keys()).map((skillId) => [skillId, getDemoUserSkill(skillId)])
    );
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [{ data: dbSkills }, { data: userSkills }] = await Promise.all([
      supabase.from("skills").select("*").order("sort_order"),
      supabase.from("user_skills").select("*").eq("user_id", user.id),
    ]);

    skills = dbSkills ?? [];
    userSkillMap = new Map(userSkills?.map((us) => [us.skill_id, us]) ?? []);
  }

  const skillNodes: SkillNode[] = skills.map((s, index) => {
    const us = userSkillMap.get(s.id);
    const p_know = us?.p_know ?? 0;
    const pct = p_know;
    const pos = SKILL_POSITIONS[s.id] ?? getDefaultPos(index);

    let state: "mastered" | "active" | "locked" = "locked";
    if (p_know >= 0.8) {
      state = "mastered";
    } else if (p_know > 0) {
      state = "active";
    } else {
      // Check if prerequisites are met to be unlocked
      const prereqs: string[] = s.prerequisites ?? [];
      const allMet = prereqs.every((prereqId) => {
        const prereqUs = userSkillMap.get(prereqId);
        return prereqUs && prereqUs.p_know >= 0.8;
      });
      if (allMet && prereqs.length === 0) state = "active";
    }

    return {
      id: s.id,
      name: s.name_hu,
      x: pos.x,
      y: pos.y,
      state,
      pct,
      prereq: (s.prerequisites as string[] | null)?.[0] ?? null,
      gradeTag: s.grade === 10 ? "10. évf." : undefined,
      desc: s.description_hu ?? "",
    };
  });

  return <SkillsTreeClient skills={skillNodes} />;
}
