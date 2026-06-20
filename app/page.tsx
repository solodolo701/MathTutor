import Link from "next/link";
import { BookOpen, Zap, Bot, Trophy, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-white" style={{ background: "var(--color-bg-base)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b"
        style={{ background: "rgba(10,10,15,0.9)", borderColor: "var(--color-border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-brand-500)" }}
          >
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
            MatematikaOkos
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Bejelentkezés
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
            style={{
              background: "var(--color-brand-500)",
              color: "white",
            }}
          >
            Ingyenes regisztráció →
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm mb-8 border"
              style={{
                background: "var(--color-brand-950)",
                borderColor: "var(--color-brand-border)",
                color: "var(--color-brand-400)",
              }}
            >
              <Zap size={14} />
              <span>Magyar NAT 2020 tanterv alapján</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Okos matektanár
              <br />
              <span style={{ color: "var(--color-brand-400)" }}>a zsebedben</span>
            </h1>

            <p
              className="text-xl mb-4 leading-relaxed max-w-2xl mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Adaptív feladatsor, AI segítség és játékosított tanulás —
              kifejezetten magyar középiskolásoknak. Felkészítés az érettségire
              3,99 EUR/hó-tól.
            </p>

            {/* Social proof */}
            <p className="text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>
              7 napos ingyenes prémium próba • Nem kell bankkártya • Azonnal elérhető
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "var(--color-brand-500)", color: "white" }}
              >
                Kezdj el ingyen →
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-colors border"
                style={{
                  background: "var(--color-bg-card)",
                  borderColor: "var(--color-border-base)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Van már fiókom
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
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: "var(--color-brand-400)" }}
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
                  accent: "var(--color-brand-400)",
                  bg: "var(--color-brand-950)",
                  border: "var(--color-brand-border)",
                },
                {
                  Icon: Zap,
                  title: "Adaptív tanulás",
                  desc: "A Bayes-féle tudáskövetés alapján pontosan azt gyakorolod, amire a legtöbbet fejlődsz.",
                  accent: "var(--color-xp-400)",
                  bg: "rgba(234,179,8,0.05)",
                  border: "rgba(234,179,8,0.2)",
                },
                {
                  Icon: Trophy,
                  title: "Játékosított élmény",
                  desc: "XP, sorozatok, kitüntetések és csapatok — a matektanulás élménnyé válik.",
                  accent: "var(--color-mastery-400)",
                  bg: "var(--color-mastery-950)",
                  border: "var(--color-mastery-border)",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-6 rounded-xl border transition-transform hover:scale-[1.02]"
                  style={{ background: f.bg, borderColor: f.border }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: "rgba(255,255,255,0.08)" }}
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
                  title: "Regisztrálj",
                  desc: "Válaszd ki az évfolyamot, és indulj el — 2 perc alatt.",
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
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex gap-4 p-5 rounded-xl border"
                  style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-base)" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: "var(--color-brand-500)", color: "white" }}
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
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Kezdj el tanulni ma
            </h2>
            <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
              7 napos prémium próba, bankkártya nélkül.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02]"
              style={{ background: "var(--color-brand-500)", color: "white" }}
            >
              Ingyenes regisztráció →
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
