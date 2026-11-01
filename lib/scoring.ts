export type Score = "green" | "yellow" | "red";

/** Plain geometric symbols (not emoji) used in the copied share text. */
export const SHARE_SYMBOL: Record<Score, string> = {
  green: "●",
  yellow: "◐",
  red: "○",
};

/**
 * Parse user input into a positive number.
 * Accepts digits, spaces/dots as thousands separators ("1.500.000", "1 500 000"),
 * a comma as decimal separator ("2,5") and scientific notation ("1.5e6", "3e8").
 * Returns null when the input is not a valid positive finite number.
 */
export function parseGuess(raw: string): number | null {
  let s = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;

  if (/e/.test(s)) {
    // Scientific notation: only a standard "1.5e6" / "1,5e6" shape is accepted.
    s = s.replace(",", ".");
    if (!/^\d+(\.\d+)?e[+-]?\d+$/.test(s)) return null;
  } else if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    // Romanian style grouping: 1.500.000 or 1.500.000,5
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(",", ".");
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
  }

  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Error factor of a guess: how many times too high or too low it was.
 * Always >= 1; 1 means exact. Computed in log10 space:
 * factor = 10^|log10(guess) - log10(answer)|. Answers below 1 are clamped to 1.
 */
export function errorFactor(guess: number, answer: number): number {
  const diff = Math.abs(Math.log10(guess) - Math.log10(Math.max(answer, 1)));
  return Math.pow(10, diff);
}

/** "over" if the guess was above the answer, "under" if below. */
export function guessDirection(guess: number, answer: number): "over" | "under" {
  return guess >= Math.max(answer, 1) ? "over" : "under";
}

/** Overall daily score: geometric mean of the per-question factors (lower is better). */
export function overallScore(factors: number[]): number {
  if (factors.length === 0) return NaN;
  const meanLog =
    factors.reduce((sum, f) => sum + Math.log10(f), 0) / factors.length;
  return Math.pow(10, meanLog);
}

/** Histogram: 3 decades (1x..1000x) split into 20 log-spaced bars. */
export const BUCKETS = 20;

/** Bar index for a score; the last bar also holds everything above 1000x. */
export function bucketOf(score: number): number {
  const i = Math.floor((Math.log10(score) / 3) * BUCKETS);
  return Math.min(Math.max(i, 0), BUCKETS - 1);
}

/** Colour bucket for the share grid: <=2x green, <=10x yellow, else red. */
export function scoreFromFactor(factor: number): Score {
  if (factor <= 2) return "green";
  if (factor <= 10) return "yellow";
  return "red";
}

/** Convenience: colour for a guess/answer pair. */
export function scoreGuess(guess: number, answer: number): Score {
  return scoreFromFactor(errorFactor(guess, answer));
}

/** "2.99×" for small factors, "179×" from 100 up. */
export function formatFactor(f: number): string {
  if (!Number.isFinite(f)) return "–";
  return `${f < 100 ? f.toFixed(2) : Math.round(f).toLocaleString("ro-RO")}×`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ro-RO");
}
