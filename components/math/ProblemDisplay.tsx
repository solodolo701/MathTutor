"use client";

import { useState, useEffect, useRef } from "react";
import type { Problem } from "@/types/supabase";
import { MathDisplay, MathText } from "./MathDisplay";

interface ProblemDisplayProps {
  problem: Problem;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

function normalizeNumber(raw: string): string {
  // Hungarian locale uses comma as decimal separator
  return raw.trim().replace(",", ".");
}

export function ProblemDisplay({ problem, onAnswer, disabled }: ProblemDisplayProps) {
  const [textInput, setTextInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when problem changes
  useEffect(() => {
    setTextInput("");
    setSelectedOption(null);
    if (!disabled) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [problem.id, disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeNumber(textInput);
    if (normalized) onAnswer(normalized);
  };

  const typeLabels: Record<string, string> = {
    fill_number: "Szám beírása",
    equation_input: "Egyenlet",
    multiple_choice: "Feleletválasztós",
    guided_steps: "Lépések",
  };

  // Parse multiple_choice options from hints JSON
  // Format: first hint object may have {options: string[], ...} or we use level-0 entry
  const rawHints = problem.hints as Array<{ level: number; text_hu?: string; options?: string[] }> | null ?? [];
  const mcOptions: string[] | null = (() => {
    const optEntry = rawHints.find((h) => Array.isArray(h.options));
    if (optEntry?.options && optEntry.options.length > 0) return optEntry.options;
    return null;
  })();

  const optionLabels = ["A", "B", "C", "D"];

  const inputClass =
    "flex-1 px-4 py-3 rounded-xl text-white text-lg placeholder:text-[color:var(--color-text-disabled)] focus:outline-none focus:border-[color:var(--color-brand-500)] disabled:opacity-50 transition-colors";
  const inputStyle = {
    background: "var(--color-bg-input)",
    border: "1.5px solid var(--color-border-base)",
    color: "var(--color-text-primary)",
  };

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-0.5 text-xs rounded-full"
          style={{ background: "var(--color-bg-hover)", color: "var(--color-text-muted)" }}
        >
          {typeLabels[problem.type] ?? problem.type}
        </span>
        {problem.matura_relevant && (
          <span
            className="px-2 py-0.5 text-xs rounded-full border"
            style={{
              background: "var(--color-brand-950)",
              borderColor: "var(--color-brand-border)",
              color: "var(--color-brand-400)",
            }}
          >
            Érettségi
          </span>
        )}
        <span
          className="px-2 py-0.5 text-xs rounded-full"
          style={{ background: "var(--color-bg-hover)", color: "var(--color-text-muted)" }}
        >
          Nehézség: {Math.round(problem.difficulty * 100)}%
        </span>
      </div>

      {/* Problem content */}
      <div className="text-lg leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
        <MathText text={problem.content_latex} />
      </div>

      {/* fill_number */}
      {problem.type === "fill_number" && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={disabled}
            placeholder="Add meg a választ… (pl. 3,14)"
            className={inputClass}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={disabled || !textInput.trim()}
            className="px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-40"
            style={{ background: "var(--color-brand-500)", color: "white" }}
          >
            Elküldés
          </button>
        </form>
      )}

      {/* equation_input */}
      {problem.type === "equation_input" && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={disabled}
            placeholder="Írd be az egyenlet megoldását…"
            className={inputClass}
            style={{ ...inputStyle, fontFamily: "var(--font-jetbrains), monospace" }}
          />
          <button
            type="submit"
            disabled={disabled || !textInput.trim()}
            className="px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-40"
            style={{ background: "var(--color-brand-500)", color: "white" }}
          >
            Elküldés
          </button>
        </form>
      )}

      {/* multiple_choice */}
      {problem.type === "multiple_choice" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mcOptions ? (
            mcOptions.map((optText, idx) => {
              const label = optionLabels[idx] ?? String(idx + 1);
              const isSelected = selectedOption === label;
              return (
                <button
                  key={label}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedOption(label);
                    onAnswer(label);
                  }}
                  className="hover-lift p-4 rounded-xl border text-left disabled:opacity-50"
                  style={{
                    background: isSelected ? "var(--color-brand-950)" : "var(--color-bg-input)",
                    borderColor: isSelected ? "var(--color-brand-500)" : "var(--color-border-base)",
                    color: isSelected ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  }}
                >
                  <span
                    className="font-bold mr-2"
                    style={{ color: "var(--color-brand-400)" }}
                  >
                    {label})
                  </span>
                  <MathText text={optText} />
                </button>
              );
            })
          ) : (
            /* Fallback: no options stored — treat as text input */
            <form onSubmit={handleSubmit} className="col-span-2 flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={disabled}
                placeholder="Add meg a betűjelet (A, B, C, D)…"
                className={inputClass}
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={disabled || !textInput.trim()}
                className="px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-40"
                style={{ background: "var(--color-brand-500)", color: "white" }}
              >
                Elküldés
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
