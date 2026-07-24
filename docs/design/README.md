# Handoff: MatematikaOkos Core Loop (Dashboard · Skills Tree · Practice Session)

## Overview
Design reference for the core learning loop of MatematikaOkos, a Hungarian-language gamified math tutor: a Dashboard (daily task, streak, quests, season progress), a Skills Tree (prerequisite map with mastery states), and a Practice Session (question flow with hints, feedback, XP, and a completion summary). Landing/marketing and mobile screens are out of scope for this pass.

## About the Design Files
`MatematikaOkos.dc.html` is a **design reference prototype built in HTML** — a single-file component with inline styles and a small amount of JS driving state and animation. It demonstrates intended look, layout, copy, and interaction; it is **not production code to copy directly**. The task is to **recreate this design in the target codebase's existing environment** (React, Vue, SwiftUI, etc.) using its established component patterns, styling approach, and state management — or, if no environment exists yet, pick the most appropriate framework and implement there.

`support.js` is an internal runtime dependency of the prototype format only — do not port it; it has no equivalent in a production app. It's included only so the HTML file can be opened directly in a browser for reference.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and micro-interactions are final-intent. Reproduce pixel-accurately where feasible, adjusting only for real platform constraints (native form controls, existing i18n plumbing, etc.).

## Screens / Views

### 1. Dashboard
**Purpose:** Landing view after login. Surfaces today's recommended task, streak status, weekly stats, daily quests, and season progress.

**Layout:** Left icon rail, 88px fixed width, white bg, 1px `#E4E1F1` right border, column layout, 20px top/bottom padding, 28px gap, items centered. Main column fills remaining width: 76px header (see Global Header below) + scrollable content area, 32px padding, content max-width 1080px, vertical stack with 24px gap.

**Components:**
- Greeting — 26px/800, `#221F36`. Copy: "Szia, Nóra! Készen állsz a mai adagra?"
- Hero row — 2-col grid, `1.4fr 1fr`, 20px gap.
  - Left (gradient task card): `linear-gradient(135deg,#5B4FE0,#4238B8)`, 20px radius, 28px padding, white text, column layout, 14px gap. Eyebrow "Mai feladat" 13px/700 uppercase, letter-spacing .06em, 0.8 opacity. Title "Lineáris egyenletek" 24px/800. Meta "{n} feladat · kb. 15 perc" 14px @0.85 opacity. Button "Gyakorlás indítása" — white bg, `#4238B8` text, no border, 12px/22px padding, 12px radius, 700 weight, 15px, trailing right-chevron icon, 8px gap.
  - Right (streak card): white bg, 1px `#E4E1F1` border, 20px radius, 24px padding, column, 12px gap. Flame icon (`#D98324`, animated) + "{n} napos sorozat" 18px/800. Week strip: 7 circles, 24px diameter, 6px gap; filled `#E8A33D` for streak days elapsed this week, else transparent with `#E4E1F1` 2px border. Footnote: shield icon (`#5B4FE0`) + "2 sorozat-pajzsod van — egy kihagyott nap sem törli a sorozatot" 13px/600 `#6B6785`.
- Stat row — 3-col grid, 16px gap. Each card: white, 1px `#E4E1F1` border, 16px radius, 18px padding. Label 12px/700 uppercase `#A6A2BF`. Value 24px/800, 4px top margin. Cards: "Elsajátított készségek" → 4 / 10; "Heti XP" → 340; "Csapat helyezés" → #3.
- Daily quests card — white, 1px `#E4E1F1` border, 20px radius, 24px padding. Title "Napi küldetések" 16px/800, 14px bottom margin. Rows (10px gap): each row is a flex item on `#F5F4FB` bg, 12px radius, 12px/14px padding, 14px gap between: 34px icon chip (10px radius, tinted bg/color per type) → title (14px/700, flex:1) with a 6px progress bar below it (track `#E4E1F1`, fill `#5B4FE0`, 4px radius) → trailing count "{done}/{total}" 13px/700 `#6B6785`.
  - Quests: "Oldj meg 5 lineáris egyenletet" 3/5 60% (icon ✓ on `#E9E6FB`/`#5B4FE0`); "Segíts egy csapattársnak egy tippel" 0/1 0% (icon ★ on `#FBEBD3`/`#E8A33D`); "Fejezz be egy teljes napi gyakorlást" 0/1 0% (icon ● on `#E4F5EC`/`#2FA36B`).
