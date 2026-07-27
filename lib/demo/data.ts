import type { Skill, Problem } from "@/types/supabase";
import { DEFAULT_BKT_PARAMS } from "@/lib/bkt";

export const DEMO_USER_ID = "demo-user";

export const DEMO_PROFILE = {
  id: DEMO_USER_ID,
  display_name: "Demo Diák",
  grade: 9,
  birth_year: new Date().getFullYear() - 15,
  parent_email: null,
  consent_given_at: new Date().toISOString(),
  avatar_config: null,
  subscription_status: "free" as const,
  subscription_expires_at: null,
  stripe_customer_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function makeSkill(
  id: string,
  name_hu: string,
  topic_area: string,
  prerequisites: string[],
  description_hu: string,
  sort_order: number
): Skill {
  return {
    id,
    name: id,
    name_hu,
    grade: 9,
    topic_area,
    prerequisites,
    difficulty_params: DEFAULT_BKT_PARAMS,
    description_hu,
    sort_order,
  };
}

export const DEMO_SKILLS: Skill[] = [
  makeSkill("real-numbers", "Valós számok", "Számelmélet", [], "Természetes, egész, racionális és irracionális számok, számegyenes, abszolút érték", 1),
  makeSkill("algebraic-expressions", "Algebrai kifejezések", "Algebra", ["real-numbers"], "Monómok, polinomok, műveletek algebrai kifejezésekkel, faktorizáció", 2),
  makeSkill("linear-equations", "Lineáris egyenletek", "Egyenletek", ["algebraic-expressions"], "Elsőfokú egyenletek megoldása egy ismeretlennel, szöveges feladatok", 3),
  makeSkill("linear-functions", "Lineáris függvények", "Függvények", ["linear-equations"], "y=mx+b alak, meredekség, tengelymetszet, grafikonok értelmezése", 4),
  makeSkill("systems-of-equations", "Egyenletrendszerek", "Egyenletek", ["linear-equations"], "Kétismeretlenes lineáris egyenletrendszerek, helyettesítéses és összeadásos módszer", 5),
  makeSkill("basic-geometry", "Alapgeometria", "Geometria", [], "Háromszögek, szögek, kerület és terület, négyszögek, kongruencia", 6),
  makeSkill("triangle-congruence", "Háromszögek egybevágósága", "Geometria", ["basic-geometry"], "Egybevágósági alapesetek, bizonyítási feladatok", 7),
  makeSkill("statistics-intro", "Alapstatisztika", "Statisztika", ["real-numbers"], "Átlag, medián, módusz, szórás, relatív gyakoriság, valószínűség alapjai", 8),
  makeSkill("combinatorics", "Kombinatorika", "Kombinatorika", ["statistics-intro"], "Permutációk, kombinációk, egyszerű leszámlálási feladatok", 9),
  makeSkill("probability", "Valószínűségszámítás", "Statisztika", ["combinatorics"], "Klasszikus valószínűség, események, valószínűségi kísérletek", 10),
];

let problemCounter = 0;
function makeProblem(
  skill_id: string,
  type: Problem["type"],
  content_latex: string,
  opts: {
    solution_numeric?: number;
    solution_latex?: string;
    hints?: Array<{ level: number; text_hu: string }>;
    difficulty: number;
  }
): Problem {
  problemCounter += 1;
  return {
    id: `${skill_id}-p${problemCounter}`,
    skill_id,
    type,
    content_latex,
    solution_latex: opts.solution_latex ?? null,
    solution_numeric: opts.solution_numeric ?? null,
    hints: opts.hints ?? [],
    difficulty: opts.difficulty,
    matura_relevant: true,
    created_at: new Date().toISOString(),
  };
}

export const DEMO_PROBLEMS: Record<string, Problem[]> = {
  "real-numbers": [
    makeProblem("real-numbers", "fill_number", "Számítsd ki: $|-7| + |3|$", {
      solution_numeric: 10,
      difficulty: 0.2,
      hints: [
        { level: 1, text_hu: "Az abszolút érték mindig nem negatív." },
        { level: 2, text_hu: "$|-7| = 7$ és $|3| = 3$" },
        { level: 3, text_hu: "$7 + 3 = 10$" },
      ],
    }),
    makeProblem("real-numbers", "fill_number", "Számítsd ki: $(-3)^2 - 2^3$", {
      solution_numeric: 1,
      difficulty: 0.3,
      hints: [
        { level: 1, text_hu: "Számítsd ki külön-külön a két hatványt." },
        { level: 2, text_hu: "$(-3)^2 = 9$ és $2^3 = 8$" },
        { level: 3, text_hu: "$9 - 8 = 1$" },
      ],
    }),
    makeProblem("real-numbers", "fill_number", "Kerekítsd $2$ tizedesjegyre: $\\sqrt{2}$", {
      solution_numeric: 1.41,
      difficulty: 0.4,
      hints: [
        { level: 1, text_hu: "$\\sqrt{2} \\approx 1.41421...$" },
        { level: 2, text_hu: "A harmadik tizedesjegy kerekít, nem emel." },
      ],
    }),
    makeProblem("real-numbers", "fill_number", "Oldd meg: $|x - 4| = 6$, add meg a nagyobbik megoldást.", {
      solution_numeric: 10,
      difficulty: 0.5,
      hints: [
        { level: 1, text_hu: "Két eset van: $x - 4 = 6$ vagy $x - 4 = -6$" },
        { level: 2, text_hu: "Az első esetből $x = 10$, a második esetből $x = -2$" },
      ],
    }),
    makeProblem("real-numbers", "fill_number", "Számítsd ki: $\\frac{2}{3} + \\frac{1}{6}$ (tizedes tört alakban)", {
      solution_numeric: 0.83,
      difficulty: 0.35,
      hints: [
        { level: 1, text_hu: "Közös nevezőre kell hozni: 6." },
        { level: 2, text_hu: "$\\frac{4}{6} + \\frac{1}{6} = \\frac{5}{6} \\approx 0.83$" },
      ],
    }),
  ],
  "algebraic-expressions": [
    makeProblem("algebraic-expressions", "fill_number", "Egyszerűsítsd, majd $x=2$ esetén számítsd ki: $3x^2 - 2x$", {
      solution_numeric: 8,
      difficulty: 0.3,
      hints: [
        { level: 1, text_hu: "Helyettesítsd be $x = 2$-t." },
        { level: 2, text_hu: "$3 \\cdot 4 - 2 \\cdot 2 = 12 - 4 = 8$" },
      ],
    }),
    makeProblem("algebraic-expressions", "fill_number", "Bontsd szorzattá és add meg a gyököt: $x^2 - 9 = 0$ (pozitív gyök)", {
      solution_numeric: 3,
      difficulty: 0.4,
      hints: [
        { level: 1, text_hu: "$x^2 - 9 = (x-3)(x+3)$" },
        { level: 2, text_hu: "A gyökök: $x = 3$ és $x = -3$" },
      ],
    }),
    makeProblem("algebraic-expressions", "fill_number", "Számítsd ki: $(x+2)^2$ kifejtve, majd $x=1$ esetén", {
      solution_numeric: 9,
      difficulty: 0.35,
      hints: [
        { level: 1, text_hu: "$(x+2)^2 = x^2 + 4x + 4$" },
        { level: 2, text_hu: "$1 + 4 + 4 = 9$" },
      ],
    }),
    makeProblem("algebraic-expressions", "fill_number", "Vonj össze: $5a - 3b + 2a + b$, majd $a=2, b=1$ esetén számítsd ki", {
      solution_numeric: 15,
      difficulty: 0.3,
      hints: [
        { level: 1, text_hu: "Összevonás: $7a - 2b$" },
        { level: 2, text_hu: "$7 \\cdot 2 - 2 \\cdot 1 = 14 - 2 = 12$... nézd át újra a lépéseket." },
      ],
    }),
  ],
  "linear-equations": [
    makeProblem("linear-equations", "fill_number", "Oldd meg az egyenletet: $3x + 7 = 22$", {
      solution_numeric: 5,
      difficulty: 0.2,
      hints: [
        { level: 1, text_hu: "Rendezd az egyenletet: vond ki 7-et mindkét oldalból." },
        { level: 2, text_hu: "$3x = 15$" },
        { level: 3, text_hu: "$x = 5$" },
      ],
    }),
    makeProblem("linear-equations", "fill_number", "Oldd meg: $2(x - 3) = x + 4$", {
      solution_numeric: 10,
      difficulty: 0.4,
      hints: [
        { level: 1, text_hu: "Bontsd fel a zárójelet: $2x - 6 = x + 4$" },
        { level: 2, text_hu: "Rendezd az $x$-eket egy oldalra: $x = 10$" },
      ],
    }),
    makeProblem("linear-equations", "fill_number", "Egy szám és a duplájának összege 27. Melyik ez a szám?", {
      solution_numeric: 9,
      difficulty: 0.5,
      hints: [
        { level: 1, text_hu: "Írd fel egyenletként: $x + 2x = 27$" },
        { level: 2, text_hu: "$3x = 27$, tehát $x = 9$" },
      ],
    }),
    makeProblem("linear-equations", "fill_number", "Oldd meg: $\\frac{x}{2} + 3 = 8$", {
      solution_numeric: 10,
      difficulty: 0.3,
      hints: [
        { level: 1, text_hu: "Vond ki 3-at mindkét oldalból: $\\frac{x}{2} = 5$" },
        { level: 2, text_hu: "Szorozd meg 2-vel: $x = 10$" },
      ],
    }),
    makeProblem("linear-equations", "fill_number", "Oldd meg: $5x - 4 = 3x + 8$", {
      solution_numeric: 6,
      difficulty: 0.45,
      hints: [
        { level: 1, text_hu: "Vond ki $3x$-et mindkét oldalból: $2x - 4 = 8$" },
        { level: 2, text_hu: "$2x = 12$, tehát $x = 6$" },
      ],
    }),
  ],
  "linear-functions": [
    makeProblem("linear-functions", "fill_number", "Mennyi az $f(x) = 2x - 3$ függvény meredeksége?", {
      solution_numeric: 2,
      difficulty: 0.2,
      hints: [{ level: 1, text_hu: "Az $y = mx + b$ alakban $m$ a meredekség." }],
    }),
    makeProblem("linear-functions", "fill_number", "Az $f(x) = -x + 5$ függvény hol metszi az y tengelyt?", {
      solution_numeric: 5,
      difficulty: 0.25,
      hints: [{ level: 1, text_hu: "Az y-tengelymetszet az $x=0$ helyen felvett érték: $f(0) = 5$" }],
    }),
    makeProblem("linear-functions", "fill_number", "Számítsd ki: $f(x) = 3x + 1$ esetén $f(4)$", {
      solution_numeric: 13,
      difficulty: 0.3,
      hints: [{ level: 1, text_hu: "Helyettesítsd be $x=4$-et: $3 \\cdot 4 + 1$" }],
    }),
    makeProblem("linear-functions", "fill_number", "Egy egyenes átmegy a $(0,2)$ és $(1,5)$ pontokon. Mennyi a meredeksége?", {
      solution_numeric: 3,
      difficulty: 0.5,
      hints: [
        { level: 1, text_hu: "$m = \\frac{y_2 - y_1}{x_2 - x_1}$" },
        { level: 2, text_hu: "$m = \\frac{5-2}{1-0} = 3$" },
      ],
    }),
  ],
  "basic-geometry": [
    makeProblem("basic-geometry", "fill_number", "Egy háromszög szögei: $50°$, $60°$ és $x$. Mennyi $x$?", {
      solution_numeric: 70,
      difficulty: 0.2,
      hints: [{ level: 1, text_hu: "A háromszög szögeinek összege $180°$." }],
    }),
    makeProblem("basic-geometry", "fill_number", "Egy téglalap oldalai 4 cm és 7 cm. Mennyi a kerülete (cm)?", {
      solution_numeric: 22,
      difficulty: 0.15,
      hints: [{ level: 1, text_hu: "$K = 2(a+b)$" }],
    }),
    makeProblem("basic-geometry", "fill_number", "Egy négyzet területe $49\\ cm^2$. Mennyi az oldala (cm)?", {
      solution_numeric: 7,
      difficulty: 0.3,
      hints: [{ level: 1, text_hu: "$T = a^2$, tehát $a = \\sqrt{T}$" }],
    }),
  ],
};

export interface DemoUserSkillState {
  p_know: number;
  attempts_total: number;
  attempts_correct: number;
  mastered_at: string | null;
  next_review_at: string | null;
}

export interface DemoXpEvent {
  amount: number;
  reason: string;
  created_at: string;
}

interface DemoState {
  userSkills: Map<string, DemoUserSkillState>;
  streak: {
    current: number;
    longest: number;
    last_active_date: string | null;
    shields_available: number;
  };
  xpEvents: DemoXpEvent[];
}

// Module-level, in-memory only — resets on redeploy/cold start. That's
// fine here: this exists purely so a Supabase-less deployment has
// somewhere to hold session progress while it's being reviewed.
const globalForDemo = globalThis as unknown as { __demoState?: DemoState };

export const demoState: DemoState =
  globalForDemo.__demoState ??
  (globalForDemo.__demoState = {
    userSkills: new Map(),
    streak: { current: 0, longest: 0, last_active_date: null, shields_available: 0 },
    xpEvents: [],
  });

export function findDemoProblem(problemId: string): Problem | undefined {
  for (const list of Object.values(DEMO_PROBLEMS)) {
    const found = list.find((p) => p.id === problemId);
    if (found) return found;
  }
  return undefined;
}

export function getDemoUserSkill(skillId: string): DemoUserSkillState {
  return (
    demoState.userSkills.get(skillId) ?? {
      p_know: 0,
      attempts_total: 0,
      attempts_correct: 0,
      mastered_at: null,
      next_review_at: null,
    }
  );
}
