"use client";

import { useState } from "react";
import Link from "next/link";

export interface SkillNode {
  id: string;
  name: string;
  x: number;
  y: number;
  state: "mastered" | "active" | "locked";
  pct: number;
  prereq: string | null;
  gradeTag?: string;
  desc: string;
}

interface Props {
  skills: SkillNode[];
}

function NodeCircle({ skill }: { skill: SkillNode }) {
  const size = 64;
  const innerSize = 54;
  const offset = (size - innerSize) / 2;

  const outerStyle: React.CSSProperties = (() => {
    if (skill.state === "mastered") {
      return {
        background: "var(--color-amber)",
        boxShadow: "var(--shadow-mastered)",
      };
    }
    if (skill.state === "active") {
      return {
        background: `conic-gradient(var(--color-primary) ${skill.pct * 360}deg, var(--color-surface-2) 0)`,
      };
    }
    return { background: "var(--color-surface-4)" };
  })();

  const innerContent = (() => {
    if (skill.state === "mastered") {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (skill.state === "active") {
      return (
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>
          {Math.round(skill.pct * 100)}%
        </span>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  })();

  const innerBg = skill.state === "mastered" ? "var(--color-amber)" : "#fff";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        position: "relative",
        flexShrink: 0,
        ...outerStyle,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: offset,
          left: offset,
          width: innerSize,
          height: innerSize,
          borderRadius: "50%",
          background: innerBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {innerContent}
      </div>
    </div>
  );
}

export function SkillsTreeClient({ skills }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = skills.find((s) => s.id === selectedId) ?? null;
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));

  const CANVAS_W = 760;
  const CANVAS_H = 560;

  // Determine if an edge should pulse (leading into the currently active node selected)
  function shouldPulse(from: string, to: string): boolean {
    const target = byId[to];
    return target?.state === "active" && !selectedId;
  }

  // Connector color
  function connectorColor(fromId: string, toId: string): string {
    const from = byId[fromId];
    const to = byId[toId];
    if (!from || !to) return "var(--color-locked-conn)";
    if (from.state === "locked" && to.state === "locked") return "var(--color-locked-conn)";
    return "var(--color-connector)";
  }

  // SVG connector lines
  const edges = skills.filter((s) => s.prereq !== null).map((s) => {
    const from = byId[s.prereq!];
    if (!from) return null;
    const x1 = from.x + 32;
    const y1 = from.y + 32;
    const x2 = s.x + 32;
    const y2 = s.y + 32;
    const pulse = shouldPulse(s.prereq!, s.id);
    const color = connectorColor(s.prereq!, s.id);
    return { x1, y1, x2, y2, pulse, color, key: `${s.prereq}-${s.id}` };
  }).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Intro row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 14, color: "var(--color-muted)" }}>
          A 9. évfolyam kerettanterve — kattints egy készségre a részletekért.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, fontWeight: 600, color: "var(--color-muted)" }}>
          {[
            { label: "Zárolva", color: "var(--color-disabled)" },
            { label: "Folyamatban", color: "var(--color-primary)" },
            { label: "Elsajátítva", color: "var(--color-amber)" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Map + detail panel */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Canvas */}
        <div
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            flexShrink: 0,
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            position: "relative",
            overflow: "auto",
          }}
        >
          {/* SVG connector layer */}
          <svg
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
          >
            {edges.map((e) =>
              e ? (
                <line
                  key={e.key}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke={e.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  className={e.pulse ? "connector-pulse" : undefined}
                />
              ) : null
            )}
          </svg>

          {/* Skill nodes */}
          {skills.map((skill) => (
            <button
              key={skill.id}
              onClick={() => setSelectedId(skill.id === selectedId ? null : skill.id)}
              style={{
                position: "absolute",
                left: skill.x,
                top: skill.y,
                width: 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: selectedId === skill.id ? "2px solid var(--color-primary)" : "2px solid transparent",
                borderRadius: 16,
                padding: "8px 4px",
                cursor: "pointer",
                transition: "border-color 0.15s",
                transform: "translateX(-28px)",
              }}
              title={skill.name}
            >
              <NodeCircle skill={skill} />
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: skill.state === "locked" ? "var(--color-disabled)" : "var(--color-ink)",
                  textAlign: "center",
                  lineHeight: 1.25,
                  maxWidth: 100,
                  wordBreak: "break-word",
                }}
              >
                {skill.name}
              </div>
              {skill.gradeTag && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-faint)" }}>
                  {skill.gradeTag}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            padding: 22,
            minHeight: 300,
            minWidth: 200,
          }}
        >
          {selected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Status eyebrow */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  color: "var(--color-faint)",
                }}
              >
                {selected.state === "mastered" ? "Elsajátítva" : selected.state === "active" ? "Folyamatban" : "Zárolva"}
              </div>

              {/* Name */}
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-ink)" }}>
                {selected.name}
              </div>

              {/* Description */}
              <div style={{ fontSize: 14, color: "var(--color-muted)", lineHeight: 1.5 }}>
                {selected.desc}
              </div>

              {/* Mastery bar */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-muted)",
                    marginBottom: 6,
                  }}
                >
                  <span>Elsajátítás</span>
                  <span>{Math.round(selected.pct * 100)}%</span>
                </div>
                <div style={{ height: 8, background: "var(--color-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round(selected.pct * 100)}%`,
                      background: selected.state === "mastered" ? "var(--color-amber)" : "var(--color-primary)",
                      borderRadius: 4,
                      transition: "width 0.4s ease-out",
                    }}
                  />
                </div>
              </div>

              {/* Locked: prereq chip */}
              {selected.state === "locked" && selected.prereq && byId[selected.prereq] && (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "var(--color-muted)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Előbb teljesítsd: <strong>{byId[selected.prereq].name}</strong>
                </div>
              )}

              {/* Unlocked: practice button */}
              {selected.state !== "locked" && (
                <Link
                  href={`/app/practice/${selected.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--color-primary)",
                    color: "#fff",
                    padding: "12px 20px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                    alignSelf: "flex-start",
                    marginTop: 4,
                  }}
                >
                  Gyakorlás indítása
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: 260,
                color: "var(--color-faint)",
                fontSize: 14,
                textAlign: "center",
                paddingTop: 40,
              }}
            >
              Válassz egy készséget a térképen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
