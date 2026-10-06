"use client";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { t } from "@/lib/i18n/t";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Problem, Skill } from "@/types/supabase";
import { ProblemDisplay, type AnswerStatus } from "@/components/math/ProblemDisplay";
import { MathText } from "@/components/math/MathDisplay";
import { submitAnswer, updateStreak } from "@/app/actions/session";

interface Props {
  lang: Locale;
  dict: Dictionary;
  skill: Skill;
  problems: Problem[];
  userId: string;
  isPremium: boolean;
  problemsToday: number;
}

const FREE_DAILY_LIMIT = 5;
const MASTERY_THRESHOLD = 0.8;

type Phase = "warmup" | "practice" | "review";

function getPhase(index: number, total: number): Phase {
  if (index < 2) return "warmup";
  if (index >= total - 1) return "review";
  return "practice";
}

/* Phase colour is only ever used for a dot or a bar — never for text — so it
   is free to be saturated. Labels sit in --color-ink on a tinted pill, which
   is what actually has to clear 4.5:1 in both themes. */
type PhaseLabelKey = "phaseWarmup" | "phasePractice" | "phaseReview";
type PhaseEnterKey = "phaseEnterWarmup" | "phaseEnterPractice" | "phaseEnterReview";

const PHASE_META: Record<Phase, { labelKey: PhaseLabelKey; dot: string; tint: string; enterKey: PhaseEnterKey }> = {
  warmup: {
    labelKey: "phaseWarmup" as const,
    dot: "var(--color-amber-darker)",
    tint: "var(--color-amber-tint)",
    enterKey: "phaseEnterWarmup" as const,
  },
  practice: {
    labelKey: "phasePractice" as const,
    dot: "var(--color-primary-solid)",
    tint: "var(--color-brand-950)",
    enterKey: "phaseEnterPractice" as const,
  },
  review: {
    labelKey: "phaseReview" as const,
    dot: "var(--color-amber-darker)",
    tint: "var(--color-amber-tint)",
    enterKey: "phaseEnterReview" as const,
  },
};

// Hints escalate: nudge -> intermediate step -> worked answer. Naming them
// by what they give lets a student stop before the answer is spoiled.



let phraseIndex = 0;
function nextPhrase(list: string[]) {
  return list[phraseIndex++ % list.length];
}

interface XpPopup {
  id: number;
  xp: number;
}

let popupId = 0;

type ItemState = "pending" | "correct" | "struggled" | "current";

