import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LayoutDashboard, Network, User, Flame, Shield, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NavLink } from "@/components/layout/NavLink";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
    <div className="min-h-screen" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md border-b"
        style={{
          background: "rgba(10,10,15,0.92)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        {/* Logo */}
        <Link href="/app/dashboard" className="flex items-center gap-2.5 font-bold text-base">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--color-brand-500)" }}
          >
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="hidden sm:inline" style={{ color: "var(--color-text-primary)" }}>
            MatematikaOkos
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <NavLink href="/app/dashboard" label="Irányítópult" Icon={LayoutDashboard} />
          <NavLink href="/app/skills" label="Képességek" Icon={Network} />
          <NavLink href="/app/profile" label="Profil" Icon={User} />
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Streak badge */}
          {streak && streak.current > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border"
              style={{
                background: "var(--color-streak-950)",
                borderColor: "var(--color-streak-border)",
              }}
            >
              <Flame size={14} style={{ color: "var(--color-streak-400)" }} />
              <span className="font-bold" style={{ color: "var(--color-streak-400)" }}>
                {streak.current}
              </span>
              {streak.shields_available > 0 && (
                <Shield size={13} style={{ color: "var(--color-shield-400)" }} />
              )}
            </div>
          )}

          {/* Premium CTA */}
          {profile?.subscription_status === "free" && (
            <Link
              href="/app/pricing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "var(--color-brand-500)", color: "white" }}
            >
              <Crown size={13} />
              Prémium
            </Link>
          )}

          {/* User name */}
          <span className="text-sm hidden md:inline" style={{ color: "var(--color-text-muted)" }}>
            {profile?.display_name ?? user.email}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 sm:hidden flex items-center justify-around px-2 py-2 border-t z-40"
        style={{
          background: "rgba(18,18,26,0.97)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        <NavLink href="/app/dashboard" label="Kezdőlap" Icon={LayoutDashboard} />
        <NavLink href="/app/skills" label="Képességek" Icon={Network} />
        <NavLink href="/app/profile" label="Profil" Icon={User} />
      </nav>
    </div>
  );
}
