import type { Country, WeightConfig, ScoredCountry, RawScores } from "./types";

const SCORE_KEYS: (keyof RawScores)[] = [
  "energyPriceScore",
  "carbonCommitmentScore",
  "nuclearFrameworkScore",
  "marketDeregScore",
  "partnerEcosystemScore",
  "licensingClarityScore",
  "geopoliticalRiskScore",
  "financingSupportScore",
];

export function computeWeightedScore(
  country: Country,
  weights: WeightConfig
): number {
  let weightedSum = 0;
  let maxPossible = 0;

  for (const key of SCORE_KEYS) {
    const w = weights[key] ?? 1;
    weightedSum += country[key] * w;
    maxPossible += 10 * w;
  }

  if (maxPossible === 0) return 0;
  return Math.round((weightedSum / maxPossible) * 100);
}

export function scoreCountries(
  countries: Country[],
  weights: WeightConfig
): ScoredCountry[] {
  return countries
    .map((c) => ({ ...c, weightedScore: computeWeightedScore(c, weights) }))
    .sort((a, b) => b.weightedScore - a.weightedScore);
}

export function scoreToColor(score: number, dimmed = false): string {
  if (dimmed) return "#94a3b8";
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 65) return "#16a34a";
  if (clamped >= 45) return "#d97706";
  return "#dc2626";
}

export function scoreToFillColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 70) return "#15803d";
  if (clamped >= 55) return "#16a34a";
  if (clamped >= 45) return "#65a30d";
  if (clamped >= 35) return "#ca8a04";
  if (clamped >= 25) return "#dc2626";
  return "#991b1b";
}

export function scoreLabel(score: number): string {
  if (score >= 65) return "Strong";
  if (score >= 45) return "Moderate";
  return "Weak";
}

export const SCORE_KEYS_EXPORT = SCORE_KEYS;
