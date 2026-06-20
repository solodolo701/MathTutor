"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CURRENT_YEAR = new Date().getFullYear();

export default function SignupPage() {
  const [step, setStep] = useState<"account" | "profile" | "parent-consent">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState<9 | 10 | 11 | 12>(9);
  const [birthYear, setBirthYear] = useState(CURRENT_YEAR - 15);
  const [parentEmail, setParentEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const age = CURRENT_YEAR - birthYear;
  const needsParentalConsent = age < 16;

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault();
    setStep("profile");
  }

  async function handleProfileStep(e: React.FormEvent) {
    e.preventDefault();
    if (needsParentalConsent) {
      setStep("parent-consent");
    } else {
      await completeSignup();
    }
  }

  async function completeSignup() {
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        display_name: displayName,
        grade,
        birth_year: birthYear,
        parent_email: needsParentalConsent ? parentEmail : null,
        consent_given_at: needsParentalConsent ? null : new Date().toISOString(),
      });

      if (profileError) {
        setError("Profil létrehozása sikertelen.");
        setLoading(false);
        return;
      }

      // Initialize streak record
      await supabase.from("streaks").insert({ user_id: data.user.id });
    }

    router.push("/app/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white inline-flex items-center gap-2">
            <span>📐</span> MatematikaOkos
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-white">Regisztráció</h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            {["Fiók", "Profil", ...(needsParentalConsent ? ["Szülői"] : [])].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === (step === "account" ? 0 : step === "profile" ? 1 : 2)
                    ? "bg-indigo-600 text-white"
                    : i < (step === "account" ? 0 : step === "profile" ? 1 : 2)
                    ? "bg-indigo-900 text-indigo-400"
                    : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-xs text-zinc-500">{s}</span>
                {i < 1 && <span className="text-zinc-700">›</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          {step === "account" && (
            <form onSubmit={handleAccountStep} className="space-y-4">
              <h2 className="text-lg font-medium text-white mb-4">Fiók adatok</h2>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">E-mail cím</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="pelda@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Jelszó</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Minimum 8 karakter"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                Tovább
              </button>
            </form>
          )}

          {step === "profile" && (
            <form onSubmit={handleProfileStep} className="space-y-4">
              <h2 className="text-lg font-medium text-white mb-4">Profil adatok</h2>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Becenév</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="pl. Kovács Péter"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Évfolyam</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value) as 9 | 10 | 11 | 12)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={9}>9. osztály</option>
                  <option value={10}>10. osztály</option>
                  <option value={11}>11. osztály</option>
                  <option value={12}>12. osztály</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Születési év</label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  required
                  min={CURRENT_YEAR - 25}
                  max={CURRENT_YEAR - 10}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              {needsParentalConsent && (
                <p className="text-amber-400 text-sm bg-amber-950 border border-amber-800 rounded-lg p-3">
                  ⚠️ Mivel 16 évnél fiatalabb vagy, a következő lépésben szülői jóváhagyás szükséges.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("account")}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                >
                  Vissza
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                >
                  {needsParentalConsent ? "Tovább" : "Regisztráció"}
                </button>
              </div>
            </form>
          )}

          {step === "parent-consent" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-white mb-4">Szülői jóváhagyás</h2>
              <p className="text-zinc-400 text-sm">
                Mivel 16 évnél fiatalabb vagy, szülei jóváhagyása szükséges a GDPR értelmében.
                Add meg szülőd e-mail címét — küldünk nekik egy jóváhagyási levelet.
              </p>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Szülő e-mail címe</label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="szulo@email.com"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("profile")}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                >
                  Vissza
                </button>
                <button
                  onClick={completeSignup}
                  disabled={loading || !parentEmail}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Regisztrálás..." : "Regisztráció"}
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500">
            Már van fiókod?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
              Bejelentkezés
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