- Season progress card — white, 1px `#E4E1F1` border, 20px radius, 24px padding. Header row (space-between, baseline): "Egyenletek Kora — szezon" 16px/800, "18 / 30 mérföldkő" 13px/600 `#6B6785`. Track below, 10px tall, `#E9E6FB` bg, 6px radius; fill `linear-gradient(90deg,#E8A33D,#5B4FE0)` at 60% width.

### 2. Skills Tree
**Purpose:** Visualize the curriculum as a prerequisite graph; selecting a node shows detail and a way into practice.

**Layout:** Intro row: helper text left ("A 9. évfolyam kerettanterve — kattints egy készségre a részletekért.", 14px `#6B6785`) and legend right (16px gap, 13px/600 `#6B6785` items, each with a 10px color dot). Below: flex row, 24px gap — fixed 760×560px map canvas (white, 1px `#E4E1F1` border, 20px radius, `overflow:auto`) + flexible detail panel (white, same border/radius, 22px padding, min-height 300px).

**Components:**
- Legend dots: Zárolva (locked) `#C9C6DA`; Folyamatban (in progress) `#5B4FE0`; Elsajátítva (mastered) `#E8A33D`.
- Map nodes: absolute-positioned over an SVG connector layer sized to the canvas. Each node is 120px wide, centered content: 64px outer circle (mastery ring) wrapping a 54px inner circle (icon/%), a 12.5px/700 label below (2-line max, 1.25 line-height), and an optional 10px/700 `#A6A2BF` grade tag beneath (e.g. "10. évf.").
  - **Mastered**: outer circle solid `#E8A33D`, inner circle `#E8A33D` with white ✓, drop shadow `0 6px 16px rgba(232,163,61,.4)`.
  - **Active** (in progress): outer circle a conic-gradient ring — `#5B4FE0` for `pct*360deg`, `#EFEDFA` for the remainder — inner circle white showing `{pct}%` in `#5B4FE0`, no shadow.
  - **Locked**: outer circle flat `#ECEBF4`, inner circle white with a muted `#A6A2BF` icon, no shadow.
- Connector lines: 3px stroke, round caps. `#9C8FF0` when either endpoint is unlocked/active; `#D9D6E8` when both endpoints are locked. The edge feeding the currently-active skill (e.g. algebraic-expressions → linear-equations) pulses opacity 0.35↔1 continuously (signals "focus here next").
- Detail panel (populated on node click): eyebrow status label 12px/700 uppercase `#A6A2BF` ("Zárolva" / "Folyamatban" / "Elsajátítva"); name 20px/800; description 14px `#6B6785`, 1.5 line-height; mastery row — label "Elsajátítás" + percentage (13px/700 `#6B6785`, space-between) above an 8px bar (track `#EFEDFA`, fill `#E8A33D` if mastered else `#5B4FE0`). If locked: a `#F5F4FB` chip, 12px radius, 12px/14px padding, lock icon + "Előbb teljesítsd: {prereq name}" 13px `#6B6785`. If unlocked: primary button "Gyakorlás indítása" (`#5B4FE0` bg, white text, 12px/20px padding, 12px radius, 700/14px).
- Empty state (nothing selected): centered, `#A6A2BF`, 14px, 40px top padding: "Válassz egy készséget a térképen."

**Sample data** (id — name — state — % — prerequisite — grade tag):
| id | name | state | % | prereq | tag |
|---|---|---|---|---|---|
| real-numbers | Valós számok | mastered | 100 | — | — |
| algebraic-expressions | Algebrai kifejezések | mastered | 100 | real-numbers | — |
| linear-equations | Lineáris egyenletek | active | 58 | algebraic-expressions | — |
| linear-functions | Lineáris függvények | locked | 0 | linear-equations | — |
| systems-of-equations | Egyenletrendszerek | locked | 0 | linear-equations | — |
| basic-geometry | Alapgeometria | active | 32 | — | — |
| triangle-congruence | Háromszögek egybevágósága | locked | 0 | basic-geometry | — |
| statistics-intro | Alapstatisztika | active | 18 | — | — |
| combinatorics | Kombinatorika | locked | 0 | statistics-intro | 10. évf. |
| probability | Klasszikus valószínűség | locked | 0 | combinatorics | 10. évf. |

