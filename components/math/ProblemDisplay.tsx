"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Problem } from "@/types/supabase";
import { MathText } from "./MathDisplay";

/** Where the surrounding session is in the submit → judge → react cycle. */
export type AnswerStatus = "idle" | "submitting" | "correct" | "incorrect";

interface ProblemDisplayProps {
  problem: Problem;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  /** Drives the input's border/affordance colour. */
  status?: AnswerStatus;
  /** Bump to clear the field and pull focus back (new problem, or a retry). */
  resetKey?: number;
}

function normalizeNumber(raw: string): string {
  // Hungarian locale uses comma as decimal separator
  return raw.trim().replace(",", ".");
}

const TYPE_LABELS: Record<string, string> = {
  fill_number: "Szám beírása",
  equation_input: "Egyenlet",
  multiple_choice: "Feleletválasztós",
  guided_steps: "Lépések",
};

const OPTION_LABELS = ["A", "B", "C", "D"];

/** Difficulty as three dots — a number like "62%" reads as a score, not a setting. */
function difficultyLabel(d: number): { text: string; level: number } {
  if (d < 0.34) return { text: "Könnyű", level: 1 };
  if (d < 0.67) return { text: "Közepes", level: 2 };
  return { text: "Nehéz", level: 3 };
}

export function ProblemDisplay({
  problem,
  onAnswer,
  disabled,
  status = "idle",
  resetKey = 0,
}: ProblemDisplayProps) {
  const [textInput, setTextInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  // Clear the field and take focus whenever the parent starts a fresh attempt:
  // a new problem, or the student choosing to retry the current one. Keeping
  // this on an explicit key (rather than `disabled`) means the answer they
  // typed stays on screen while they read the feedback about it.
  useEffect(() => {
    setTextInput("");
    setSelectedOption(null);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [resetKey, problem.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const normalized = normalizeNumber(textInput);
    if (normalized) onAnswer(normalized);
  };

  // Parse multiple_choice options from hints JSON
  // Format: first hint object may have {options: string[], ...} or we use level-0 entry
  const rawHints =
    (problem.hints as Array<{ level: number; text_hu?: string; options?: string[] }> | null) ?? [];
  const mcOptions: string[] | null = (() => {
    const optEntry = rawHints.find((h) => Array.isArray(h.options));
    if (optEntry?.options && optEntry.options.length > 0) return optEntry.options;
    return null;
  })();

  const diff = difficultyLabel(problem.difficulty);

  /* The input border is the fastest channel for "we heard you" — it changes
     the instant the answer leaves, before any banner has rendered. */
  const borderColor =
    status === "correct"
      ? "var(--color-success)"
      : status === "incorrect"
        ? "var(--color-amber-darker)"
        : focused
          ? "var(--color-primary-solid)"
          : "var(--color-border)";

  const inputStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    padding: "13px 16px",
    borderRadius: 12,
    fontSize: 17,
    background: "var(--color-surface-2)",
    border: `1.5px solid ${borderColor}`,
    color: "var(--color-ink)",
    outline: "none",
    // Colour/shadow only — never size — so the digits never resample.
    transition: "border-color var(--dur-fast) var(--ease-out-soft), box-shadow var(--dur-fast) var(--ease-out-soft)",
    boxShadow: focused && status === "idle" ? "0 0 0 3px var(--color-brand-950)" : "none",
  };

  const submitDisabled = disabled || !textInput.trim();

  const submitButton = (
    <button
      type="submit"
      disabled={submitDisabled}
      className="hover-lift"
      style={{
        padding: "13px 22px",
        borderRadius: 12,
        fontWeight: 700,
        fontSize: 15,
        whiteSpace: "nowrap",
        background: "var(--color-primary-solid)",
        color: "var(--color-on-primary)",
        border: "none",
        cursor: submitDisabled ? "not-allowed" : "pointer",
        opacity: submitDisabled ? 0.45 : 1,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      Elküldés
      <kbd
        aria-hidden="true"
        style={{
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1,
          padding: "3px 5px",
          borderRadius: 4,
          background: "color-mix(in srgb, var(--color-on-primary) 20%, transparent)",
          color: "var(--color-on-primary)",
          fontFamily: "inherit",
        }}
      >
        ↵
      </kbd>
    </button>
  );

  const textForm = (placeholder: string, mono?: boolean) => (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
      <input
        ref={inputRef}
        type="text"
        inputMode={problem.type === "fill_number" ? "decimal" : "text"}
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="A válaszod"
        autoComplete="off"
        style={mono ? { ...inputStyle, fontFamily: "var(--font-jetbrains), monospace" } : inputStyle}
      />
      {submitButton}
    </form>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Meta chips */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            padding: "3px 10px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 999,
            background: "var(--color-surface-3)",
            color: "var(--color-ink)",
          }}
        >
          {TYPE_LABELS[problem.type] ?? problem.type}
        </span>

        {problem.matura_relevant && (
          <span
            style={{
              padding: "3px 10px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 999,
              background: "var(--color-brand-950)",
              color: "var(--color-ink)",
            }}
          >
            Érettségi
          </span>
        )}

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 999,
            background: "var(--color-surface-3)",
            color: "var(--color-ink)",
          }}
          title={`Nehézség: ${diff.text}`}
        >
          <span aria-hidden="true" style={{ display: "inline-flex", gap: 3 }}>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background:
                    n <= diff.level ? "var(--color-primary-solid)" : "var(--color-disabled)",
                }}
              />
            ))}
          </span>
          {diff.text}
        </span>
      </div>

      {/* Problem statement */}
      <div
        style={{
          fontSize: 19,
          lineHeight: 1.6,
          color: "var(--color-ink)",
        }}
      >
        <MathText text={problem.content_latex} />
      </div>

      {problem.type === "fill_number" && textForm("Add meg a választ… (pl. 3,14)")}

      {problem.type === "equation_input" && textForm("Írd be az egyenlet megoldását…", true)}

      {problem.type === "multiple_choice" &&
        (mcOptions ? (
          <div
            role="group"
            aria-label="Válaszlehetőségek"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {mcOptions.map((optText, idx) => {
              const label = OPTION_LABELS[idx] ?? String(idx + 1);
              const isSelected = selectedOption === label;
              return (
                <motion.button
                  key={label}
                  type="button"
                  disabled={disabled}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedOption(label);
                    onAnswer(label);
                  }}
                  className="hover-lift"
                  whileTap={reduce ? undefined : { y: 1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 16px",
                    borderRadius: 14,
                    textAlign: "left",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled && !isSelected ? 0.5 : 1,
                    background: isSelected ? "var(--color-brand-950)" : "var(--color-surface-2)",
                    border: `1.5px solid ${isSelected ? "var(--color-primary-solid)" : "var(--color-border)"}`,
                    color: "var(--color-ink)",
                    fontSize: 16,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                      background: isSelected ? "var(--color-primary-solid)" : "var(--color-surface-4)",
                      color: isSelected ? "var(--color-on-primary)" : "var(--color-ink)",
                    }}
                  >
                    {label}
                  </span>
                  <MathText text={optText} />
                </motion.button>
              );
            })}
          </div>
        ) : (
          /* Fallback: no options stored — treat as text input */
          textForm("Add meg a betűjelet (A, B, C, D)…")
        ))}
    </div>
  );
}
