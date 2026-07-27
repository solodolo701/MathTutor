import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DEMO_MODE } from "@/lib/demo/config";

export default async function PricingPage() {
  let isPremium = false;

  if (!DEMO_MODE) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    isPremium = profile?.subscription_status === "premium";
  }

  const features = [
    { free: "5 feladat/nap", premium: "Korlátlan napi feladatok" },
    { free: "Előre megírt tippek", premium: "AI által generált tippek (Claude)" },
    { free: "XP és sorozat", premium: "Ismétlési ütemező (spacing)" },
    { free: "Csapat megtekintés", premium: "Csapat létrehozása + ranglista" },
    { free: "—", premium: "Szülői irányítópult" },
    { free: "—", premium: "Offline mód" },
    { free: "—", premium: "PDF letöltés" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Válassz tervet</h1>
        <p className="text-zinc-400">
          Próbáld ki ingyen 7 napig — nem kell bankkártya az ingyenes próbához.
        </p>
      </div>

      {isPremium && (
        <div className="mb-8 p-4 bg-green-950 border border-green-700 rounded-xl text-center text-green-400">
          ✓ Aktív prémium előfizetéssel rendelkezel!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {/* Free */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Ingyenes</h2>
          <div className="text-3xl font-bold text-white mb-4">
            0 EUR<span className="text-base font-normal text-zinc-400">/hó</span>
          </div>
          <ul className="space-y-2 mb-6">
            {features.map((f, i) => (
              <li key={i} className={`flex items-center gap-2 text-sm ${
                f.free === "—" ? "text-zinc-600" : "text-zinc-300"
              }`}>
                <span>{f.free === "—" ? "✗" : "✓"}</span>
                {f.free === "—" ? f.premium : f.free}
              </li>
            ))}
          </ul>
          <div className="w-full py-2 text-center text-zinc-500 text-sm">
            Jelenlegi terved
          </div>
        </div>

        {/* Premium */}
        <div className="bg-indigo-950 border-2 border-indigo-500 rounded-2xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
            LEGNÉPSZERŰBB
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Prémium</h2>
          <div className="text-3xl font-bold text-white mb-4">
            3,99 EUR<span className="text-base font-normal text-indigo-300">/hó</span>
          </div>
          <p className="text-indigo-300 text-sm mb-3">
            Vagy <strong>29,99 EUR/év</strong> (~2,50 EUR/hó) — 2 hónap ingyen!
          </p>
          <ul className="space-y-2 mb-6">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-indigo-200">
                <span className="text-green-400">✓</span>
                {f.premium}
              </li>
            ))}
          </ul>
          {!isPremium ? (
            <Link
              href="/api/stripe/checkout?plan=monthly"
              className="block w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-center rounded-xl font-semibold transition-colors"
            >
              Előfizetés — 3,99 EUR/hó
            </Link>
          ) : (
            <div className="w-full py-3 bg-green-700 text-white text-center rounded-xl font-semibold">
              ✓ Aktív előfizetés
            </div>
          )}
          <p className="text-center text-indigo-400 text-xs mt-3">
            7 napos visszatérítési garancia
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-zinc-500">
        <p>Az árak tartalmazzák a 27%-os magyar ÁFÁ-t. Stripe által biztonságos fizetés.</p>
        <p className="mt-1">
          Kérdésed van?{" "}
          <a href="mailto:hello@matematikaokos.hu" className="text-indigo-400 hover:text-indigo-300">
            Írj nekünk
          </a>
        </p>
      </div>
    </div>
  );
}