Layout is a fixed x/y per node inside the 760×560 canvas — see the prototype's `skillsData()` for exact coordinates; a production implementation may re-layout dynamically (e.g. auto force-layout or grid-by-depth) as the curriculum grows, as long as prerequisite lines and states render the same way.

### 3. Practice Session
**Purpose:** Sequential question flow (warm-up → practice → review phases) with hints, immediate feedback, XP rewards, and a completion summary.

**Layout:** Centered column, max-width 720px, margin auto. Segmented progress strip above the question card: one segment per problem, 4px gap, 8px tall, 4px radius, filled up to the current index using the segment's phase color, unfilled segments `#E4E1F1`.

**Question card:** white, 1px `#E4E1F1` border, 20px radius, 32px padding, `position: relative` (XP popups anchor to it).
- Phase/skill eyebrow: 12px/700 uppercase `#5B4FE0`, letter-spacing .05em, e.g. "Gyakorlás · Lineáris egyenletek". Phase labels: Bemelegítés (warm-up, `#D98324`), Gyakorlás (practice, `#5B4FE0`), Ismétlés (review, `#E8A33D`) — these are also the progress-segment colors.
- Prompt line, 16px `#6B6785`, 10px bottom margin, then the problem itself at 30px/800, letter-spacing .01em, e.g. "3x + 7 = 22".
- Answer row, 12px gap: number input (flex:1, 14px/16px padding, 2px `#E4E1F1` border, 12px radius, 16px/700 text, `disabled` once answered, placeholder "Válasz") + one primary button:
  - Before answering: "Ellenőrzés" — `#5B4FE0` bg, white text, no border, 14px/24px padding, 12px radius, 700/15px.
  - After answering: "Következő" (or "Összefoglaló" on the last problem) — `#221F36` bg, white text, same sizing, trailing right-chevron icon, 6px gap.
- Feedback banner (appears after submit, pop-in animation): **correct** — bg `#E4F5EC`, text `#2FA36B`, ✓ icon, one of 4 rotating encouragement lines ("Szuper! Pontosan így kell." / "Remek munka!" / "Magabiztosan haladsz!" / "Ügyes vagy — ez az!"). **Incorrect** — bg `#FBE9D6`, text `#B4761F`, ↻ icon, "Még nem az — nézd meg az alábbi tippet, és próbáld újra!". 14px/16px padding, 12px radius, 700/14px, 10px icon gap, 18px top margin.
- Hints (revealed progressively, one per wrong attempt or manual request, max 3): each is a `#F5F4FB` chip, 10px radius, 10px/14px padding, 13.5px `#221F36`, bold "Tipp {n}:" prefix. Stacked with 8px gap, 16px top margin.
- Footer row (space-between): "Segítség kérése ({shown}/3)" ghost button — no bg/border, `#5B4FE0` text, 700/13.5px, star icon, hidden once 3 hints are shown or the question is answered — opposite side: muted upsell note "Több tipp AI-val — Prémium" (12px/700 `#C9C6DA`, non-interactive in this pass).
- XP popup: floats up from the card's top-right corner on a correct answer, "+{xp} XP" 20px/800 `#E8A33D`, rises and fades over ~1.3s, then unmounts. XP per question = `max(4, 10 - hintsUsed*2)`.

**Session summary** (replaces the question card once all problems are answered): white card, 24px radius, 40px padding, centered text, pop-in animation.
- Eyebrow "Munka elvégezve" 14px/700 uppercase `#A6A2BF`.
- Big XP total "+{sessionXp} XP" 44px/800 `#E8A33D`, 14px vertical margin.
- Streak line: flame icon (animated) + "{streak+1} napos sorozat aktív" 700 `#D98324`, centered, 8px gap, 24px bottom margin.
- Up to 2 "skill improved" rows, left-aligned, max-width 420px, centered as a block, 10px gap: `#F5F4FB` bg, 12px radius, 12px/16px padding; header row (space-between) with skill name (13px/700) and "{from}% → {to}%" in `#2FA36B`; a 6px bar below (track `#E4E1F1`, fill `#2FA36B`) showing the new percentage.
- Primary button "Vissza az irányítópulthoz" — `#5B4FE0` bg, white text, 14px/28px padding, 12px radius, 700/15px — returns to Dashboard.

