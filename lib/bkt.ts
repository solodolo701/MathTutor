export interface BKTParams {
  p_l0: number;
  p_t: number;
  p_g: number;
  p_s: number;
}

export const DEFAULT_BKT_PARAMS: BKTParams = {
  p_l0: 0.1,
  p_t: 0.25,
  p_g: 0.2,
  p_s: 0.1,
};

export function updatePKnow(
  p_know: number,
  correct: boolean,
  params: BKTParams = DEFAULT_BKT_PARAMS
): number {
  const { p_t, p_g, p_s } = params;

  let updated: number;
  if (correct) {
    const numerator = p_know * (1 - p_s);
    const denominator = numerator + (1 - p_know) * p_g;
    updated = numerator / denominator;
  } else {
    const numerator = p_know * p_s;
    const denominator = numerator + (1 - p_know) * (1 - p_g);
    updated = numerator / denominator;
  }

  // Apply learning transition
  const new_p_know = updated + (1 - updated) * p_t;
  return Math.min(Math.max(new_p_know, 0), 1);
}

export function getNextReviewDays(p_know: number): number {
  if (p_know < 0.4) return 1;
  if (p_know < 0.6) return 3;
  if (p_know < 0.8) return 7;
  if (p_know < 0.9) return 14;
  return 30;
}

export function getNextReviewAt(p_know: number): Date {
  const days = getNextReviewDays(p_know);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function estimatePCorrect(p_know: number, difficulty: number): number {
  // P(correct) = P(know) * (1 - p_s) + (1 - P(know)) * p_g
  // Adjusted by difficulty: higher difficulty lowers P(correct)
  const p_s = DEFAULT_BKT_PARAMS.p_s * (1 + difficulty);
  const p_g = DEFAULT_BKT_PARAMS.p_g * (1 - difficulty * 0.5);
  return p_know * (1 - p_s) + (1 - p_know) * p_g;
}

export function calculateXP(correct: boolean, difficulty: number): number {
  if (correct) {
    return Math.round(10 + difficulty * 10);
  }
  return 2; // effort points
}
