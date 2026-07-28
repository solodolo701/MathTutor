"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(stored ?? system);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    setPulseKey((k) => k + 1);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // Prevent hydration mismatch — render placeholder until mounted
  if (!mounted) {
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--color-surface-3)",
          border: "1px solid var(--color-border)",
        }}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Váltás világos módra" : "Váltás sötét módra"}
      aria-pressed={isDark}
      title={isDark ? "Világos mód" : "Sötét mód"}
      className="hover-lift"
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: "1px solid var(--color-border)",
        background: "var(--color-card)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: isDark ? "var(--color-amber)" : "var(--color-muted)",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        transition: "background 0.15s, border-color 0.15s, color 0.25s",
      }}
    >
      {/* Confirmation ripple — shapes only, never wraps text */}
      <AnimatePresence>
        {pulseKey > 0 && (
          <motion.span
            key={pulseKey}
            aria-hidden
            initial={{ opacity: reduce ? 0 : 0.55, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              margin: "auto",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: isDark ? "var(--color-amber)" : "var(--color-primary)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -70, scale: 0.6 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 70, scale: 0.6 }}
          transition={{ duration: reduce ? 0 : 0.24, ease: "easeOut" }}
          style={{ display: "flex", position: "relative" }}
        >
          {isDark ? (
            /* Sun icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            /* Moon icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