## Global Header (all screens)
76px tall, white bg, 1px `#E4E1F1` bottom border, 32px horizontal padding, space-between.
- Left: on the Practice screen only, a back button (36px square, `#F0EEFA` bg, 10px radius, left-chevron icon, `#5B4FE0`) precedes the screen title. Screen title 22px/800: "Irányítópult" / "Készségfa" / "Gyakorlás".
- Right, 12px gap: streak pill (`#FBEBD3` bg, `#B4761F` text, animated flame icon, "{n} napos sorozat", 999px radius, 8px/14px padding, 700/14px); XP-today pill (`#E9E6FB` bg, `#4238B8` text, star icon, "{n} XP ma", same shape); a secondary icon button (36px square, white bg, 1px `#E4E1F1` border, 10px radius, `#6B6785` info icon) that opens the **Animation Plan** overlay (see below — this is documentation tooling for this handoff, not a feature to ship).

## Icon Rail (left, all screens)
88px wide, white bg, 1px `#E4E1F1` right border. Top: 40px logo mark, `#5B4FE0` bg, 12px radius, white "M", 800/18px. Then 3 nav buttons (48px square, 14px radius, 10px gap): Irányítópult (home icon), Készségfa (node-graph icon), Gyakorlás (target icon) — active state `#E9E6FB` bg / `#5B4FE0` icon, inactive transparent bg / `#A6A2BF` icon. Bottom: 40px circular avatar, `#E9E6FB` bg, `#5B4FE0` person icon.

## Interactions & Behavior

**Navigation:** Clicking a rail icon or the header back button switches `screen` between `dashboard` / `skills` / `practice` with no transition animation in the prototype (production should add the shared-axis transition described below).

**Dashboard → Practice:** The hero card's "Gyakorlás indítása" button (or any skill's "Gyakorlás indítása" from the Skills Tree detail panel) starts a session: resets session state and navigates to `practice` at problem index 0.

**Skills Tree:** Clicking a node sets it as selected regardless of lock state (so users can preview locked skills); the detail panel always reflects the last-clicked node. Locked skills show the prerequisite rather than a practice button.

**Practice flow, per question:**
1. User types a numeric answer, clicks "Ellenőrzés" (or the input is disabled and swapped for "Következő"/"Összefoglaló" post-answer).
2. Correct → feedback banner (green), XP popup fires, input disables, button becomes "Következő".
3. Incorrect → feedback banner (amber, "try again" copy), next hint auto-reveals, input stays enabled and editable for another attempt — up to 3 hints total (auto-revealed on wrong attempts, or requested manually via the ghost button, whichever exhausts first).
4. Clicking "Következő" advances to the next problem, resetting per-question state (answer, hints, feedback). On the last problem, the button reads "Összefoglaló" and clicking it shows the Session Summary in place of the card.
5. Session Summary's only action returns to the Dashboard.

**Session composition:** Problems are generated per session from 3 phase pools — Bemelegítés (warm-up), Gyakorlás (practice), Ismétlés (review) — concatenated in that order. Pool sizes vary by a `sessionSize` setting: short (2/2/1), standard (2/4/1), long (3/5/2).

## Animations
Two tiers — items marked **live** run in the prototype today; items marked **spec** are described but not built (too costly to fake convincingly in a static prototype) and need real implementation.

**Live in prototype:**
- Flame icon flicker — continuous `scale(1)→scale(1.08) rotate(-2deg)→scale(1)`, 1.8s ease-in-out infinite, on every streak flame icon.
- Skills-tree connector pulse — opacity 0.35↔1, 2.2s ease-in-out infinite, only on the edge leading into the currently-active skill.
- XP popup float — "+{n} XP" translateY(0→-54px) with a fade in/out, ~1.3s, ease-out, fires on correct answer.
- Feedback banner pop — scale(0.9→1.03→1) with fade-in, 0.4s ease-out, fires when the feedback banner mounts.
- Progress/mastery bar fills — width transitions instantly via React re-render in the prototype; production should animate width changes (~400ms ease-out) for polish.

