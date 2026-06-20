import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📐</span>
          <span className="font-bold text-xl text-white">MatematikaOkos</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            Bejelentkezés
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors"
          >
            Ingyenes regisztráció
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950 border border-indigo-800 rounded-full text-indigo-400 text-sm mb-8">
            <span>✨</span>
            <span>Magyar NAT 2020 tanterv alapján</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Okos matektanár
            <br />
            <span className="text-indigo-400">a zsebedben</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Adaptív feladatsor, AI segítség, és játékosított tanulás —
            kifejezetten magyar középiskolásoknak. Felkészítés az érettségire
            3,99 EUR/hó-tól.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-lg transition-colors"
            >
              Kezdj el ingyen →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold text-lg transition-colors"
            >
              Bejelentkezés
            </Link>
          </div>

          <p className="text-sm text-zinc-500 mt-4">
            7 napos ingyenes prémium próba • Nem kell bankkártya
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 max-w-3xl w-full text-left">
          {[
            {
              icon: "🧠",
              title: "Adaptív tanulás",
              desc: "A Bayes-féle tudáskövetés alapján pontosan azt tanulja meg, amire szüksége van.",
            },
            {
              icon: "🎮",
              title: "Játékosított élmény",
              desc: "XP, sorozatok, kitüntetések és csapatok — a tanulás nem kell, hogy unalmas legyen.",
            },
            {
              icon: "🤖",
              title: "AI segítség",
              desc: "Elakadtál? A Claude AI-alapú tanár magyarázza el a következő lépést — románul.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-6 text-center text-zinc-500 text-sm">
        <p>© 2025 MatematikaOkos • Magyar középiskolásoknak • GDPR-megfelel</p>
      </footer>
    </div>
  );
}
