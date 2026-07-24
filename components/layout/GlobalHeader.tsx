"use client";

import { usePathname, useRouter } from "next/navigation";

const SCREEN_TITLES: Record<string, string> = {
  "/app/dashboard": "Irányítópult",
  "/app/skills": "Készségfa",
  "/app/profile": "Profil",
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
  const isPractice = pathname.startsWith("/app/practice");
  const title = getScreenTitle(pathname);

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
        background: "#FFFFFF",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: back button (practice only) + screen title */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {isPractice && (
          <button
            onClick={() => router.push("/app/dashboard")}
            style={{
              border: "none",
              background: "#F0EEFA",
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
          </button>
        )}
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-ink)" }}>
          {title}
        </div>
      </div>

      {/* Right: streak pill + XP pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {streakCount > 0 && (
          <div
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
          </div>
        )}

        <div
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
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          </svg>
          {xpToday} XP ma
        </div>
      </div>
    </header>
  );
}
