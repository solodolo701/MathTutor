"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
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

const phaseLabels: Record<Phase, { label: string; color: string }> = {
  warmup:   { label: "Bemelegítés", color: "var(--color-xp-400)" },
  practice: { label: "Gyakorlás",   color: "var(--color-brand-400)" },
  review:   { label: "Ismétlés",    color: "var(--color-mastery-400)" },
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const currentProblem = problems[currentIndex];
  const phase = getPhase(currentIndex, problems.length);
  const progressPct = ((currentIndex + 1) / problems.length) * 100;
  const isNearLimit = !isPremium && (answeredThisSession + problemsToday >= FREE_DAILY_LIMIT - 1);

  useEffect(() => {
    setStartTime(Date.now());
    setHintLevel(0);
    setShowSolution(false);
    setFeedback(null);
    setNetworkError(false);
  }, [currentIndex]);

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!currentProblem || isSubmitting || feedback) return;
      if (!isPremium && answeredThisSession + problemsToday >= FREE_DAILY_LIMIT) {
        setLimitReached(true);
        return;
      }

      setIsSubmitting(true);
      setNetworkError(false);
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
        } else {
          const hints = (currentProblem.hints as Array<{ level: number; text_hu: string }> | null) ?? [];
          setHintLevel((h) => Math.min(h + 1, hints.length));
        }
      } catch {
        setNetworkError(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentProblem, isSubmitting, feedback, isPremium, answeredThisSession, problemsToday, startTime]
  );

  const handleNext = useCallback(async () => {
    if (currentIndex >= problems.length - 1) {
      const sr = await updateStreak(userId);
      setStreakResult(sr);
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, problems.length, userId]);

  /* ─── Limit wall ─────────────────────────────────────────────── */
  if (limitReached) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center py-16"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--color-brand-950)", border: "1.5px solid var(--color-brand-border)" }}
        >
          <AlertCircle size={28} style={{ color: "var(--color-brand-400)" }} />
        </div>
        <h2 className="text-xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Napi korlát elérve
        </h2>
        <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Ma már {FREE_DAILY_LIMIT} feladatot oldottál meg. Válts prémiumra a korlátlan hozzáférésért!
        </p>
        <button
          onClick={() => router.push("/app/pricing")}
          className="px-6 py-3 rounded-xl font-semibold transition-colors mb-4 block mx-auto"
          style={{ background: "var(--color-brand-500)", color: "white" }}
        >
          Prémium aktiválása — 3,99 EUR/hó
        </button>
        <button
          onClick={() => router.push("/app/dashboard")}
          className="text-sm transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          Vissza az irányítópulthoz
        </button>
      </motion.div>
    );
  }

  /* ─── Session complete ────────────────────────────────────────── */
  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Feladatsor kész!
        </h2>

        {streakResult && streakResult.current > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold mb-4 border"
            style={{
              background: "var(--color-streak-950)",
              borderColor: "var(--color-streak-border)",
              color: "var(--color-streak-400)",
            }}
          >
            🔥 {streakResult.current} napos sorozat!
            {streakResult.newShield && (
              <span style={{ color: "var(--color-shield-400)" }} className="ml-1">
                🛡️ Új sorozatvédő!
              </span>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
          {[
            { icon: "⚡", label: "Szerzett XP", value: totalXp, color: "var(--color-xp-400)" },
            { icon: "✓", label: "Helyes", value: `${correctCount}/${problems.length}`, color: "var(--color-success-400)" },
            { icon: "📚", label: "Képesség", value: skill.name_hu, color: "var(--color-brand-400)" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 border"
              style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-base)" }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/app/skills")}
            className="px-6 py-3 rounded-xl font-medium transition-colors"
            style={{ background: "var(--color-brand-500)", color: "white" }}
          >
            Holnap folytatom →
          </button>
          <button
            onClick={() => router.push("/app/dashboard")}
            className="px-6 py-3 rounded-xl font-medium border transition-colors"
            style={{
              background: "var(--color-bg-card)",
              borderColor: "var(--color-border-base)",
              color: "var(--color-text-secondary)",
            }}
          >
            Irányítópult
          </button>
        </div>
      </motion.div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="text-center py-16" style={{ color: "var(--color-text-muted)" }}>
        Nincsenek elérhető feladatok ehhez a képességhez.
      </div>
    );
  }

  const hints = currentProblem.hints as Array<{ level: number; text_hu: string }>;
  const phaseInfo = phaseLabels[phase];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          aria-label="Kilépés a feladatsorból"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 text-sm">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: "var(--color-bg-hover)", color: phaseInfo.color }}
          >
            {phaseInfo.label}
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>
            {currentIndex + 1} / {problems.length}
          </span>
        </div>

        <span className="text-sm font-semibold" style={{ color: "var(--color-xp-400)" }}>
          ⚡ {totalXp} XP
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full rounded-full h-2 overflow-hidden"
        style={{ background: "var(--color-bg-hover)" }}
      >
        <motion.div
          className="h-2 rounded-full"
          style={{ background: "var(--color-brand-500)", originX: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Near-limit warning */}
      {isNearLimit && (
        <div
          className="px-4 py-2.5 rounded-lg text-sm border"
          style={{
            background: "var(--color-hint-950)",
            borderColor: "var(--color-hint-border)",
            color: "var(--color-hint-400)",
          }}
        >
          <Lightbulb size={14} className="inline mr-2" />
          1 feladatod maradt ma. <strong>Prémiummal korlátlan.</strong>
        </div>
      )}

      {/* Skill name */}
      <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        {skill.name_hu}
      </div>

      {/* Problem card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-2xl p-6 border"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-base)" }}
        >
          <ProblemDisplay
            problem={currentProblem}
            onAnswer={handleAnswer}
            disabled={!!feedback || isSubmitting}
          />

          {/* Submitting overlay */}
          {isSubmitting && (
            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 border-transparent border-t-current"
              />
              Értékelés…
            </div>
          )}

          {/* Network error */}
          {networkError && !isSubmitting && (
            <div
              className="mt-4 p-3 rounded-lg border text-sm"
              style={{
                background: "var(--color-danger-950)",
                borderColor: "var(--color-danger-border)",
                color: "var(--color-danger-400)",
              }}
            >
              Hálózati hiba. Próbáld újra!
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {feedback.correct ? (
              <motion.div
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="rounded-xl p-4 text-center border"
                style={{
                  background: "var(--color-success-950)",
                  borderColor: "var(--color-success-border)",
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle size={18} style={{ color: "var(--color-success-400)" }} />
                  <p className="font-bold text-lg" style={{ color: "var(--color-success-400)" }}>
                    Helyes!
                  </p>
                </div>
                <p className="text-sm" style={{ color: "var(--color-success-400)", opacity: 0.8 }}>
                  Tudás: {Math.round(feedback.newPKnow * 100)}%
                  {feedback.mastered && " 🏆 Képesség elsajátítva!"}
                </p>
              </motion.div>
            ) : (
              <div
                className="rounded-xl p-4 space-y-3 border"
                style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-strong)" }}
              >
                <p className="font-medium" style={{ color: "var(--color-hint-400)" }}>
                  Majdnem! Gondold át újra.
                </p>

                {hintLevel > 0 && hints[hintLevel - 1] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-lg p-3"
                    style={{ background: "var(--color-bg-hover)" }}
                  >
                    <span
                      className="text-xs uppercase tracking-wide"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {hintLevel}. tipp
                    </span>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                      {hints[hintLevel - 1].text_hu}
                    </p>
                  </motion.div>
                )}

                {hintLevel < hints.length && (
                  <button
                    onClick={() => setHintLevel((h) => h + 1)}
                    className="text-sm flex items-center gap-1 transition-colors"
                    style={{ color: "var(--color-brand-400)" }}
                  >
                    <Lightbulb size={14} />
                    Következő tipp
                  </button>
                )}

                {hintLevel >= hints.length && !showSolution && (
                  <button
                    onClick={() => setShowSolution(true)}
                    className="text-sm transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Mutatom a megoldást
                  </button>
                )}

                {showSolution && (
                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      background: "var(--color-hint-950)",
                      borderColor: "var(--color-hint-border)",
                    }}
                  >
                    <span
                      className="text-xs uppercase tracking-wide"
                      style={{ color: "var(--color-hint-400)", opacity: 0.7 }}
                    >
                      Megoldás
                    </span>
                    <p className="text-sm mt-1" style={{ color: "var(--color-hint-400)" }}>
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
              className="mt-4 w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              style={{ background: "var(--color-brand-500)", color: "white" }}
            >
              {currentIndex >= problems.length - 1 ? "Összefoglaló" : "Következő feladat"}
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP float — anchored near the XP text, not viewport-fixed */}
      <AnimatePresence>
        {xpAnimation !== null && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-16 right-8 text-xl font-bold pointer-events-none z-50"
            style={{ color: "var(--color-xp-400)" }}
          >
            +{xpAnimation} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit confirmation dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="rounded-2xl p-6 max-w-sm w-full border"
              style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-base)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--color-text-primary)" }}>
                Kilépsz a feladatsorból?
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                A folyamatod elvész. Biztosan kilépel?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/app/skills")}
                  className="flex-1 py-2.5 rounded-xl font-medium transition-colors border"
                  style={{
                    background: "var(--color-bg-card)",
                    borderColor: "var(--color-border-base)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Kilépés
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-colors"
                  style={{ background: "var(--color-brand-500)", color: "white" }}
                >
                  Folytatom
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
