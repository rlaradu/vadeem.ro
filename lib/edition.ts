/** Date of edition No. 001 (the first day the game runs). */
const LAUNCH_DATE = "2026-11-01";

/** Edition number of a day, zero-padded: "001", "098". Never below 001. */
export function editionNumber(date: string): string {
  const [ly, lm, ld] = LAUNCH_DATE.split("-").map(Number);
  const [y, m, d] = date.split("-").map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ly, lm - 1, ld)) / 864e5);
  return String(Math.max(days + 1, 1)).padStart(3, "0");
}
