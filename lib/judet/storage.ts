import { localDateString } from "@/lib/gameStorage";
import { deriveStatus, targetCodeFor } from "./daily";
import { MAX_GUESSES } from "./logic";
import { isJudetCode } from "./lookup";

/**
 * Progresul jocului „Județul zilei” în localStorage.
 * Funcțiile sunt sigure pe server sau cu stocarea blocată: nu aruncă, întorc date goale.
 */

const KEY = "vadeem:judet:v1";

export interface JudetEntry {
  /** Ziua jocului (data locală, YYYY-MM-DD). */
  date: string;
  /** Codurile județelor ghicite, în ordine. */
  guesses: string[];
  /** Data locală la care s-a jucat. */
  playedOn: string;
}

/** Cheie: data jocului. */
export type JudetHistory = Record<string, JudetEntry>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Păstrează doar intrările valide și taie încercările de după victorie sau peste limită. */
export function sanitizeEntry(raw: unknown): JudetEntry | null {
  const e = raw as Partial<JudetEntry> | null;
  if (!e || typeof e.date !== "string" || !DATE.test(e.date) || !Array.isArray(e.guesses)) {
    return null;
  }
  const target = targetCodeFor(e.date);
  const guesses: string[] = [];
  for (const g of e.guesses) {
    if (typeof g !== "string" || !isJudetCode(g) || guesses.includes(g)) continue;
    guesses.push(g);
    if (g === target || guesses.length >= MAX_GUESSES) break;
  }
  if (guesses.length === 0) return null;
  return {
    date: e.date,
    guesses,
    playedOn: typeof e.playedOn === "string" && DATE.test(e.playedOn) ? e.playedOn : e.date,
  };
}

export function getJudetHistory(): JudetHistory {
  if (typeof localStorage === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, unknown>;
    const clean: JudetHistory = {};
    for (const raw of Object.values(parsed)) {
      const entry = sanitizeEntry(raw);
      if (entry) clean[entry.date] = entry;
    }
    return clean;
  } catch {
    return {}; // JSON stricat sau stocare indisponibilă
  }
}

/** Scrie istoricul (fără erori dacă stocarea e plină sau blocată: jocul rămâne în memorie). */
export function persistJudetHistory(history: JudetHistory) {
  try {
    localStorage.setItem(KEY, JSON.stringify(history));
  } catch {
    /* stocare indisponibilă */
  }
}

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return localDateString(new Date(y, m - 1, d + days));
}

/**
 * Statistici din istoric. Seria numără zilele consecutive cu victorie, jucate chiar în
 * ziua lor; ea rămâne vie și dacă azi nu ai jucat încă, dar ai câștigat ieri.
 */
export function computeJudetStats(history: JudetHistory, today: string) {
  const finished = Object.values(history).filter(
    (e) => deriveStatus(e.date, e.guesses) !== "playing",
  );
  const wins = finished.filter((e) => deriveStatus(e.date, e.guesses) === "won");
  const winDays = new Set(wins.filter((e) => e.playedOn === e.date).map((e) => e.date));

  let maxStreak = 0;
  for (const d of winDays) {
    if (winDays.has(shiftDate(d, -1))) continue; // nu e începutul unei serii
    let len = 0;
    while (winDays.has(shiftDate(d, len))) len++;
    maxStreak = Math.max(maxStreak, len);
  }

  let cursor = winDays.has(today) ? today : shiftDate(today, -1);
  let streak = 0;
  while (winDays.has(cursor)) {
    streak++;
    cursor = shiftDate(cursor, -1);
  }
  return { streak, maxStreak, played: finished.length, wins: wins.length };
}
