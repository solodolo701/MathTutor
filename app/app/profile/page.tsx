import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hu } from "@/lib/i18n/hu";
import { DEMO_MODE } from "@/lib/demo/config";
import { DEMO_PROFILE, demoState } from "@/lib/demo/data";

export default async function ProfilePage() {
  let profile: { display_name: string; grade: number; subscription_status: string };
  let email: string;
  let totalXP: number;
  let longestStreak: number;
  let shieldsAvailable: number;
  let earnedBadgeSet: Set<string>;
  let badgeCount: number;

  if (DEMO_MODE) {
    profile = DEMO_PROFILE;
    email = "demo@matematikaokos.hu";
    totalXP = demoState.xpEvents.reduce((sum, e) => sum + e.amount, 0);
    longestStreak = demoState.streak.longest;
    shieldsAvailable = demoState.streak.shields_available;
    earnedBadgeSet = new Set();
    badgeCount = 0;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [{ data: dbProfile }, { data: badges }, { data: streak }, { data: xpTotal }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("badges").select("*").eq("user_id", user.id).order("earned_at"),
        supabase.from("streaks").select("*").eq("user_id", user.id).single(),
        supabase.from("xp_events").select("amount").eq("user_id", user.id),
      ]);

    profile = dbProfile ?? { display_name: "Tanuló", grade: 9, subscription_status: "free" };
    email = user.email ?? "";
    totalXP = xpTotal?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
    longestStreak = streak?.longest ?? 0;
    shieldsAvailable = streak?.shields_available ?? 0;
    earnedBadgeSet = new Set(badges?.map((b) => b.badge_type) ?? []);
    badgeCount = badges?.length ?? 0;
  }

  const level = Math.floor(totalXP / 500) + 1;

  const allBadgeTypes = Object.keys(hu.badges) as Array<keyof typeof hu.badges>;

  const badgeIcons: Record<string, string> = {
    FIRST_SKILL_MASTERED: "🌟",
    STREAK_7: "🔥",
    STREAK_30: "🏆",
    SQUAD_FIRST_WIN: "🎯",
    PERFECT_SESSION: "💯",
    COMEBACK: "💪",
    EARLY_BIRD: "🌅",
    NIGHT_OWL: "🦉",
    GRADE9_COMPLETE: "📚",
    MATURA_READY: "🎓",
  };

  async function signOut() {
    "use server";
    if (DEMO_MODE) {
      redirect("/");
      return;
    }
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile header */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-700 flex items-center justify-center text-3xl font-bold text-white">
          {profile?.display_name?.[0]?.toUpperCase() ?? "M"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile?.display_name}</h1>
          <p className="text-zinc-400">{profile?.grade}. osztály</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs rounded-full">
              {level}. szint
            </span>
            <span className="text-zinc-500 text-sm">{totalXP} XP összesen</span>
          </div>
        </div>
      </div>

      {/* XP progress to next level */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>{level}. szint</span>
          <span>{totalXP % 500} / 500 XP a következő szintig</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all"
            style={{ width: `${((totalXP % 500) / 500) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "🔥", label: "Legjobb sorozat", value: longestStreak },
          { icon: "🛡️", label: "Sorozatvédő", value: shieldsAvailable },
          { icon: "🏅", label: "Kitüntetés", value: badgeCount },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Kitüntetések</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadgeTypes.map((badgeType) => {
            const earned = earnedBadgeSet.has(badgeType);
            return (
              <div
                key={badgeType}
                className={`p-4 rounded-xl border text-center transition-all ${
                  earned
                    ? "bg-yellow-950 border-yellow-700"
                    : "bg-zinc-900 border-zinc-800 opacity-40"
                }`}
              >
                <div className="text-3xl mb-2">
                  {earned ? badgeIcons[badgeType] : "🔒"}
                </div>
                <div className="text-xs font-medium text-white">
                  {hu.badges[badgeType]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-white">Fiók</h2>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">E-mail</span>
          <span className="text-zinc-300">{email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Előfizetés</span>
          <span className={profile?.subscription_status === "premium" ? "text-indigo-400" : "text-zinc-400"}>
            {profile?.subscription_status === "premium" ? "Prémium" : "Ingyenes"}
          </span>
        </div>
        <div className="pt-2 border-t border-zinc-800">
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-red-400 hover:text-red-300"
            >
              Kijelentkezés
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
