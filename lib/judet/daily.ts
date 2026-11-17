import { JUDETE } from "./data";
import { MAX_GUESSES } from "./logic";
import type { GameStatus } from "./types";

/**
 * Județul zilei se alege determinist din dată: fără baze de date și fără
 * configurare, iar serverul poate recalcula același răspuns pentru verificări.
 *
 * Zilele se grupează în cicluri de 42 (câte județe sunt). În fiecare ciclu,
 * toate județele apar exact o dată, într-o ordine amestecată pe baza numărului
 * ciclului. Așa nu se repetă nicio țintă în interiorul unui ciclu.
 */

/** Ziua 0 a calendarului (nu contează valoarea, doar să fie fixă). */
const EPOCH = "2026-01-01";
const CODES = JUDETE.map((j) => j.code).sort();
const SALT = 0x6a09e667;

/** Zile întregi între EPOCH și `date` („YYYY-MM-DD”). */
function dayIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [ey, em, ed] = EPOCH.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / 864e5);
}

/** Generator pseudoaleator cu seed (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const orderCache = new Map<number, string[]>();

/** Ordinea județelor în ciclul `cycle` (amestecare Fisher–Yates cu seed). */
function cycleOrder(cycle: number): string[] {
  const cached = orderCache.get(cycle);
  if (cached) return cached;

  const rand = mulberry32(Math.imul(cycle ^ SALT, 2654435761));
  const order = [...CODES];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // Nu repetăm ținta între ultima zi a ciclului anterior și prima a acestuia.
  if (cycle > 0 && order[0] === cycleOrder(cycle - 1)[order.length - 1]) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  orderCache.set(cycle, order);
  return order;
}

/** Codul județului căutat în ziua `date` („YYYY-MM-DD”, data locală a jucătorului). */
export function targetCodeFor(date: string): string {
  const idx = dayIndex(date);
  const n = CODES.length;
  const cycle = Math.floor(idx / n);
  const pos = ((idx % n) + n) % n;
  return cycleOrder(cycle)[pos];
}

/**
 * Starea jocului dintr-o zi, calculată din încercări (nu stocată):
 * câștigat dacă una e județul căutat, pierdut după `MAX_GUESSES` încercări greșite.
 */
export function deriveStatus(date: string, guesses: readonly string[]): GameStatus {
  if (guesses.includes(targetCodeFor(date))) return "won";
  return guesses.length >= MAX_GUESSES ? "lost" : "playing";
}
