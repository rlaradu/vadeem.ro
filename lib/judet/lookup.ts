import { JUDETE } from "./data";
import type { Judet } from "./types";

export const BY_CODE: Readonly<Record<string, Judet>> = Object.fromEntries(
  JUDETE.map((j) => [j.code, j]),
);

export function isJudetCode(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(BY_CODE, code);
}

/** Text fără diacritice, cu litere mici și spații simple: „Bistrița-Năsăud” → „bistrita nasaud”. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const BY_NAME = new Map(JUDETE.map((j) => [normalize(j.name), j]));

/** Județul al cărui nume coincide exact (fără diacritice) cu textul. */
export function findByName(text: string): Judet | null {
  return BY_NAME.get(normalize(text)) ?? null;
}

/**
 * Numele complet sau indicativul auto din două litere ("CJ") → județ.
 * Indicativul "B" nu se acceptă singur: ar fi ambiguu cu începutul lui Bacău, Bihor etc.
 */
export function resolveJudet(text: string): Judet | null {
  const byName = findByName(text);
  if (byName) return byName;
  const code = text.trim().toUpperCase();
  return code.length === 2 && isJudetCode(code) ? BY_CODE[code] : null;
}

/** Județul căutat, dacă textul (început de nume) se potrivește cu exact unul neîncercat. */
export function uniqueMatch(text: string, exclude: ReadonlySet<string> = new Set()): Judet | null {
  const matches = searchJudete(text, exclude, 2);
  return matches.length === 1 ? matches[0] : null;
}

/** Sugestii pentru câmpul de căutare, cele mai relevante primele. */
export function searchJudete(
  query: string,
  exclude: ReadonlySet<string> = new Set(),
  limit = 8,
): Judet[] {
  const q = normalize(query);
  if (!q) return [];
  const upper = query.trim().toUpperCase();

  const scored: { judet: Judet; score: number }[] = [];
  for (const judet of JUDETE) {
    if (exclude.has(judet.code)) continue;
    const name = normalize(judet.name);
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (judet.code === upper) score = 0;
    else if (name.split(" ").some((w) => w.startsWith(q))) score = 1;
    else if (name.includes(q)) score = 2;
    if (score >= 0) scored.push({ judet, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.judet.name.localeCompare(b.judet.name, "ro"))
    .slice(0, limit)
    .map((s) => s.judet);
}
