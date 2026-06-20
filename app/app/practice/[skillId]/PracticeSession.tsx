"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Problem, Skill } from "@/types/supabase";
import { ProblemDisplay } from "@/components/math/ProblemDisplay";
import { submitAnswer, updateStreak } from "@/app/actions/session";

interface Props {
  skill: Skill;
  problems: Problem[];
  userId: string;
  isPremium: boolean;
  problemsToday: number;
}

const FREE_DAILY_LIMIT = 5;

type Phase = "warmup" | "practice" | "review";

function getPhase(index: number, total: number): Phase {
  if (index < 3) return "warmup";
  if (index >= total - 3) return "review";
  return "practice";
}

const phaseLabels: Record<Phase, string> = {
  warmup: "Bemelegítés",
  practice: "Gyakorlás",
  review: "Ismétlés",
};

export default function PracticeSession({ skill, problems, userId, isPremium, problemsToday }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answeredThisSession, setAnsweredThisSession] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    xpEarned: number;
    newPKnow: number;
    mastered: boolean;
  } | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(!isPremium && problemsToday >= FREE_DAILY_LIMIT);
  const [streakResult, setStreakResult] = useState<{ current: number; newShield: boolean } | null>(null);

  const currentProblem = problems[currentIndex];
  const phase = getPhase(currentIndex, problems.length);

  useEffect(() => {
    setStartTime(Date.now());
    setHintLevel(0);
    setShowSolution(false);
    setFeedback(null);
  }, [currentIndex]);

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!currentProblem || isSubmitting || feedback) return;
      if (!isPremium && answeredThisSession + problemsToday >= FREE_DAILY_LIMIT) {
        setLimitReached(true);
        return;
      }

      setIsSubmitting(true);
      const timeMs = Date.now() - startTime;

      try {
        const result = await submitAnswer(currentProblem.id, answer, timeMs);
        setFeedback(result);
        setAnsweredThisSession((n) => n + 1);

        if (result.correct) {
          setCorrectCount((n) => n + 1);
          setTotalXp((xp) => xp + result.xpEarned);
          setXpAnimation(result.xpEarned);
          setTimeout(() => setXpAnimation(null), 1500);

          if (!result.correct) {
            setHintLevel((h) => Math.min(h + 1, 3));
          }
        } else {
          const hints = (currentProblem.hints as Array<{ level: number; text_hu: string }> | null) ?? [];
          setHintLevel((h) => Math.min(h + 1, hints.length));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentProblem, isSubmitting, feedback, isPremium, answeredThisSession, problemsToday, startTime]
  );

  const handleNext = useCallback(async () => {
    if (currentIndex >= problems.length - 1) {
      // Session complete
      const sr = await updateStreak(userId);
      setStreakResult(sr);
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, problems.length, userId]);

  if (limitReached) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white mb-3">Napi korlát elérve</h2>
        <p className="text-zinc-400 mb-6">
          Ma már {FREE_DAILY_LIMIT} feladatot oldottál meg. Válts prémiumra a korlátlan hozzáférésért!
        </p>
        <button
          onClick={() => router.push("/app/pricing")}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
        >
          Prémium aktiválása — 3,99 EUR/hó
        </button>
        <button
          onClick={() => router.push("/app/dashboard")}
          className="block mx-auto mt-4 text-zinc-500 hover:text-zinc-300 text-sm"
        >
          Vissza az irányítópulthoz
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">Feladatsor kész!</h2>

        {streakResult && streakResult.current > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-950 border border-orange-700 rounded-full text-orange-300 font-bold mb-4"
          >
            🔥 {streakResult.current} napos sorozat!
            {streakResult.newShield && <span className="text-blue-400 ml-1">🛡️ Új sorozatvédő!</span>}
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
          {[
            { icon: "⚡", label: "Szerzett XP", value: totalXp, color: "text-yellow-400" },
            { icon: "✓", label: "Helyes", value: `${correctCount}/${problems.length}`, color: "text-green-400" },
            { icon: "📚", label: "Képesség", value: `${skill.name_hu}`, color: "text-indigo-400" },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/app/skills")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
          >
            Holnap folytatom →
          </button>
          <button
            onClick={() => router.push("/app/dashboard")}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
          >
            Irányítópult
          </button>
        </div>
      </motion.div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="text-center py-16 text-zinc-400">
        Nincsenek elérhető feladatok ehhez a képességhez.
      </div>
    );
  }

  const hints = currentProblem.hints as Array<{ level: number; text_hu: string }>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            {currentIndex + 1}. feladat / {problems.length}
          </span>
          <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-xs font-medium text-zinc-300">
            {phaseLabels[phase]}
          </span>
          <span className="text-yellow-400 font-medium">⚡ {totalXp} XP</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <motion.div
            className="bg-indigo-500 h-2 rounded-full"
            animate={{ width: `${((currentIndex) / problems.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Skill name */}
      <div className="text-zinc-500 text-sm">{skill.name_hu}</div>

      {/* Problem card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <ProblemDisplay
          problem={currentProblem}
          onAnswer={handleAnswer}
          disabled={!!feedback || isSubmitting}
        />
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {feedback.correct ? (
              <div className="bg-green-950 border border-green-700 rounded-xl p-4 text-center">
                <p className="text-green-400 font-bold text-lg">✓ Helyes!</p>
                <p className="text-green-300 text-sm mt-1">
                  Tudás: {Math.round(feedback.newPKnow * 100)}%
                  {feedback.mastered && " 🏆 Képesség elsajátítva!"}
                </p>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                <p className="text-amber-400 font-medium">Nem sikerült — próbáld újra!</p>

                {hintLevel > 0 && hints[hintLevel - 1] && (
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-wide">
                      {hintLevel}. tipp
                    </span>
                    <p className="text-zinc-300 text-sm mt-1">{hints[hintLevel - 1].text_hu}</p>
                  </div>
                )}

                {hintLevel < hints.length && (
                  <button
                    onClick={() => setHintLevel((h) => h + 1)}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    Következő tipp →
                  </button>
                )}

                {hintLevel >= hints.length && !showSolution && (
                  <button
                    onClick={() => setShowSolution(true)}
                    className="text-sm text-zinc-400 hover:text-zinc-300"
                  >
                    Mutatom a megoldást
                  </button>
                )}

                {showSolution && (
                  <div className="bg-amber-950 border border-amber-800 rounded-lg p-3">
                    <span className="text-xs text-amber-500 uppercase tracking-wide">Megoldás</span>
                    <p className="text-amber-200 text-sm mt-1">
                      {currentProblem.solution_numeric !== null
                        ? `Válasz: ${currentProblem.solution_numeric}`
                        : currentProblem.solution_latex}
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleNext}
              className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
            >
              {currentIndex >= problems.length - 1 ? "Összefoglaló →" : "Következő feladat →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP floating animation */}
      <AnimatePresence>
        {xpAnimation !== null && (
          <motion.div
            initial={{ opacity: 1, y: 0, x: "50%" }}
            animate={{ opacity: 0, y: -60 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 right-8 text-2xl font-bold text-yellow-400 pointer-events-none z-50"
          >
            +{xpAnimation} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
