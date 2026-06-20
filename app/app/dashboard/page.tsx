import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/types/supabase";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: userSkills }, { data: streak }, { data: recentXp }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("user_skills")
        .select("*")
        .eq("user_id", user.id)
        .order("p_know", { ascending: false })
        .limit(5),
      supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      supabase
        .from("xp_events")
        .select("amount")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

  // Fetch skills for the user_skills we got
  const skillIds = userSkills?.map((us) => us.skill_id) ?? [];
  const { data: skills } = skillIds.length > 0
    ? await supabase.from("skills").select("id, name_hu, topic_area").in("id", skillIds)
    : { data: [] as Pick<Skill, "id" | "name_hu" | "topic_area">[] };

  const skillMap = new Map(skills?.map((s) => [s.id, s]) ?? []);

  const totalXpThisWeek = recentXp?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const masteredSkills = userSkills?.filter((us) => us.p_know >= 0.8).length ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Szia, {profile?.display_name ?? "Tanuló"}! 👋
        </h1>
        <p className="text-zinc-400 mt-1">
          {profile?.grade}. osztály •{" "}
          {profile?.subscription_status === "premium" ? (
            <span className="text-indigo-400">Prémium</span>
          ) : (
            <span className="text-zinc-500">Ingyenes fiók</span>
          )}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Napi sorozat",
            value: streak?.current ?? 0,
            icon: "🔥",
            color: "text-orange-400",
          },
          {
            label: "XP ezen a héten",
            value: totalXpThisWeek,
            icon: "⚡",
            color: "text-yellow-400",
          },
          {
            label: "Elsajátított képesség",
            value: masteredSkills,
            icon: "🏆",
            color: "text-green-400",
          },
          {
            label: "Sorozatvédő",
            value: streak?.shields_available ?? 0,
            icon: "🛡️",
            color: "text-blue-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Start practice CTA */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Napi feladatsor</h2>
        <p className="text-indigo-200 text-sm mb-4">
          Körülbelül 15 percet vesz igénybe. Bemelegítés, fókuszált gyakorlás és ismétlés.
        </p>
        <Link
          href="/app/skills"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-900 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors"
        >
          Feladatsor indítása →
        </Link>
      </div>

      {/* Recent skills */}
      {userSkills && userSkills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Legutóbbi képességek</h2>
          <div className="space-y-3">
            {userSkills.map((us) => {
              const skill = skillMap.get(us.skill_id);
              return (
                <div
                  key={us.skill_id}
                  className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
                >
                  <div>
                    <span className="text-white font-medium">
                      {skill?.name_hu ?? us.skill_id}
                    </span>
                    {skill?.topic_area && (
                      <span className="text-zinc-500 text-sm ml-2">{skill.topic_area}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.round(us.p_know * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-zinc-400 w-10 text-right">
                      {Math.round(us.p_know * 100)}%
                    </span>
                    <Link
                      href={`/app/practice/${us.skill_id}`}
                      className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
                    >
                      Gyakorlás
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!userSkills || userSkills.length === 0) && (
        <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-4xl mb-4">🌱</div>
          <h3 className="text-lg font-medium text-white mb-2">Kezdd el a tanulást!</h3>
          <p className="text-zinc-400 text-sm mb-4">
            Válassz egy képességet a képességfán, és kezdd el a gyakorlást.
          </p>
          <Link
            href="/app/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Képességfa megtekintése →
          </Link>
        </div>
      )}
    </div>
  );
}
