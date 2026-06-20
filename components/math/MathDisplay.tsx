"use client";

import { useEffect, useRef } from "react";
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
    />
  );
}

export function MathBlock({ latex, className }: { latex: string; className?: string }) {
  return <MathDisplay latex={latex} displayMode className={className} />;
}
