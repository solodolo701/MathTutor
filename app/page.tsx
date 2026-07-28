import Link from "next/link";
import { BookOpen, Zap, Bot, Trophy, Shield, Users } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DEMO_MODE } from "@/lib/demo/config";

/* Page-scoped motion. Everything here is switched off under
   prefers-reduced-motion; nothing scales, so type never resamples. */
const LANDING_CSS = `
@keyframes lpRise {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lp-rise {
  animation: lpRise .6s cubic-bezier(.16,1,.3,1) both;
  animation-delay: var(--d, 0s);
}
@keyframes lpGlow {
  0%, 100% { opacity: .5; }
  50%      { opacity: .85; }
}
.lp-glow { animation: lpGlow 7s ease-in-out infinite; }
.lp-cta .lp-arrow { transition: transform .18s ease; display: inline-block; }
.lp-cta:hover .lp-arrow { transform: translateX(4px); }
.lp-step-num { transition: box-shadow .18s ease; }
.lp-card:hover .lp-step-num { box-shadow: var(--shadow-glow-brand); }
@media (prefers-reduced-motion: reduce) {
  .lp-rise { animation: none; opacity: 1; transform: none; }
  .lp-glow { animation: none; }
  .lp-cta:hover .lp-arrow { transform: none; }
}
`;

