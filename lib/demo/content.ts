import type { Locale } from "@/lib/i18n/config";

/**
 * Translated maths content.
 *
 * Hungarian lives in `lib/demo/data.ts` and is the source of truth — the
 * problems were written against the NAT 2020 curriculum. Only the English
 * and German renderings live here, so there is one place to look when the
 * Hungarian changes and the translations need to follow.
 *
 * LaTeX is kept identical across locales. Only prose is translated, because
 * the mathematics must not drift between languages: a student comparing two
 * versions should see the same problem.
 *
 * Numeric answers are deliberately NOT translated. The decimal separator is
 * handled at input time from the locale, so the stored answer stays a plain
 * JS number in every language.
 */

interface SkillText {
  name: string;
  desc: string;
}

interface ProblemText {
  content: string;
  hints: string[];
}

interface ContentPack {
  skills: Record<string, SkillText>;
  problems: Record<string, ProblemText>;
}

const en: ContentPack = {
  skills: {
    "real-numbers": {
      name: "Real numbers",
      desc: "Natural, integer, rational and irrational numbers, the number line, absolute value",
    },
    "algebraic-expressions": {
      name: "Algebraic expressions",
      desc: "Monomials, polynomials, operations on algebraic expressions, factorisation",
    },
    "linear-equations": {
      name: "Linear equations",
      desc: "Solving first-degree equations in one unknown, word problems",
    },
    "linear-functions": {
      name: "Linear functions",
      desc: "The form y = mx + b, gradient, intercept, reading graphs",
    },
    "systems-of-equations": {
      name: "Simultaneous equations",
      desc: "Linear systems in two unknowns, substitution and elimination",
    },
    "basic-geometry": {
      name: "Basic geometry",
      desc: "Triangles, angles, perimeter and area, quadrilaterals, congruence",
    },
    "triangle-congruence": {
      name: "Congruent triangles",
      desc: "The congruence criteria and proof problems",
    },
    "statistics-intro": {
      name: "Introductory statistics",
      desc: "Mean, median, mode, spread, relative frequency, basics of probability",
    },
    combinatorics: {
      name: "Combinatorics",
      desc: "Permutations, combinations, simple counting problems",
    },
    probability: {
      name: "Probability",
      desc: "Classical probability, events, probability experiments",
    },
  },
  problems: {
    "real-numbers-1": {
      content: "Work out: $|-7| + |3|$",
      hints: [
        "An absolute value is never negative.",
        "$|-7| = 7$ and $|3| = 3$",
        "$7 + 3 = 10$",
      ],
    },
    "real-numbers-2": {
      content: "Work out: $(-3)^2 - 2^3$",
      hints: [
        "Evaluate each power separately.",
        "$(-3)^2 = 9$ and $2^3 = 8$",
        "$9 - 8 = 1$",
      ],
    },
    "real-numbers-3": {
      content: "Round to $2$ decimal places: $\\sqrt{2}$",
      hints: ["$\\sqrt{2} \\approx 1.41421...$", "The third decimal rounds down, not up."],
    },
    "real-numbers-4": {
      content: "Solve: $|x - 4| = 6$, and give the larger solution.",
      hints: [
        "There are two cases: $x - 4 = 6$ or $x - 4 = -6$",
        "The first gives $x = 10$, the second gives $x = -2$",
      ],
    },
    "real-numbers-5": {
      content: "Work out: $\\frac{2}{3} + \\frac{1}{6}$ (as a decimal)",
      hints: [
        "Put both over a common denominator of 6.",
        "$\\frac{4}{6} + \\frac{1}{6} = \\frac{5}{6} \\approx 0.83$",
      ],
    },
    "algebraic-expressions-1": {
      content: "Simplify, then evaluate at $x=2$: $3x^2 - 2x$",
      hints: ["Substitute $x = 2$.", "$3 \\cdot 4 - 2 \\cdot 2 = 12 - 4 = 8$"],
    },
    "algebraic-expressions-2": {
      content: "Factorise and give the root: $x^2 - 9 = 0$ (positive root)",
      hints: ["$x^2 - 9 = (x-3)(x+3)$", "The roots are $x = 3$ and $x = -3$"],
    },
    "algebraic-expressions-3": {
      content: "Expand $(x+2)^2$, then evaluate at $x=1$",
      hints: ["$(x+2)^2 = x^2 + 4x + 4$", "$1 + 4 + 4 = 9$"],
    },
    "algebraic-expressions-4": {
      content: "Collect like terms: $5a - 3b + 2a + b$, then evaluate at $a=2, b=1$",
      hints: ["Collect like terms: $7a - 2b$", "Substitute: $7 \\cdot 2 - 2 \\cdot 1 = 14 - 2 = 12$"],
    },
    "linear-equations-1": {
      content: "Solve the equation: $3x + 7 = 22$",
      hints: [
        "Rearrange: subtract 7 from both sides.",
        "$3x = 15$",
        "$x = 5$",
      ],
    },
    "linear-equations-2": {
      content: "Solve: $2(x - 3) = x + 4$",
      hints: ["Expand the bracket: $2x - 6 = x + 4$", "Gather the $x$ terms on one side: $x = 10$"],
    },
    "linear-equations-3": {
      content: "A number plus twice itself is 27. What is the number?",
      hints: ["Write it as an equation: $x + 2x = 27$", "$3x = 27$, so $x = 9$"],
    },
    "linear-equations-4": {
      content: "Solve: $\\frac{x}{2} + 3 = 8$",
      hints: ["Subtract 3 from both sides: $\\frac{x}{2} = 5$", "Multiply by 2: $x = 10$"],
    },
    "linear-equations-5": {
      content: "Solve: $5x - 4 = 3x + 8$",
      hints: ["Subtract $3x$ from both sides: $2x - 4 = 8$", "$2x = 12$, so $x = 6$"],
    },
    "linear-functions-1": {
      content: "What is the gradient of $f(x) = 2x - 3$?",
      hints: ["In the form $y = mx + b$, $m$ is the gradient."],
    },
    "linear-functions-2": {
      content: "Where does $f(x) = -x + 5$ cross the y-axis?",
      hints: ["The y-intercept is the value at $x=0$: $f(0) = 5$"],
    },
    "linear-functions-3": {
      content: "Work out $f(4)$ for $f(x) = 3x + 1$",
      hints: ["Substitute $x=4$: $3 \\cdot 4 + 1$"],
    },
    "linear-functions-4": {
      content: "A line passes through $(0,2)$ and $(1,5)$. What is its gradient?",
      hints: ["$m = \\frac{y_2 - y_1}{x_2 - x_1}$", "$m = \\frac{5-2}{1-0} = 3$"],
    },
    "basic-geometry-1": {
      content: "A triangle has angles $50°$, $60°$ and $x$. What is $x$?",
      hints: ["The angles of a triangle add up to $180°$."],
    },
    "basic-geometry-2": {
      content: "A rectangle has sides 4 cm and 7 cm. What is its perimeter (cm)?",
      hints: ["$P = 2(a+b)$"],
    },
    "basic-geometry-3": {
      content: "A square has area $49\\ cm^2$. What is the length of a side (cm)?",
      hints: ["$A = a^2$, so $a = \\sqrt{A}$"],
    },
  },
};

