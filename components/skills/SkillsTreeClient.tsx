"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

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

const NODE_X_OFFSET = -28;

/* ── Ring ────────────────────────────────────────────────────────────
   The conic sweep counts up from 0 on mount so the learner literally
   sees how far they have got. Only the ring (a shape) ever scales —
   the "%" label inside is translated, never scaled, so glyphs stay crisp. */
function NodeCircle({
  skill,
  hovered,
  selected,
  delay,
  reduce,
}: {
  skill: SkillNode;
  hovered: boolean;
  selected: boolean;
  delay: number;
  reduce: boolean;
}) {
  const size = 64;
  const innerSize = 54;
  const offset = (size - innerSize) / 2;

  const target = Math.round(skill.pct * 100);

  // Driven by a MotionValue rather than React state: the sweep and the
  // label update outside the render cycle, so 10 nodes can count up at
  // 60fps without a single re-render.
  const progress = useMotionValue(reduce ? target : 0);
  const degrees = useTransform(progress, (v) => `${(v / 100) * 360}deg`);
  const ringBackground = useMotionTemplate`conic-gradient(var(--color-primary) ${degrees}, var(--color-surface-2) 0)`;
  const label = useTransform(progress, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    if (reduce) {
      progress.jump(target);
      return;
    }
    const controls = animate(progress, target, {
      duration: 0.9,
      delay: delay + 0.25,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [progress, target, delay, reduce]);

  const outerStyle: React.CSSProperties = (() => {
    if (skill.state === "mastered") {
      return {
        background: "var(--color-amber)",
        boxShadow: "var(--shadow-mastered)",
      };
    }
    return { background: "var(--color-surface-4)" };
  })();

  const innerContent = (() => {
    if (skill.state === "mastered") {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-on-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Draws itself in — a small "you earned this" beat */}
          <motion.path
            d="M5 13l4 4L19 7"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 0.45, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
      );
    }
    if (skill.state === "active") {
      return (
        <motion.span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "var(--color-ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {label}
        </motion.span>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  })();

  const innerBg = skill.state === "mastered" ? "var(--color-amber)" : "var(--color-card)";
  const haloColor =
    skill.state === "mastered"
      ? "var(--color-amber)"
      : skill.state === "active"
        ? "var(--color-primary)"
        : "var(--color-disabled)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Hover halo — a bare shape, safe to scale */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          opacity: hovered || selected ? 0.22 : 0,
          scale: hovered || selected ? (reduce ? 1 : 1.28) : 1,
        }}
        transition={{ duration: reduce ? 0 : 0.24, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: haloColor,
          pointerEvents: "none",
        }}
      />

      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          position: "relative",
          ...outerStyle,
          ...(skill.state === "active" ? { background: ringBackground } : null),
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
      </motion.div>
    </div>
  );
}

function SkillButton({
  skill,
  index,
  selected,
  reduce,
  onSelect,
  onHover,
}: {
  skill: SkillNode;
  index: number;
  selected: boolean;
  reduce: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const controls = useAnimationControls();
  const delay = reduce ? 0 : Math.min(index * 0.06, 0.6);
  const locked = skill.state === "locked";

  // Entrance runs through the same controls the shake uses, so the two
  // never fight over the element's transform.
  useEffect(() => {
    controls.start({
      opacity: 1,
      x: NODE_X_OFFSET,
      y: 0,
      transition: { duration: reduce ? 0 : 0.4, delay, ease: "easeOut" },
    });
  }, [controls, delay, reduce]);

  const statusLabel =
    skill.state === "mastered"
      ? "elsajátítva"
      : skill.state === "active"
        ? `folyamatban, ${Math.round(skill.pct * 100)} százalék`
        : "zárolva";

  function handleClick() {
    onSelect();
    // A locked node can be inspected but not practised — nudge it sideways
    // so the "why" lands before the eye reaches the detail panel.
    if (locked && !reduce) {
      controls.start({
        x: [NODE_X_OFFSET, NODE_X_OFFSET - 5, NODE_X_OFFSET + 5, NODE_X_OFFSET - 3, NODE_X_OFFSET],
        transition: { duration: 0.34, ease: "easeInOut" },
      });
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={() => {
        setHovered(true);
        onHover(skill.id);
      }}
      onHoverEnd={() => {
        setHovered(false);
        onHover(null);
      }}
      onFocus={() => {
        setHovered(true);
        onHover(skill.id);
      }}
      onBlur={() => {
        setHovered(false);
        onHover(null);
      }}
      initial={reduce ? { opacity: 0, x: NODE_X_OFFSET } : { opacity: 0, x: NODE_X_OFFSET, y: 10 }}
      animate={controls}
      whileHover={reduce || locked ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { y: 0 }}
      aria-pressed={selected}
      aria-label={`${skill.name} — ${statusLabel}`}
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
        border: "2px solid transparent",
        borderRadius: 16,
        padding: "8px 4px",
        cursor: locked ? "help" : "pointer",
        opacity: locked ? 0.82 : 1,
      }}
      title={skill.name}
    >
      {/* Selection ring travels between nodes rather than popping in place */}
      {selected && (
        <motion.span
          layoutId="skill-selection-ring"
          aria-hidden
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }
          }
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            border: "2px solid var(--color-primary)",
            background: "var(--color-surface-2)",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <NodeCircle
          skill={skill}
          hovered={hovered}
          selected={selected}
          delay={delay}
          reduce={reduce}
        />
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: locked ? "var(--color-muted)" : "var(--color-ink)",
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
      </div>
    </motion.button>
  );
}

