import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, subscription_status")
    .eq("id", user.id)
    .single();

  const { data: streak } = await supabase
    .from("streaks")
    .select("current, shields_available")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <Link href="/app/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span>📐</span>
          <span className="hidden sm:inline">MatematikaOkos</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/app/dashboard"
            className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Irányítópult
          </Link>
          <Link
            href="/app/skills"
            className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Képességek
          </Link>
          <Link
            href="/app/profile"
            className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Profil
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          {streak && streak.current > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-950 border border-orange-800 rounded-full text-sm">
              <span>🔥</span>
              <span className="font-bold text-orange-400">{streak.current}</span>
              {streak.shields_available > 0 && (
                <span className="text-blue-400 ml-1">🛡️</span>
              )}
            </div>
          )}

          {profile?.subscription_status === "free" && (
            <Link
              href="/app/pricing"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Prémium
            </Link>
          )}

          <span className="text-sm text-zinc-400 hidden sm:inline">
            {profile?.display_name ?? user.email}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
