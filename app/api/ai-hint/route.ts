import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { DEMO_MODE } from "@/lib/demo/config";
import { findDemoProblem } from "@/lib/demo/data";

const FREE_AI_HINTS_PER_DAY = 3;
const PREMIUM_AI_HINTS_PER_DAY = 999;

export async function POST(req: NextRequest) {
  if (DEMO_MODE || !process.env.ANTHROPIC_API_KEY) {
    const { problemId } = await req.json();
    const problem = findDemoProblem(problemId);
    const hints = (problem?.hints as Array<{ level: number; text_hu: string }> | null) ?? [];
    const hint = hints[0]?.text_hu ?? "Nézd át újra a feladat lépéseit egyesével.";
    return NextResponse.json({ hint });
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId, studentAttempts, previousHints } = await req.json();

  if (!problemId) {
    return NextResponse.json({ error: "problemId required" }, { status: 400 });
  }

  // Get subscription status
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const isPremium = profile?.subscription_status === "premium";
  const limit = isPremium ? PREMIUM_AI_HINTS_PER_DAY : FREE_AI_HINTS_PER_DAY;

  // Rate limit check
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("ai_hint_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      { error: isPremium ? "Daily limit reached" : "Upgrade to premium for more AI hints" },
      { status: 403 }
    );
  }

  // Get the problem
  const { data: problem } = await supabase
    .from("problems")
    .select("*")
    .eq("id", problemId)
    .single();

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  // Fetch skill separately to avoid Supabase join type complexity
  const { data: skill } = await supabase
    .from("skills")
    .select("name_hu, description_hu")
    .eq("id", problem.skill_id)
    .single();

  const systemPrompt = `Te egy segítőkész matematikatanár vagy magyar középiskolások számára.
A feladatod: NE add meg a megoldást! Helyette tegyél fel irányító kérdéseket
vagy adj egy következő lépésre vonatkozó tippet. Legyen tömör (max 2 mondat).
Figyelj a tanuló korábbi hibáira. Mindig magyarul válaszolj.
Képesség: ${skill?.name_hu ?? "Matematika"}
${skill?.description_hu ? `Leírás: ${skill.description_hu}` : ""}`;

  const attemptsText = Array.isArray(studentAttempts) && studentAttempts.length > 0
    ? `Tanuló kísérletei: ${studentAttempts.join(", ")}`
    : "";
  const hintsText = Array.isArray(previousHints) && previousHints.length > 0
    ? `Korábbi tippek: ${previousHints.join(" / ")}`
    : "";

  const userMessage = `Feladat: ${problem.content_latex}
${attemptsText}
${hintsText}

Adj egy Szókratészi módszerű tippet (NE a megoldást!):`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const hintText = message.content[0].type === "text" ? message.content[0].text : "";

    // Log the AI hint usage
    await supabase.from("ai_hint_log").insert({
      user_id: user.id,
      problem_id: problemId,
      hint_text: hintText,
    });

    return NextResponse.json({ hint: hintText });
  } catch (error) {
    console.error("AI hint error:", error);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
