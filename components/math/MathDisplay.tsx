"use client";

import { useEffect, useMemo, useRef } from "react";
import katex from "katex";

interface MathDisplayProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function MathDisplay({ latex, displayMode = false, className }: MathDisplayProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        displayMode,
        throwOnError: false,
        strict: false,
        output: "html",
      });
    } catch {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex, displayMode]);

  return (
    <span
      ref={ref}
      role="math"
      aria-label={latex}
      className={className}
      // KaTeX inherits colour, so formulas always match the surrounding text
      // token. Long expressions scroll inside themselves instead of forcing
      // the card (and the page) to scroll horizontally.
      style={
        displayMode
          ? { display: "block", overflowX: "auto", overflowY: "hidden", maxWidth: "100%" }
          : undefined
      }
    />
  );
}

export function MathBlock({ latex, className }: { latex: string; className?: string }) {
  return <MathDisplay latex={latex} displayMode className={className} />;
}

/**
 * Renders prose that contains inline `$…$` or block `$$…$$` math — problem
 * statements and hints are both written that way. Without this the raw LaTeX,
 * dollar signs and all, is shown to the student.
 */
export function MathText({ text }: { text: string }) {
  const parts = useMemo(() => text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g), [text]);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
          return <MathDisplay key={i} latex={part.slice(2, -2)} displayMode />;
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <MathDisplay key={i} latex={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