export default function Home() {
  // Without an auth backend, sending people to /signup is a dead end —
  // point the calls to action straight into the app instead.
  const enterHref = DEMO_MODE ? "/app/dashboard" : "/signup";
  const enterLabel = DEMO_MODE ? "Demó indítása" : "Ingyenes regisztráció";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />

      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-primary-solid)", color: "var(--color-on-primary)" }}
          >
            <BookOpen size={16} />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
            MatematikaOkos
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!DEMO_MODE && (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Bejelentkezés
            </Link>
          )}
          <Link
            href={enterHref}
            className="hover-lift lp-cta px-4 py-2 text-sm font-semibold rounded-lg"
            style={{
              background: "var(--color-primary-solid)",
              color: "var(--color-on-primary)",
            }}
          >
            {enterLabel} <span className="lp-arrow">→</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
          {/* Soft brand glow — decorative shape behind the headline */}
          <div
            aria-hidden
            className="lp-glow pointer-events-none absolute left-1/2 -translate-x-1/2 -top-24 w-[680px] h-[420px] max-w-full"
            style={{
              background:
                "radial-gradient(closest-side, var(--color-brand-950), transparent 78%)",
            }}
          />

          <div className="relative max-w-3xl">
            <div
              className="lp-rise inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm mb-8 border"
              style={{
                background: "var(--color-brand-950)",
                borderColor: "var(--color-brand-border)",
                color: "var(--color-brand-400)",
              }}
            >
              <Zap size={14} />
              <span>Magyar NAT 2020 tanterv alapján</span>
            </div>

            <h1
              className="lp-rise text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
              style={{ "--d": ".08s", color: "var(--color-text-primary)" } as React.CSSProperties}
            >
              Okos matektanár
              <br />
              <span style={{ color: "var(--color-primary)" }}>a zsebedben</span>
            </h1>

            <p
              className="lp-rise text-xl mb-4 leading-relaxed max-w-2xl mx-auto"
              style={{ "--d": ".16s", color: "var(--color-text-secondary)" } as React.CSSProperties}
            >
              Adaptív feladatsor, AI segítség és játékosított tanulás —
              kifejezetten magyar középiskolásoknak. Felkészítés az érettségire
              3,99 EUR/hó-tól.
            </p>

            {/* Social proof */}
            <p
              className="lp-rise text-sm mb-10"
              style={{ "--d": ".22s", color: "var(--color-text-muted)" } as React.CSSProperties}
            >
              {DEMO_MODE
                ? "Demó mód • Regisztráció nélkül kipróbálható • A haladás nem mentődik"
                : "7 napos ingyenes prémium próba • Nem kell bankkártya • Azonnal elérhető"}
            </p>

            <div
              className="lp-rise flex flex-col sm:flex-row gap-4 justify-center"
              style={{ "--d": ".28s" } as React.CSSProperties}
            >
              <Link
                href={enterHref}
                className="hover-lift lp-cta px-8 py-4 rounded-xl font-semibold text-lg"
                style={{ background: "var(--color-primary-solid)", color: "var(--color-on-primary)" }}
              >
                {DEMO_MODE ? "Demó indítása" : "Kezdj el ingyen"}{" "}
                <span className="lp-arrow">→</span>
              </Link>
              <Link
                href={DEMO_MODE ? "/app/skills" : "/login"}
                className="hover-lift px-8 py-4 rounded-xl font-semibold text-lg border"
                style={{
                  background: "var(--color-bg-card)",
                  borderColor: "var(--color-border-base)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {DEMO_MODE ? "Készségfa megtekintése" : "Van már fiókom"}
              </Link>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section
          className="border-y py-8 px-6"
          style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}
        >
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
            {[
              { value: "500+", label: "Feladat" },
              { value: "9–10.", label: "Évfolyam" },
              { value: "NAT 2020", label: "Tanterv" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="lp-rise"
                style={{ "--d": `${0.34 + i * 0.07}s` } as React.CSSProperties}
              >
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  {s.value}
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature cards */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl font-bold text-center mb-12"
              style={{ color: "var(--color-text-primary)" }}
            >
              Minden, amire szükséged van az érettségihez
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  Icon: Bot,
                  title: "AI segítség",
                  desc: "Elakadtál? A Claude AI-alapú tanár Szókratészi módszerrel vezet rá a megoldásra — magyarul.",
                  accent: "var(--color-primary)",
                  bg: "var(--color-brand-950)",
                  border: "var(--color-brand-border)",
                },
                {
                  Icon: Zap,
                  title: "Adaptív tanulás",
                  desc: "A Bayes-féle tudáskövetés alapján pontosan azt gyakorolod, amire a legtöbbet fejlődsz.",
                  accent: "var(--color-amber-darker)",
                  bg: "var(--color-mastery-950)",
                  border: "var(--color-mastery-border)",
                },
                {
                  Icon: Trophy,
                  title: "Játékosított élmény",
                  desc: "XP, sorozatok, kitüntetések és csapatok — a matektanulás élménnyé válik.",
                  accent: "var(--color-amber-darker)",
                  bg: "var(--color-mastery-950)",
                  border: "var(--color-mastery-border)",
                },
              ].map((f, i) => (
                <div
                  key={f.title}
                  className="hover-lift lp-rise p-6 rounded-xl border"
                  style={
                    {
                      "--d": `${i * 0.08}s`,
                      background: f.bg,
                      borderColor: f.border,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: "var(--color-surface-3)" }}
                  >
                    <f.Icon size={20} style={{ color: f.accent }} />
                  </div>
                  <h3
                    className="font-semibold text-base mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          className="px-6 py-16 border-t"
          style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-10" style={{ color: "var(--color-text-primary)" }}>
              Hogyan működik?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              {[
                {
                  step: "1",
                  title: DEMO_MODE ? "Lépj be a demóba" : "Regisztrálj",
                  desc: DEMO_MODE
                    ? "Nincs fiók, nincs bankkártya — egy kattintás, és bent vagy."
                    : "Válaszd ki az évfolyamot, és indulj el — 2 perc alatt.",
                  Icon: Users,
                },
                {
                  step: "2",
                  title: "Gyakorolj naponta",
                  desc: "15 perces adaptív feladatsor: bemelegítés, fókusz, ismétlés.",
                  Icon: BookOpen,
                },
                {
                  step: "3",
                  title: "Fejlődj láthatóan",
                  desc: "Kövesd a tudásnövekedésed képességenként, gyűjts XP-t és jelvényeket.",
                  Icon: Shield,
                },
              ].map((s, i) => (
                <div
                  key={s.step}
                  className="hover-lift lp-rise lp-card flex gap-4 p-5 rounded-xl border"
                  style={
                    {
                      "--d": `${i * 0.08}s`,
                      background: "var(--color-bg-card)",
                      borderColor: "var(--color-border-base)",
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="lp-step-num w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: "var(--color-primary-solid)", color: "var(--color-on-primary)" }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center">
          <div className="lp-rise max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Kezdj el tanulni ma
            </h2>
            <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
              {DEMO_MODE
                ? "Nézz körül a demóban — fiók nélkül, azonnal."
                : "7 napos prémium próba, bankkártya nélkül."}
            </p>
            <Link
              href={enterHref}
              className="hover-lift lp-cta inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg"
              style={{ background: "var(--color-primary-solid)", color: "var(--color-on-primary)" }}
            >
              {enterLabel} <span className="lp-arrow">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t px-6 py-8 text-center text-sm"
        style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-muted)" }}
      >
        <p>© 2026 MatematikaOkos • Magyar középiskolásoknak • GDPR-megfelelő</p>
      </footer>
    </div>
  );
}