export function SkillsTreeClient({ skills }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const reduce = useReducedMotion() ?? false;
  const selected = skills.find((s) => s.id === selectedId) ?? null;
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));

  const CANVAS_W = 760;
  // Bottom row sits at y=470; a node is a 64px circle plus a label that can
  // wrap to two lines, so the canvas needs ~620px or those labels clip.
  const CANVAS_H = 620;

  const focusId = selectedId ?? hoveredId;

  const masteredCount = skills.filter((s) => s.state === "mastered").length;

  // Connector color
  function connectorColor(fromId: string, toId: string): string {
    const from = byId[fromId];
    const to = byId[toId];
    if (!from || !to) return "var(--color-locked-conn)";
    if (from.state === "locked" && to.state === "locked") return "var(--color-locked-conn)";
    return "var(--color-connector)";
  }

  // SVG connector lines
  const edges = skills
    .filter((s) => s.prereq !== null)
    .map((s) => {
      const from = byId[s.prereq!];
      if (!from) return null;
      const x1 = from.x + 32;
      const y1 = from.y + 32;
      const x2 = s.x + 32;
      const y2 = s.y + 32;
      const target = byId[s.id];
      // Idle: pulse the edges that feed a skill currently in progress.
      const pulse = target?.state === "active" && !focusId;
      const related = !!focusId && (s.id === focusId || s.prereq === focusId);
      const dimmed = !!focusId && !related;
      return {
        x1,
        y1,
        x2,
        y2,
        pulse,
        related,
        dimmed,
        color: related ? "var(--color-primary)" : connectorColor(s.prereq!, s.id),
        key: `${s.prereq}-${s.id}`,
      };
    })
    .filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Intro row */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
      >
        <div style={{ fontSize: 14, color: "var(--color-muted)" }}>
          A 9. évfolyam kerettanterve — kattints egy készségre a részletekért.{" "}
          <strong style={{ color: "var(--color-ink)" }}>
            {masteredCount}/{skills.length}
          </strong>{" "}
          elsajátítva.
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
      </motion.div>

      {/* Map + detail panel */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Canvas */}
        <div
          onMouseLeave={() => setHoveredId(null)}
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            flexShrink: 0,
            background: "var(--color-card)",
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
            {edges.map((e, i) =>
              e ? (
                <motion.line
                  key={e.key}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke={e.color}
                  strokeLinecap="round"
                  initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{
                    pathLength: 1,
                    strokeWidth: e.related ? 5 : 3,
                    opacity: e.dimmed ? 0.3 : 1,
                  }}
                  transition={{
                    pathLength: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.1 + i * 0.05, ease: "easeOut" },
                    strokeWidth: { duration: reduce ? 0 : 0.2 },
                    opacity: { duration: reduce ? 0 : 0.2 },
                  }}
                  className={e.pulse ? "connector-pulse" : undefined}
                />
              ) : null
            )}
          </svg>

          {/* Skill nodes */}
          {skills.map((skill, i) => (
            <SkillButton
              key={skill.id}
              skill={skill}
              index={i}
              reduce={reduce}
              selected={selectedId === skill.id}
              onSelect={() => setSelectedId(skill.id === selectedId ? null : skill.id)}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Detail panel */}
        <div
          style={{
            flex: 1,
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            padding: 22,
            minHeight: 300,
            minWidth: 200,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {selected ? (
              <motion.div
                key={selected.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* Status eyebrow */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    color: "var(--color-faint)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        selected.state === "mastered"
                          ? "var(--color-amber)"
                          : selected.state === "active"
                            ? "var(--color-primary)"
                            : "var(--color-disabled)",
                    }}
                  />
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
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      {Math.round(selected.pct * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: "var(--color-surface-2)", borderRadius: 4, overflow: "hidden" }}>
                    <motion.div
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${Math.round(selected.pct * 100)}%` }}
                      transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        height: "100%",
                        background: selected.state === "mastered" ? "var(--color-amber)" : "var(--color-primary)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  {selected.state === "active" && (
                    <div style={{ fontSize: 12, color: "var(--color-faint)", marginTop: 6 }}>
                      80%-tól számít elsajátítottnak.
                    </div>
                  )}
                </div>

                {/* Locked: prereq chip */}
                {selected.state === "locked" && selected.prereq && byId[selected.prereq] && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.1, duration: 0.25 }}
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <rect x="5" y="11" width="14" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>
                      Előbb teljesítsd: <strong style={{ color: "var(--color-ink)" }}>{byId[selected.prereq].name}</strong>
                    </span>
                  </motion.div>
                )}

                {/* Unlocked: practice button */}
                {selected.state !== "locked" && (
                  <Link
                    href={`/app/practice/${selected.id}`}
                    className="hover-lift"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "var(--color-primary-solid)",
                      color: "var(--color-on-primary)",
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
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  minHeight: 260,
                  color: "var(--color-faint)",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                <motion.svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={reduce ? undefined : { y: [0, -4, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <circle cx="6" cy="6" r="2.2" />
                  <circle cx="6" cy="18" r="2.2" />
                  <circle cx="18" cy="12" r="2.2" />
                  <path d="M6 8.2V15.8" />
                  <path d="M8.2 12H12a4 4 0 0 0 4-4" />
                </motion.svg>
                Válassz egy készséget a térképen.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