const de: ContentPack = {
  skills: {
    "real-numbers": {
      name: "Reelle Zahlen",
      desc: "Natürliche, ganze, rationale und irrationale Zahlen, Zahlenstrahl, Betrag",
    },
    "algebraic-expressions": {
      name: "Algebraische Ausdrücke",
      desc: "Monome, Polynome, Rechnen mit algebraischen Ausdrücken, Faktorisieren",
    },
    "linear-equations": {
      name: "Lineare Gleichungen",
      desc: "Lineare Gleichungen mit einer Unbekannten lösen, Textaufgaben",
    },
    "linear-functions": {
      name: "Lineare Funktionen",
      desc: "Die Form y = mx + b, Steigung, Achsenabschnitt, Graphen lesen",
    },
    "systems-of-equations": {
      name: "Gleichungssysteme",
      desc: "Lineare Gleichungssysteme mit zwei Unbekannten, Einsetzungs- und Additionsverfahren",
    },
    "basic-geometry": {
      name: "Grundlagen der Geometrie",
      desc: "Dreiecke, Winkel, Umfang und Fläche, Vierecke, Kongruenz",
    },
    "triangle-congruence": {
      name: "Kongruenz von Dreiecken",
      desc: "Die Kongruenzsätze und Beweisaufgaben",
    },
    "statistics-intro": {
      name: "Grundlagen der Statistik",
      desc: "Mittelwert, Median, Modus, Streuung, relative Häufigkeit, Grundlagen der Wahrscheinlichkeit",
    },
    combinatorics: {
      name: "Kombinatorik",
      desc: "Permutationen, Kombinationen, einfache Abzählaufgaben",
    },
    probability: {
      name: "Wahrscheinlichkeitsrechnung",
      desc: "Klassische Wahrscheinlichkeit, Ereignisse, Zufallsexperimente",
    },
  },
  problems: {
    "real-numbers-1": {
      content: "Berechne: $|-7| + |3|$",
      hints: [
        "Ein Betrag ist nie negativ.",
        "$|-7| = 7$ und $|3| = 3$",
        "$7 + 3 = 10$",
      ],
    },
    "real-numbers-2": {
      content: "Berechne: $(-3)^2 - 2^3$",
      hints: [
        "Berechne die beiden Potenzen einzeln.",
        "$(-3)^2 = 9$ und $2^3 = 8$",
        "$9 - 8 = 1$",
      ],
    },
    "real-numbers-3": {
      content: "Runde auf $2$ Nachkommastellen: $\\sqrt{2}$",
      hints: ["$\\sqrt{2} \\approx 1,41421...$", "Die dritte Nachkommastelle rundet ab, nicht auf."],
    },
    "real-numbers-4": {
      content: "Löse: $|x - 4| = 6$ und gib die größere Lösung an.",
      hints: [
        "Es gibt zwei Fälle: $x - 4 = 6$ oder $x - 4 = -6$",
        "Der erste ergibt $x = 10$, der zweite $x = -2$",
      ],
    },
    "real-numbers-5": {
      content: "Berechne: $\\frac{2}{3} + \\frac{1}{6}$ (als Dezimalzahl)",
      hints: [
        "Bringe beide auf den Hauptnenner 6.",
        "$\\frac{4}{6} + \\frac{1}{6} = \\frac{5}{6} \\approx 0,83$",
      ],
    },
    "algebraic-expressions-1": {
      content: "Vereinfache und berechne für $x=2$: $3x^2 - 2x$",
      hints: ["Setze $x = 2$ ein.", "$3 \\cdot 4 - 2 \\cdot 2 = 12 - 4 = 8$"],
    },
    "algebraic-expressions-2": {
      content: "Faktorisiere und gib die Nullstelle an: $x^2 - 9 = 0$ (positive Nullstelle)",
      hints: ["$x^2 - 9 = (x-3)(x+3)$", "Die Nullstellen sind $x = 3$ und $x = -3$"],
    },
    "algebraic-expressions-3": {
      content: "Multipliziere $(x+2)^2$ aus und berechne für $x=1$",
      hints: ["$(x+2)^2 = x^2 + 4x + 4$", "$1 + 4 + 4 = 9$"],
    },
    "algebraic-expressions-4": {
      content: "Fasse zusammen: $5a - 3b + 2a + b$ und berechne für $a=2, b=1$",
      hints: [
        "Fasse gleichartige Glieder zusammen: $7a - 2b$",
        "Setze ein: $7 \\cdot 2 - 2 \\cdot 1 = 14 - 2 = 12$",
      ],
    },
    "linear-equations-1": {
      content: "Löse die Gleichung: $3x + 7 = 22$",
      hints: [
        "Forme um: ziehe auf beiden Seiten 7 ab.",
        "$3x = 15$",
        "$x = 5$",
      ],
    },
    "linear-equations-2": {
      content: "Löse: $2(x - 3) = x + 4$",
      hints: ["Löse die Klammer auf: $2x - 6 = x + 4$", "Bringe die $x$ auf eine Seite: $x = 10$"],
    },
    "linear-equations-3": {
      content: "Eine Zahl und ihr Doppeltes ergeben zusammen 27. Wie heißt die Zahl?",
      hints: ["Als Gleichung: $x + 2x = 27$", "$3x = 27$, also $x = 9$"],
    },
    "linear-equations-4": {
      content: "Löse: $\\frac{x}{2} + 3 = 8$",
      hints: ["Ziehe auf beiden Seiten 3 ab: $\\frac{x}{2} = 5$", "Multipliziere mit 2: $x = 10$"],
    },
    "linear-equations-5": {
      content: "Löse: $5x - 4 = 3x + 8$",
      hints: ["Ziehe $3x$ auf beiden Seiten ab: $2x - 4 = 8$", "$2x = 12$, also $x = 6$"],
    },
    "linear-functions-1": {
      content: "Wie groß ist die Steigung von $f(x) = 2x - 3$?",
      hints: ["In der Form $y = mx + b$ ist $m$ die Steigung."],
    },
    "linear-functions-2": {
      content: "Wo schneidet $f(x) = -x + 5$ die y-Achse?",
      hints: ["Der y-Achsenabschnitt ist der Wert bei $x=0$: $f(0) = 5$"],
    },
    "linear-functions-3": {
      content: "Berechne $f(4)$ für $f(x) = 3x + 1$",
      hints: ["Setze $x=4$ ein: $3 \\cdot 4 + 1$"],
    },
    "linear-functions-4": {
      content: "Eine Gerade verläuft durch $(0,2)$ und $(1,5)$. Wie groß ist ihre Steigung?",
      hints: ["$m = \\frac{y_2 - y_1}{x_2 - x_1}$", "$m = \\frac{5-2}{1-0} = 3$"],
    },
    "basic-geometry-1": {
      content: "Ein Dreieck hat die Winkel $50°$, $60°$ und $x$. Wie groß ist $x$?",
      hints: ["Die Winkelsumme im Dreieck beträgt $180°$."],
    },
    "basic-geometry-2": {
      content: "Ein Rechteck hat die Seiten 4 cm und 7 cm. Wie groß ist der Umfang (cm)?",
      hints: ["$U = 2(a+b)$"],
    },
    "basic-geometry-3": {
      content: "Ein Quadrat hat den Flächeninhalt $49\\ cm^2$. Wie lang ist eine Seite (cm)?",
      hints: ["$A = a^2$, also $a = \\sqrt{A}$"],
    },
  },
};

/** Hungarian is absent: it is the base content, served straight from data.ts. */
export const CONTENT_TRANSLATIONS: Partial<Record<Locale, ContentPack>> = { en, de };
