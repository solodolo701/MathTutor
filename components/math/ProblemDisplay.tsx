"use client";

import { useState } from "react";
import type { Problem } from "@/types/supabase";
import { MathDisplay } from "./MathDisplay";

interface ProblemDisplayProps {
  problem: Problem;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

// Render inline LaTeX: text with $...$ replaced by MathDisplay
function RenderLatexText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const latex = part.slice(1, -1);
          return <MathDisplay key={i} latex={latex} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function ProblemDisplay({ problem, onAnswer, disabled }: ProblemDisplayProps) {
  const [numberInput, setNumberInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.type === "fill_number") {
      onAnswer(numberInput);
    }
  };

  const typeLabels: Record<string, string> = {
    fill_number: "Szám beírása",
    equation_input: "Egyenlet",
    multiple_choice: "Feleletválasztós",
    guided_steps: "Lépések",
  };

  return (
    <div className="space-y-6">
      {/* Problem type badge */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full">
          {typeLabels[problem.type] ?? problem.type}
        </span>
        {problem.matura_relevant && (
          <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 text-xs rounded-full border border-indigo-800">
            Érettségi
          </span>
        )}
        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-xs rounded-full">
          Nehézség: {Math.round(problem.difficulty * 100)}%
        </span>
      </div>

      {/* Problem content */}
      <div className="text-lg text-white leading-relaxed">
        <RenderLatexText text={problem.content_latex} />
      </div>

      {/* Answer input */}
      {problem.type === "fill_number" && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="number"
            step="any"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            disabled={disabled}
            placeholder="Add meg a választ..."
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-lg placeholder-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !numberInput}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            Elküldés
          </button>
        </form>
      )}

      {problem.type === "multiple_choice" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["A", "B", "C", "D"].map((opt) => (
            <button
              key={opt}
              disabled={disabled}
              onClick={() => {
                setSelectedOption(opt);
                onAnswer(opt);
              }}
              className={`p-4 rounded-xl border text-left transition-colors disabled:opacity-50 ${
                selectedOption === opt
                  ? "border-indigo-500 bg-indigo-950 text-white"
                  : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <span className="font-bold text-indigo-400 mr-2">{opt})</span>
              Lehetőség {opt}
            </button>
          ))}
        </div>
      )}

      {problem.type === "equation_input" && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            disabled={disabled}
            placeholder="Írd be az egyenlet megoldását..."
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !numberInput}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            Elküldés
          </button>
        </form>
      )}
    </div>
  );
}
