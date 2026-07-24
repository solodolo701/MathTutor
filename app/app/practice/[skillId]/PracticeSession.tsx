"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  if (index < 2) return "warmup";
  if (index >= total - 1) return "review";
  return "practice";
}

const PHASE_META: Record<Phase, { label: string; color: string }> = {
  warmup:   { label: "Bemelegítés", color: "#D98324" },
  practice: { label: "Gyakorlás",   color: "var(--color-primary)" },
  review:   { label: "Ismétlés",    color: "var(--color-amber)" },
};

const CORRECT_PHRASES = [
  "Szuper! Pontosan így kell.",
  "Remek munka!",
  "Magabiztosan haladsz!",
  "Ügyes vagy — ez az!",
];

let phraseIndex = 0;
function nextPhrase() {
  return CORRECT_PHRASES[phraseIndex++ % CORRECT_PHRASES.length];
}

interface XpPopup {
  id: number;
  xp: number;
}

let popupId = 0;

export default function PracticeSession({ skill, problems, userId, isPremium, problemsToday }: Props) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answeredThisSession, setAnsweredThisSession] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    xpEarned: number;
    newPKnow: number;
    mastered: boolean;
  } | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [xpPopups, setXpPopups] = useState<XpPopup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(!isPremium && problemsToday >= FREE_DAILY_LIMIT);
  const [streakResult, setStreakResult] = useState<{ current: number; newShield: boolean } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [correctPhrase, setCorrectPhrase] = useState("");

  const currentProblem = problems[currentIndex];
  const phase = getPhase(currentIndex, problems.length);
  const phaseInfo = PHASE_META[phase];
  const hints = (currentProblem?.hints as Array<{ level: number; text_hu: string }> | null) ?? [];
  const isNearLimit = !isPremium && answeredThisSession + problemsToday >= FREE_DAILY_LIMIT - 1;
  const isLastProblem = currentIndex >= problems.length - 1;

  useEffect(() => {
    setStartTime(Date.now());
    setHintsShown(0);
    setWrongAttempts(0);
    setFeedback(null);
    setNetworkError(false);
  }, [currentIndex]);

  const spawnXpPopup = useCallback((xp: number) => {
    const id = ++popupId;
    setXpPopups((p) => [...p, { id, xp }]);
    setTimeout(() => setXpPopups((p) => p.filter((x) => x.id !== id)), 1400);
  }, []);

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
          setSessionXp((xp) => xp + result.xpEarned);
          setCorrectPhrase(nextPhrase());
          spawnXpPopup(result.xpEarned);
        } else {
          setWrongAttempts((n) => n + 1);
          setHintsShown((h) => Math.min(h + 1, hints.length));
        }
      } catch {
        setNetworkError(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentProblem, isSubmitting, feedback, isPremium, answeredThisSession, problemsToday, startTime, hints.length, spawnXpPopup]
  );

  const handleNext = useCallback(async () => {
    if (isLastProblem) {
      const sr = await updateStreak(userId);
      setStreakResult(sr);
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLastProblem, userId]);

  const requestHint = useCallback(() => {
    setHintsShown((h) => Math.min(h + 1, hints.length));
  }, [hints.length]);

  /* ── Limit wall ─────────────────────────────────────────────────── */
  if (limitReached) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 460, margin: "0 auto", textAlign: "center", paddingTop: 64 }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "var(--color-surface-3)",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-ink)", marginBottom: 12 }}>
          Napi korlát elérve
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 32 }}>
          Ma már {FREE_DAILY_LIMIT} feladatot oldottál meg. Válts prémiumra a korlátlan hozzáférésért!
        </p>
        <button
          onClick={() => router.push("/app/pricing")}
          style={{
            display: "block",
            margin: "0 auto 16px",
            padding: "14px 28px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Prémium aktiválása — 3,99 EUR/hó
        </button>
        <button
          onClick={() => router.push("/app/dashboard")}
          style={{ fontSize: 14, color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          Vissza az irányítópulthoz
        </button>
      </motion.div>
    );
  }

  /* ── Session complete ────────────────────────────────────────────── */
  if (completed) {
    const streakNew = (streakResult?.current ?? 0) + 1;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{
          maxWidth: 460,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 24,
          padding: 40,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".04em",
            color: "var(--color-faint)",
            marginBottom: 8,
          }}
        >
          Munka elvégezve
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "var(--color-amber)",
            margin: "14px 0",
          }}
        >
          +{sessionXp} XP
        </div>

        {/* Streak line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontWeight: 700,
            color: "var(--color-amber-dark)",
            marginBottom: 24,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flame-flicker"
          >
            <path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c0-2-1-3-1-4 2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-6 5-9z" />
          </svg>
          {streakNew} napos sorozat aktív
          {streakResult?.newShield && (
            <span style={{ color: "var(--color-primary)", marginLeft: 4 }}>· Új sorozatvédő!</span>
          )}
        </div>

        {/* Skill improved rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 420,
            margin: "0 auto 28px",
          }}
        >
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: 12,
              padding: "12px 16px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              <span style={{ color: "var(--color-ink)" }}>{skill.name_hu}</span>
              <span style={{ color: "var(--color-success)" }}>
                {Math.round(Math.max(0, problems.length - correctCount) * 5)}% → {Math.round(correctCount / Math.max(1, problems.length) * 100)}%
              </span>
            </div>
            <div style={{ height: 6, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.round(correctCount / Math.max(1, problems.length) * 100)}%`,
                  background: "var(--color-success)",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/app/dashboard")}
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Vissza az irányítópulthoz
        </button>
      </motion.div>
    );
  }

  if (!currentProblem) {
    return (
      <div style={{ textAlign: "center", paddingTop: 64, color: "var(--color-faint)" }}>
        Nincsenek elérhető feladatok ehhez a képességhez.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
      {/* Phase progress strip */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {problems.map((_, i) => {
          const p = getPhase(i, problems.length);
          const filled = i <= currentIndex;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: filled ? PHASE_META[p].color : "var(--color-border)",
                transition: "background 0.3s",
              }}
            />
          );
        })}
      </div>

      {/* Near-limit warning */}
      {isNearLimit && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--color-amber-tint-2)",
            color: "var(--color-amber-darker)",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          1 feladatod maradt ma. Prémiummal korlátlan.
        </div>
      )}

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          ref={cardRef}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            padding: 32,
            position: "relative",
          }}
        >
          {/* Phase/skill eyebrow */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              color: phaseInfo.color,
              marginBottom: 12,
            }}
          >
            {phaseInfo.label} · {skill.name_hu}
          </div>

          <ProblemDisplay
            problem={currentProblem}
            onAnswer={handleAnswer}
            disabled={!!feedback || isSubmitting}
          />

          {/* Submitting spinner */}
          {isSubmitting && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                color: "var(--color-muted)",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTop: "2px solid var(--color-primary)",
                }}
              />
              Értékelés…
            </div>
          )}

          {/* Network error */}
          {networkError && !isSubmitting && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 10,
                background: "var(--color-danger-tint)",
                color: "var(--color-danger)",
                fontSize: 14,
              }}
            >
              Hálózati hiba — próbáld újra!
            </div>
          )}

          {/* Feedback banner */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  marginTop: 18,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: feedback.correct ? "var(--color-success-tint)" : "var(--color-amber-tint-2)",
                  color: feedback.correct ? "var(--color-success)" : "#B4761F",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                {feedback.correct ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                )}
                <div>
                  {feedback.correct
                    ? correctPhrase
                    : "Még nem az — nézd meg az alábbi tippet, és próbáld újra!"}
                  {feedback.correct && feedback.mastered && (
                    <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                      🏆 Készség elsajátítva!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hints */}
          {hintsShown > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {hints.slice(0, hintsShown).map((h, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13.5,
                    color: "var(--color-ink)",
                  }}
                >
                  <strong>Tipp {i + 1}:</strong> {h.text_hu}
                </div>
              ))}
            </div>
          )}

          {/* Footer row */}
          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Hint request button */}
            {hintsShown < hints.length && !feedback ? (
              <button
                onClick={requestHint}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary)",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l2 7h7l-6 4 2 7-5-4-5 4 2-7-6-4h7z" />
                </svg>
                Segítség kérése ({hintsShown}/3)
              </button>
            ) : (
              <div />
            )}

            {/* Upsell note */}
            {!isPremium && (
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-disabled)" }}>
                Több tipp AI-val — Prémium
              </div>
            )}
          </div>

          {/* Next/summary button */}
          {feedback && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              style={{
                marginTop: 18,
                width: "100%",
                padding: "14px 24px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                background: "var(--color-ink)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {isLastProblem ? "Összefoglaló" : "Következő"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}

          {/* XP popups */}
          {xpPopups.map((popup) => (
            <div
              key={popup.id}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                fontSize: 20,
                fontWeight: 800,
                color: "var(--color-amber)",
                pointerEvents: "none",
                animation: "xpFloat 1.3s ease-out forwards",
              }}
            >
              +{popup.xp} XP
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Exit button */}
      <button
        onClick={() => setShowExitConfirm(true)}
        style={{
          position: "fixed",
          top: 20,
          right: 24,
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-muted)",
          zIndex: 10,
        }}
        aria-label="Kilépés"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12" /><path d="M18 6L6 18" />
        </svg>
      </button>

      {/* Exit confirmation */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(34,31,54,0.4)",
            }}
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              style={{
                background: "#fff",
                border: "1px solid var(--color-border)",
                borderRadius: 20,
                padding: 28,
                maxWidth: 360,
                width: "100%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-ink)", marginBottom: 8 }}>
                Kilépsz a feladatsorból?
              </h3>
              <p style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 24 }}>
                A folyamatod elvész. Biztosan kilépel?
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => router.push("/app/skills")}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 14,
                    background: "#fff",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                    cursor: "pointer",
                  }}
                >
                  Kilépés
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    background: "var(--color-primary)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                  }}
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