export default function PracticeSession({ lang, dict, skill,
  problems,
  userId,
  isPremium,
  problemsToday,
}: Props) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answeredThisSession, setAnsweredThisSession] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<Record<number, "correct" | "struggled">>({});
  const [combo, setCombo] = useState(0);
  const [comboFlash, setComboFlash] = useState(0);
  const [pKnow, setPKnow] = useState<number | null>(null);
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
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [limitReached, setLimitReached] = useState(!isPremium && problemsToday >= FREE_DAILY_LIMIT);
  const [streakResult, setStreakResult] = useState<{ current: number; newShield: boolean } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [message, setMessage] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [phaseAnnounce, setPhaseAnnounce] = useState<Phase | null>(null);

  /* When the clock started for the attempt on screen. A ref, not state:
     nothing renders from it, and reading Date.now() during render is impure. */
  const startTimeRef = useRef(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );
  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  const currentProblem = problems[currentIndex];
  const phase = getPhase(currentIndex, problems.length);
  const phaseInfo = PHASE_META[phase];
  const hints = useMemo(
    () => (currentProblem?.hints as Array<{ level: number; text_hu: string }> | null) ?? [],
    [currentProblem]
  );
  const isNearLimit = !isPremium && answeredThisSession + problemsToday >= FREE_DAILY_LIMIT - 1;
  const isLastProblem = currentIndex >= problems.length - 1;

  const status: AnswerStatus = isSubmitting
    ? "submitting"
    : feedback
      ? feedback.correct
        ? "correct"
        : "incorrect"
      : "idle";

  /* Moving to a new problem resets the per-problem state. Doing it during
     render (React's "adjust state when a prop changes" pattern) rather than in
     an effect avoids a frame where the previous problem's verdict and hints are
     painted over the new question. */
  const [renderedIndex, setRenderedIndex] = useState(currentIndex);
  if (renderedIndex !== currentIndex) {
    setRenderedIndex(currentIndex);
    setHintsShown(0);
    setWrongAttempts(0);
    setFeedback(null);
    setNetworkError(false);
  }

  // Restart the clock for each fresh attempt (new problem, or a retry).
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [currentIndex, resetKey]);

  /* Announce a phase change so the shift in difficulty is deliberate rather
     than something the student only notices by getting things wrong. */
  const prevPhase = useRef<Phase>(phase);
  useEffect(() => {
    if (prevPhase.current !== phase) {
      prevPhase.current = phase;
      setPhaseAnnounce(phase);
      later(() => setPhaseAnnounce(null), 2600);
    }
  }, [phase, later]);

  const spawnXpPopup = useCallback(
    (xp: number) => {
      const id = ++popupId;
      setXpPopups((p) => [...p, { id, xp }]);
      later(() => setXpPopups((p) => p.filter((x) => x.id !== id)), 1500);
    },
    [later]
  );

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!currentProblem || isSubmitting || feedback) return;
      if (!isPremium && answeredThisSession + problemsToday >= FREE_DAILY_LIMIT) {
        setLimitReached(true);
        return;
      }

      setIsSubmitting(true);
      setNetworkError(false);
      const timeMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;

      try {
        const result = await submitAnswer(currentProblem.id, answer, timeMs);
        setFeedback(result);
        setPKnow(result.newPKnow);
        setAnsweredThisSession((n) => n + 1);

        if (result.correct) {
          setCorrectCount((n) => n + 1);
          setSessionXp((xp) => xp + result.xpEarned);
          setMessage(nextPhrase(dict.practice.correctPhrases));
          spawnXpPopup(result.xpEarned);
          setResults((r) => ({
            ...r,
            [currentIndex]: wrongAttempts > 0 ? "struggled" : "correct",
          }));
          // A clean solve extends the run; one that needed a retry restarts it.
          const nextCombo = wrongAttempts > 0 ? 0 : combo + 1;
          setCombo(nextCombo);
          if (nextCombo >= 3) {
            setComboFlash(nextCombo);
            later(() => setComboFlash(0), 2400);
          }
        } else {
          setCombo(0);
          setWrongAttempts((n) => n + 1);
          setMessage(nextPhrase(dict.practice.incorrectPhrases));
          setResults((r) => ({ ...r, [currentIndex]: "struggled" }));
          // Escalate the ladder by one rung so there is always a next thing to try.
          setHintsShown((h) => Math.min(h + 1, hints.length));
        }
      } catch {
        setNetworkError(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      currentProblem,
      isSubmitting,
      feedback,
      isPremium,
      answeredThisSession,
      problemsToday,
      hints.length,
      spawnXpPopup,
      currentIndex,
      wrongAttempts,
      combo,
      later,
    ]
  );

  const handleNext = useCallback(async () => {
    if (isAdvancing) return;
    if (isLastProblem) {
      setIsAdvancing(true);
      try {
        const sr = await updateStreak(userId);
        setStreakResult(sr);
      } catch {
        setStreakResult(null);
      }
      setCompleted(true);
      setIsAdvancing(false);
    } else {
      setResetKey((k) => k + 1);
      setCurrentIndex((i) => i + 1);
    }
  }, [isLastProblem, userId, isAdvancing]);

  /* A wrong answer used to be a dead end: the copy said "try again" but the
     only control was "next". Retrying clears the verdict, keeps the escalated
     hint, and hands focus back to the field. */
  const handleRetry = useCallback(() => {
    setFeedback(null);
    setNetworkError(false);
    setResetKey((k) => k + 1);
  }, []);

  const requestHint = useCallback(() => {
    setHintsShown((h) => Math.min(h + 1, hints.length));
  }, [hints.length]);

  /* Keyboard flow: the field owns Enter while answering (native form submit);
     once a verdict is on screen the field is disabled, so Enter is free to
     mean "the primary button". Escape asks to leave. */
  useEffect(() => {
    if (completed || limitReached) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowExitConfirm((v) => !v);
        return;
      }
      if (showExitConfirm) return;
      if (e.key !== "Enter" || e.repeat) return;
      if (!feedback || isSubmitting) return;
      e.preventDefault();
      if (feedback.correct) void handleNext();
      else handleRetry();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback, isSubmitting, showExitConfirm, completed, limitReached, handleNext, handleRetry]);

  /* ── Shared bits ─────────────────────────────────────────────────── */

  const primaryBtn: React.CSSProperties = {
    padding: "13px 24px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    background: "var(--color-primary-solid)",
    color: "var(--color-on-primary)",
    border: "none",
    cursor: "pointer",
  };

  const quietBtn: React.CSSProperties = {
    padding: "13px 20px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 14.5,
    background: "var(--color-card)",
    color: "var(--color-ink)",
    border: "1px solid var(--color-border)",
    cursor: "pointer",
  };

  const rise = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } }
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.28, delay, ease: [0.32, 0.72, 0, 1] as const },
        };

  /* ── Limit wall ─────────────────────────────────────────────────── */
  if (limitReached) {
    return (
      <motion.div
        {...rise()}
        style={{ maxWidth: 460, margin: "0 auto", textAlign: "center", paddingTop: 48 }}
      >
        <motion.div
          initial={reduce ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
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
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-solid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </motion.div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-ink)", marginBottom: 10 }}>
          {dict.practice.limitHeading}
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--color-muted)", marginBottom: 8 }}>
          {t(dict.practice.limitLine1, { n: FREE_DAILY_LIMIT })}
          {dict.practice.limitLine2}
        </p>
        {sessionXp > 0 && (
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)", marginBottom: 28 }}>
            {t(dict.practice.limitEarned, { xp: sessionXp })}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginTop: 20 }}>
          <button onClick={() => router.push(`/${lang}/app/pricing`)} className="hover-lift" style={{ ...primaryBtn, width: "100%", maxWidth: 320 }}>
            {dict.practice.upgradeCta}
          </button>
          <button
            onClick={() => router.push(`/${lang}/app/dashboard`)}
            style={{ ...quietBtn, width: "100%", maxWidth: 320, background: "transparent", border: "none", color: "var(--color-muted)" }}
          >
            {dict.practice.backToDashboard}
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── Session complete ────────────────────────────────────────────── */
  if (completed) {
    const answered = Math.max(1, answeredThisSession);
    const accuracy = Math.round((correctCount / answered) * 100);
    const mastery = Math.round((pKnow ?? 0) * 100);
    const masteryPct = Math.min(100, Math.round(((pKnow ?? 0) / MASTERY_THRESHOLD) * 100));
    const isMastered = (pKnow ?? 0) >= MASTERY_THRESHOLD;

    return (
      <motion.div
        {...rise()}
        style={{
          maxWidth: 480,
          margin: "0 auto",
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 24,
          padding: 36,
          textAlign: "center",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".06em",
            color: "var(--color-faint)",
          }}
        >
          {dict.practice.doneTitle}
        </div>

        {/* XP — translated in, never scaled, so the digits stay crisp. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 8,
            margin: "12px 0 4px",
          }}
        >
          <span style={{ fontSize: 46, fontWeight: 800, color: "var(--color-ink)", lineHeight: 1.05 }}>
            +{sessionXp}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--color-muted)" }}>XP</span>
        </motion.div>

        <div style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 22 }}>
          {t(dict.practice.doneAccuracyLine, { correct: correctCount, answered, acc: accuracy })}
        </div>

        {/* Streak */}
        {streakResult && (
          <motion.div
            {...rise(0.18)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              background: "var(--color-amber-tint)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--color-ink)",
              marginBottom: 22,
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-amber-darker)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={reduce ? undefined : "flame-flicker"}
              aria-hidden="true"
            >
              <path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c0-2-1-3-1-4 2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-6 5-9z" />
            </svg>
            {streakResult.current} napos sorozat
            {streakResult.newShield && <span>{dict.practice.doneNewShield}</span>}
          </motion.div>
        )}

        {/* Real BKT mastery, not a made-up delta */}
        <div
          style={{
            background: "var(--color-surface-2)",
            borderRadius: 14,
            padding: "14px 16px",
            textAlign: "left",
            marginBottom: 26,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: "var(--color-ink)" }}>{skill.name_hu}</span>
            <span style={{ color: "var(--color-muted)" }}>{t(dict.practice.masteryConfident, { pct: mastery })}</span>
          </div>
          <div
            style={{ height: 8, background: "var(--color-surface-4)", borderRadius: 4, overflow: "hidden" }}
            role="progressbar"
            aria-valuenow={mastery}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t(dict.practice.masteryAria, { skill: skill.name_hu })}
          >
            <motion.div
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${masteryPct}%` }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              style={{
                height: "100%",
                background: isMastered ? "var(--color-success)" : "var(--color-primary-solid)",
                borderRadius: 4,
              }}
            />
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-muted)", marginTop: 8 }}>
            {isMastered
              ? dict.practice.masteredNote
              : t(dict.practice.masteryRemaining, { n: Math.max(1, Math.round((MASTERY_THRESHOLD - (pKnow ?? 0)) * 100)) })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push(`/${lang}/app/skills`)} className="hover-lift" style={quietBtn}>
            {dict.practice.otherTopic}
          </button>
          <button onClick={() => router.push(`/${lang}/app/dashboard`)} className="hover-lift" style={primaryBtn}>
            {dict.practice.backToDashboard}
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── Empty state ─────────────────────────────────────────────────── */
  if (!currentProblem) {
    return (
      <motion.div {...rise()} style={{ maxWidth: 420, margin: "0 auto", textAlign: "center", paddingTop: 56 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "var(--color-surface-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16v14H4z" />
            <path d="M8 9h8M8 13h5" />
          </svg>
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--color-ink)", marginBottom: 8 }}>
          {dict.practice.emptyTitle}
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 24 }}>
          {dict.practice.emptyBody}
        </p>
        <button onClick={() => router.push(`/${lang}/app/skills`)} className="hover-lift" style={primaryBtn}>
          {dict.practice.backToSkills}
        </button>
      </motion.div>
    );
  }

  /* ── Practice ────────────────────────────────────────────────────── */

  const itemState = (i: number): ItemState => {
    if (i === currentIndex && !feedback) return "current";
    return results[i] ?? (i < currentIndex ? "struggled" : "pending");
  };

  const segColor: Record<ItemState, string> = {
    correct: "var(--color-success)",
    struggled: "var(--color-amber-darker)",
    current: "var(--color-primary-solid)",
    pending: "var(--color-border)",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
      {/* ── Session bar ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setShowExitConfirm(true)}
          className="hover-lift"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px 6px 8px",
            borderRadius: 999,
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
          aria-label={dict.practice.exitAria}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          {dict.practice.exit}
        </button>

        {/* Phase pill */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={phase}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 13px",
              borderRadius: 999,
              background: phaseInfo.tint,
              color: "var(--color-ink)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <motion.span
              aria-hidden="true"
              animate={reduce ? undefined : { scale: [1, 1.35, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: phaseInfo.dot }}
            />
            {dict.practice[phaseInfo.labelKey]}
          </motion.span>
        </AnimatePresence>

        <div style={{ flex: 1 }} />

        {/* Live XP total. Only the wrapper moves; the glyphs never scale. */}
        <motion.div
          key={sessionXp}
          initial={reduce || sessionXp === 0 ? false : { y: -4, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 24 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: "var(--color-amber-tint)",
            color: "var(--color-ink)",
            fontSize: 13,
            fontWeight: 800,
          }}
          aria-live="polite"
          aria-label={t(dict.practice.xpAria, { xp: sessionXp })}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--color-amber-darker)" aria-hidden="true">
            <path d="M12 2l2.6 6.6L21 10l-5 4.4L17.6 22 12 18.3 6.4 22 8 14.4 3 10l6.4-1.4z" />
          </svg>
          {sessionXp} XP
        </motion.div>

        {/* Running combo — small and quiet until it becomes worth celebrating. */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.span
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                fontWeight: 800,
                color: "var(--color-ink)",
              }}
              title={t(dict.practice.comboTitle, { n: combo })}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber-darker)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c0-2-1-3-1-4 2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-6 5-9z" />
              </svg>
              ×{combo}
            </motion.span>
          )}
        </AnimatePresence>

        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-muted)" }}>
          {currentIndex + 1}/{problems.length}
        </span>
      </div>

      {/* ── Progress track ──────────────────────────────────────────── */}
      <div
        style={{ display: "flex", gap: 4, marginBottom: 16 }}
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={problems.length}
        aria-label={t(dict.practice.progressAria, { current: currentIndex + 1, total: problems.length, correct: correctCount })}
      >
        {problems.map((_, i) => {
          const st = itemState(i);
          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: segColor[st],
                height: st === "current" ? 9 : 6,
              }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.32, 0.72, 0, 1] }}
              style={{ flex: 1, borderRadius: 5, alignSelf: "center" }}
            />
          );
        })}
      </div>

      {/* ── Phase transition announcement ───────────────────────────── */}
      <AnimatePresence>
        {phaseAnnounce && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            role="status"
            style={{
              padding: "11px 15px",
              borderRadius: 12,
              background: PHASE_META[phaseAnnounce].tint,
              color: "var(--color-ink)",
              fontSize: 13.5,
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            {dict.practice[PHASE_META[phaseAnnounce].enterKey]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Near-limit warning ──────────────────────────────────────── */}
      {isNearLimit && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 12,
            background: "var(--color-amber-tint-2)",
            color: "var(--color-ink)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber-darker)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {dict.practice.limitOneLeft}
        </div>
      )}

      {/* ── Question card ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -28 }}
          transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            padding: 30,
            position: "relative",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* A wrong answer nudges the card sideways — translation only, so no
              glyph is ever resampled — then settles back. */}
          <motion.div
            animate={
              reduce || status !== "incorrect" || wrongAttempts === 0
                ? { x: 0 }
                : { x: [0, -7, 6, -3, 0] }
            }
            transition={{ duration: 0.34, ease: "easeOut" }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
                color: "var(--color-faint)",
                marginBottom: 14,
              }}
            >
              {skill.name_hu}
            </div>

            <ProblemDisplay
              lang={lang}
              dict={dict.problem}
              key={`${currentProblem.id}-${resetKey}`}
              problem={currentProblem}
              onAnswer={handleAnswer}
              disabled={!!feedback || isSubmitting}
              status={status}
            />
          </motion.div>

          {/* Evaluating */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="status"
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 14,
                  color: "var(--color-muted)",
                }}
              >
                <motion.span
                  animate={reduce ? undefined : { rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    border: "2px solid var(--color-border)",
                    borderTopColor: "var(--color-primary-solid)",
                    display: "block",
                  }}
                  aria-hidden="true"
                />
                {dict.practice.evaluating}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Network error */}
          {networkError && !isSubmitting && (
            <div
              role="alert"
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderRadius: 12,
                background: "var(--color-danger-tint)",
                borderLeft: "3px solid var(--color-danger)",
                color: "var(--color-ink)",
                fontSize: 14,
              }}
            >
              {dict.practice.submitError}
            </div>
          )}

          {/* Verdict */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                role="status"
                aria-live="polite"
                style={{
                  marginTop: 18,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: feedback.correct
                    ? "var(--color-success-tint)"
                    : "var(--color-amber-tint-2)",
                  borderLeft: `3px solid ${feedback.correct ? "var(--color-success)" : "var(--color-amber-darker)"}`,
                  color: "var(--color-ink)",
                  fontSize: 14.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                }}
              >
                {/* Glyph sits on a solid chip — the only combination that keeps
                    3:1 against the card in both themes. */}
                <motion.span
                  initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.05 }}
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: feedback.correct
                      ? "var(--color-success)"
                      : "var(--color-amber-darker)",
                    color: "var(--color-card)",
                    marginTop: 1,
                  }}
                >
                  {feedback.correct ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 7v6" />
                      <path d="M12 17h.01" />
                    </svg>
                  )}
                </motion.span>

                <div style={{ minWidth: 0 }}>
                  {message}
                  {feedback.correct && feedback.mastered && (
                    <motion.div
                      {...rise(0.2)}
                      style={{ fontSize: 13.5, color: "var(--color-muted)", marginTop: 3, fontWeight: 600 }}
                    >
                      {dict.practice.masteredInline}
                    </motion.div>
                  )}
                  {!feedback.correct && hintsShown > 0 && (
                    <div style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 3, fontWeight: 500 }}>
                      Nyitottunk egy tippet lentebb.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hints — a scaffolded ladder, not an undifferentiated stack.
              Each step says what it gives you, and the final one is marked
              because it hands over the answer. */}
          {hintsShown > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <AnimatePresence initial={false}>
                {hints.slice(0, hintsShown).map((h, i) => {
                  const isLast = i === hints.length - 1;
                  const accent = isLast ? "var(--color-amber-darker)" : "var(--color-primary-solid)";
                  const tint = isLast ? "var(--color-amber-tint)" : "var(--color-surface-2)";
                  return (
                    <motion.div
                      key={i}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          background: tint,
                          borderLeft: `3px solid ${accent}`,
                          borderRadius: "0 10px 10px 0",
                          padding: "11px 14px",
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: accent,
                            color: isLast ? "var(--color-card)" : "var(--color-on-primary)",
                            fontSize: 11,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 1,
                          }}
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: ".05em",
                              color: "var(--color-muted)",
                              marginBottom: 3,
                            }}
                          >
                            {dict.practice.hintLabels[Math.min(i, dict.practice.hintLabels.length - 1)]}
                            {isLast && hints.length > 1 && dict.practice.hintRevealsPath}
                          </div>
                          <div style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--color-ink)" }}>
                            <MathText text={h.text_hu} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Footer row */}
          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {hintsShown < hints.length && !feedback ? (
              <button
                onClick={requestHint}
                className="hover-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 13px",
                  borderRadius: 999,
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-ink)",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-solid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
                </svg>
                {hintsShown === 0 ? dict.practice.hintFirst : dict.practice.hintMore}
                <span style={{ color: "var(--color-muted)", fontWeight: 600 }}>
                  {hintsShown}/{hints.length}
                </span>
              </button>
            ) : (
              <div />
            )}

            {!isPremium && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-muted)" }}>
                {dict.practice.aiUpsell}
              </div>
            )}
          </div>

          {/* Actions after a verdict */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, delay: 0.06, ease: [0.32, 0.72, 0, 1] }}
                style={{ marginTop: 18, display: "flex", gap: 10 }}
              >
                {!feedback.correct && (
                  <button
                    onClick={handleRetry}
                    className="hover-lift"
                    style={{ ...primaryBtn, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    autoFocus
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 12a9 9 0 1 0 3-6.7" />
                      <path d="M3 4v5h5" />
                    </svg>
                    {dict.practice.retry}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isAdvancing}
                  className="hover-lift"
                  style={{
                    ...(feedback.correct
                      ? {
                          ...primaryBtn,
                          background: "var(--color-neutral-solid)",
                          color: "var(--color-on-neutral)",
                        }
                      : quietBtn),
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    opacity: isAdvancing ? 0.6 : 1,
                    cursor: isAdvancing ? "progress" : "pointer",
                  }}
                >
                  {isLastProblem ? dict.practice.summary : feedback.correct ? dict.practice.next : dict.practice.continueAnyway}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* XP popups — translate + fade only, no scale on the numerals. */}
          <div style={{ position: "absolute", top: 14, right: 18, pointerEvents: "none" }} aria-hidden="true">
            <AnimatePresence>
              {xpPopups.map((popup) => (
                <motion.div
                  key={popup.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={reduce ? { opacity: 1, y: 0 } : { opacity: [0, 1, 1, 0], y: [6, -6, -30, -48] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.2 : 1.4, times: [0, 0.12, 0.7, 1], ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    whiteSpace: "nowrap",
                    fontSize: 19,
                    fontWeight: 800,
                    color: "var(--color-amber-darker)",
                  }}
                >
                  +{popup.xp} XP
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Combo moment ────────────────────────────────────────────── */}
      <AnimatePresence>
        {comboFlash >= 3 && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
            role="status"
            style={{
              position: "fixed",
              left: "50%",
              bottom: 28,
              transform: "translateX(-50%)",
              zIndex: 40,
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "11px 18px",
              borderRadius: 999,
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-lift)",
              color: "var(--color-ink)",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber-darker)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={reduce ? undefined : "flame-flicker"} aria-hidden="true">
              <path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c0-2-1-3-1-4 2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-6 5-9z" />
            </svg>
            {t(dict.practice.combo, { n: comboFlash })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Exit confirmation ───────────────────────────────────────── */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              // Theme-aware scrim: derived from the page surface, so it dims in
              // light mode and deepens in dark instead of flashing white.
              background: "color-mix(in srgb, var(--color-surface) 72%, transparent)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={dict.practice.exitConfirmAria}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 20,
                padding: 28,
                maxWidth: 380,
                width: "100%",
                boxShadow: "var(--shadow-lift)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-ink)", marginTop: 0, marginBottom: 8 }}>
                {dict.practice.exitTitle}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-muted)", marginBottom: 22 }}>
                {answeredThisSession > 0
                  ? t(dict.practice.exitBody, { answered: answeredThisSession, xp: sessionXp })
                  : dict.practice.exitBodyEmpty}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => router.push(`/${lang}/app/skills`)} className="hover-lift" style={{ ...quietBtn, flex: 1, color: "var(--color-muted)" }}>
                  {dict.practice.exit}
                </button>
                <button onClick={() => setShowExitConfirm(false)} className="hover-lift" style={{ ...primaryBtn, flex: 1 }} autoFocus>
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
