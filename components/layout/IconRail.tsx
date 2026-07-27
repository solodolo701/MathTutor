"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavBtn({
  href,
  title,
  active,
  children,
}: {
  href: string;
  title: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        background: active ? "var(--color-surface-3)" : "transparent",
        color: active ? "var(--color-primary)" : "var(--color-faint)",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </Link>
  );
}

export function IconRail() {
  const pathname = usePathname();
  const isDash = pathname === "/app/dashboard" || pathname.startsWith("/app/dashboard/");
  const isSkills = pathname === "/app/skills" || pathname.startsWith("/app/skills/");
  const isPractice = pathname.startsWith("/app/practice");

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
      <div
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
          flexShrink: 0,
        }}
      >
        M
      </div>

      {/* Nav buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <NavBtn href="/app/dashboard" title="Irányítópult" active={isDash}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11.5 12 4l8 7.5" />
            <path d="M6 10v9h12v-9" />
            <path d="M10 19v-5h4v5" />
          </svg>
        </NavBtn>

        <NavBtn href="/app/skills" title="Készségfa" active={isSkills}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="2.2" />
            <circle cx="6" cy="18" r="2.2" />
            <circle cx="18" cy="12" r="2.2" />
            <path d="M6 8.2V15.8" />
            <path d="M8.2 12H12a4 4 0 0 0 4-4" />
          </svg>
        </NavBtn>

        <NavBtn href="/app/skills" title="Gyakorlás" active={isPractice}>
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
      <Link
        href="/app/profile"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--color-surface-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-primary)",
          textDecoration: "none",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </Link>
    </nav>
  );
}
