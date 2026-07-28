"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

function NavBtn({
  href,
  title,
  active,
  reduce,
  children,
}: {
  href: string;
  title: string;
  active: boolean;
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      aria-current={active ? "page" : undefined}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        position: "relative",
        background: "transparent",
        color: active ? "var(--color-primary)" : "var(--color-faint)",
        transition: "color 0.2s ease",
      }}
    >
      {/* Shared active pill — slides between items instead of blinking on/off. */}
      {active && (
        <motion.span
          layoutId="rail-active-pill"
          aria-hidden
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 480, damping: 34, mass: 0.7 }
          }
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            background: "var(--color-surface-3)",
          }}
        />
      )}

      {/* Left edge marker, a second (redundant) cue for the active screen. */}
      {active && (
        <motion.span
          layoutId="rail-active-edge"
          aria-hidden
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 480, damping: 34, mass: 0.7 }
          }
          style={{
            position: "absolute",
            left: -20,
            top: 12,
            width: 4,
            height: 24,
            borderRadius: 3,
            background: "var(--color-primary)",
          }}
        />
      )}

      <motion.span
        whileHover={reduce ? undefined : { y: -2 }}
        whileTap={reduce ? undefined : { y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        style={{ position: "relative", display: "flex" }}
      >
        {children}
      </motion.span>
    </Link>
  );
}

export function IconRail() {
  const pathname = usePathname();
  const reduce = useReducedMotion() ?? false;
  const isDash = pathname === "/app/dashboard" || pathname.startsWith("/app/dashboard/");
  const isSkills = pathname === "/app/skills" || pathname.startsWith("/app/skills/");
  const isPractice = pathname.startsWith("/app/practice");
  const isProfile = pathname.startsWith("/app/profile");

  return (
    <nav
      style={{
        width: 88,
        flexShrink: 0,
        background: "var(--color-card)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        gap: 28,
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 30,
      }}
    >
      {/* Logo mark */}
      <Link
        href="/app/dashboard"
        aria-label="MatematikaOkos — irányítópult"
        style={{ textDecoration: "none", flexShrink: 0 }}
      >
        <motion.div
          whileHover={reduce ? undefined : { rotate: -6 }}
          whileTap={reduce ? undefined : { rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--color-primary-solid)",
            color: "var(--color-on-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          M
        </motion.div>
      </Link>

      {/* Nav buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <NavBtn href="/app/dashboard" title="Irányítópult" active={isDash} reduce={reduce}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11.5 12 4l8 7.5" />
            <path d="M6 10v9h12v-9" />
            <path d="M10 19v-5h4v5" />
          </svg>
        </NavBtn>

        <NavBtn href="/app/skills" title="Készségfa" active={isSkills} reduce={reduce}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="2.2" />
            <circle cx="6" cy="18" r="2.2" />
            <circle cx="18" cy="12" r="2.2" />
            <path d="M6 8.2V15.8" />
            <path d="M8.2 12H12a4 4 0 0 0 4-4" />
          </svg>
        </NavBtn>

        <NavBtn href="/app/skills" title="Gyakorlás" active={isPractice} reduce={reduce}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
          </svg>
        </NavBtn>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Avatar */}
      <NavBtn href="/app/profile" title="Profil" active={isProfile} reduce={reduce}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </NavBtn>
    </nav>
  );
}