**Spec only (needs real implementation):**
- Confetti burst — canvas particle burst in gold/purple tones, ~900ms, `cubic-bezier(.16,1,.3,1)`. Trigger: skill mastered / level-up.
- Screen transition — shared-axis slide + fade between Dashboard/Skills/Practice, ~240ms ease-out. Trigger: any nav change.
- Badge reveal — spin + scale pop-in (spring, stiffness 260 / damping 20) then a toast notification, ~600ms. Trigger: new badge earned.
- Tree node unlock — mastery ring fills, then a glow burst around the node, ~500ms `cubic-bezier(.34,1.56,.64,1)`. Trigger: prerequisite completed.
- Streak milestone — flame icon scale-pulse with accompanying confetti, ~800ms ease-in-out. Trigger: 3/7/14/30-day streak reached.
- Season milestone — progress bar fill, star pops in above the milestone marker, ~450ms ease-out. Trigger: season progress advances a step.

The prototype exposes this list live via the header's info button ("Animation Plan" overlay) — useful for review, not something to port into production UI.

## State Management
Minimum state needed to implement the loop:
- `screen`: `'dashboard' | 'skills' | 'practice'`
- Dashboard: derived from user/session data — streak count, week completion, weekly XP, quest progress, season progress. No local UI state beyond navigation.
- Skills Tree: `selectedSkillId` (nullable) — which node's detail is shown. Skill list itself (id, name, state, percent, prerequisite, description, coordinates) comes from curriculum data, not UI state.
- Practice Session: `sessionProblems` (built once per session start from the phase pools + `sessionSize`), `currentIndex`, `userAnswer`, `answered` (bool), `hintsShown` (0–3), `wrongAttempts`, `feedbackState` (`null | 'correct' | 'retry'`), `sessionXp` (running total), `sessionDone` (bool), transient `xpPopups` (list of `{id, xp}` auto-removed after their animation).
- State transitions are all described under Interactions & Behavior above.
- Data fetching (production): current user's streak/XP/quest state, curriculum graph with per-user mastery percentages, and a problem-generation/answer-check service — none of this is mocked beyond illustrative sample data in the prototype.

## Design Tokens

**Colors**
| Token | Hex | Usage |
|---|---|---|
| Primary (indigo) | `#5B4FE0` | primary actions, active nav/skill states, links |
| Primary dark | `#4238B8` | gradient end, hero button text |
| Ink | `#221F36` | primary text, secondary button bg |
| Muted text | `#6B6785` | secondary text |
| Faint text | `#A6A2BF` | tertiary/eyebrow text |
| Disabled text | `#C9C6DA` | locked states, upsell notes |
| Border | `#E4E1F1` | card borders, dividers, track backgrounds |
| Surface tint | `#F5F4FB` | app background, chip backgrounds |
| Surface tint 2 | `#EFEDFA` / `#E9E6FB` / `#ECEBF4` | light tinted fills (bars, chips, locked nodes) |
| Amber (mastery/streak) | `#E8A33D` | mastered state, XP, season accent |
| Amber dark | `#D98324` / `#B4761F` | flame icon, streak pill text |
| Amber tint bg | `#FBEBD3` / `#FBE9D6` | streak pill bg, retry feedback bg |
| Success | `#2FA36B` | correct feedback, skill-improved deltas |
| Success tint bg | `#E4F5EC` | correct feedback bg |
| Locked | `#D9D6E8` | locked connector lines |
| Active connector | `#9C8FF0` | unlocked/active connector lines |

**Typography:** Plus Jakarta Sans (400/500/600/700/800), loaded from Google Fonts. Scale in use: 44 / 30 / 26 / 24 / 22 / 20 / 18 / 16 / 15 / 14 / 13.5 / 13 / 12.5 / 12 / 11px. Weights used: 700 (most labels/buttons), 800 (headings, big numbers), 600 (footnotes).

**Spacing scale (px):** 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40.

**Radius scale (px):** 4 (bars), 6, 9, 10, 12, 14, 16, 18, 20, 24, 999 (pills), 50% (circles).

**Shadows:** mastered skill node: `0 6px 16px rgba(232,163,61,.4)`. Motion-plan overlay panel: `0 24px 60px rgba(34,31,54,.25)`.

## Assets
No image/icon assets — all icons are hand-drawn inline SVG in the Lucide style (24×24 viewBox, 2px stroke, round caps/joins, no fill). No photography or illustration used anywhere in this pass.

## Files
- `MatematikaOkos.dc.html` — the interactive HTML prototype covering all 3 screens (open directly in a browser).
- `support.js` — internal runtime helper for the prototype format; not relevant to production implementation.
