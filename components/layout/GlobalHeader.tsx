"use client";

import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

const SCREEN_TITLES: Record<string, string> = {
  "/app/dashboard": "Irányítópult",
  "/app/skills": "Készségfa",
  "/app/profile": "Profil",
  "/app/pricing": "Prémium",
};

function getScreenTitle(pathname: string): string {
  if (pathname.startsWith("/app/practice")) return "Gyakorlás";
  return SCREEN_TITLES[pathname] ?? "MatematikaOkos";
}

export function GlobalHeader({
  streakCount,
  xpToday,
}: {
  streakCount: number;
  xpToday: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion() ?? false;
  const isPractice = pathname.startsWith("/app/practice");
  const title = getScreenTitle(pathname);

  // Text only ever translates or fades — scaling glyphs resamples them blurry.
  const pillMotion = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.3, ease: "easeOut" as const },
  };

  return (
    <header
      style={{
        height: 76,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-card)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: back button (practice only) + screen title */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <AnimatePresence initial={false}>
          {isPractice && (
            <motion.button
              key="back"
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
              whileHover={reduce ? undefined : { x: -2 }}
              onClick={() => router.push("/app/dashboard")}
              style={{
                border: "none",
                background: "var(--color-surface-3)",
                width: 36,
                height: 36,
                borderRadius: 10,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
                flexShrink: 0,
              }}
              aria-label="Vissza"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <div style={{ position: "relative", minWidth: 0 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={title}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--color-ink)",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right: streak pill + XP pill + theme toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AnimatePresence initial={false}>
          {streakCount > 0 && (
            <motion.div
              key="streak"
              {...pillMotion}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              title={`${streakCount} egymást követő gyakorlónap`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "var(--color-amber-tint)",
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 700,
                color: "var(--color-amber-darker)",
                fontSize: 14,
                whiteSpace: "nowrap",
              }}
            >
              <svg
                width="16"
                height="16"
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
              {streakCount} napos sorozat
            </motion.div>
          )}
        </AnimatePresence>

        {/* Re-keyed on the value so a new XP total re-plays the entrance. */}
        <motion.div
          key={`xp-${xpToday}`}
          {...pillMotion}
          title="Ma szerzett tapasztalati pont"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--color-surface-3)",
            padding: "8px 14px",
            borderRadius: 999,
            fontWeight: 700,
            color: "var(--color-primary-dark)",
            fontSize: 14,
            whiteSpace: "nowrap",
          }}
        >
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { rotate: -25, scale: 0.7 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
          >
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          </motion.svg>
          {xpToday} XP ma
        </motion.div>

        <ThemeToggle />
      </div>
    </header>
  );
}
