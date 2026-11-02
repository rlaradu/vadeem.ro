
import type { Score } from "./scoring";
import { supabase } from "./supabaseClient";

/**
 * localStorage persistence for played games (guests). All functions are safe to
 * call on the server or with storage blocked: they return empty data / no-op.
 */

const HISTORY_KEY = "fermi.ro:history:v2";
const LEGACY_KEY = "fermi.ro:v1"; // MVP format: { lastResult, streak, maxStreak }

export const QUESTIONS_PER_DAY = 3;

export interface GameEntry {
  /** The question's publish_date (YYYY-MM-DD, local). */
  date: string;
  /** Question slot within the day (1..3). Entries from before 3/day have 1. */
  position: number;
  guess: number;
  score: Score;
  status: "completed";
  /** Local date the game was actually played. Differs from `date` for archive plays. */
  playedOn: string;
}

/** Keyed by `${date}:${position}`. */
export type GameHistory = Record<string, GameEntry>;

export function entryKey(date: string, position: number): string {
  return `${date}:${position}`;
}

/** Local (not UTC) date as YYYY-MM-DD. */
export function localDateString(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return localDateString(new Date(y, m - 1, d + days));
}

function isEntry(e: unknown): e is GameEntry {
  const x = e as GameEntry;
  return (
    !!x &&
    typeof x.date === "string" &&
    typeof x.guess === "number" &&
    ["green", "yellow", "red"].includes(x.score)
  );
}

function persist(history: GameHistory) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* storage full/unavailable: caller keeps the in-memory copy */
  }
}

/** Read all played games. Migrates older formats (single result / date-keyed) once. */
export function getHistory(): GameHistory {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, GameEntry>;
      const clean: GameHistory = {};
      for (const v of Object.values(parsed)) {
        if (!isEntry(v)) continue;
        const position = Number(v.position) || 1; // pre-3/day entries
        clean[entryKey(v.date, position)] = {
          ...v,
          position,
          status: "completed",
          playedOn: v.playedOn ?? v.date,
        };
      }
      return clean;
    }
    // One-time migration of the single last result from the MVP.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "null");
    const r = legacy?.lastResult;
    if (r && isEntry(r)) {
      const history: GameHistory = {
        [entryKey(r.date, 1)]: {
          ...r,
          position: 1,
          status: "completed",
          playedOn: r.date,
        },
      };
      persist(history);
      return history;
    }
  } catch {
    /* corrupted JSON or storage unavailable */
  }
  return {};
}

export function getEntry(date: string, position: number): GameEntry | null {
  return getHistory()[entryKey(date, position)] ?? null;
}

/** All entries for a given question date, ordered by position. */
export function entriesForDate(history: GameHistory, date: string): GameEntry[] {
  return Object.values(history)
    .filter((e) => e.date === date)
    .sort((a, b) => a.position - b.position);
}

/** Save a finished game. Returns the updated history. Never overwrites an existing entry. */
export function saveEntry(entry: GameEntry): GameHistory {
  const history = getHistory();
  const key = entryKey(entry.date, entry.position);
  if (history[key]) return history;
  history[key] = entry;
  persist(history);
  return history;
}
export async function saveEntryCloudAware(entry: GameEntry, userId?: string) {
  // 1. Salvăm local (pentru viteză și suport offline/guest)
  const history = saveEntry(entry);
  if (!supabase) return history;

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // 2. Dacă utilizatorul este logat, trimitem la API cu structura corectă (clientId + entries)
  if (userId) {
    try {
      await fetch("/api/plays", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clientId: getClientId(), // ID-ul unic din localStorage/browser
          entries: [
            {
              date: entry.date,
              position: entry.position,
              guess: entry.guess,
              playedOn: entry.playedOn,
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Eroare la trimiterea datelor:", error);
    }
  }

  return history;
}

/**
 * Streaks derived from history. A day counts when at least one of its
 * questions was played on that same day, so playing old archive questions
 * can't inflate a streak. A streak stays alive through today if the user
 * hasn't played yet but did yesterday.
 */
export function computeStreaks(
  history: GameHistory,
  today: string,
): { streak: number; maxStreak: number } {
  const days = new Set(
    Object.values(history)
      .filter((e) => e.playedOn === e.date)
      .map((e) => e.date),
  );

  let maxStreak = 0;
  for (const d of days) {
    if (days.has(shiftDate(d, -1))) continue; // not the start of a run
    let len = 0;
    while (days.has(shiftDate(d, len))) len++;
    maxStreak = Math.max(maxStreak, len);
  }

  let cursor = days.has(today) ? today : shiftDate(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = shiftDate(cursor, -1);
  }
  return { streak, maxStreak };
}

const CLIENT_ID_KEY = "fermi.ro:client-id";
const SYNCED_KEY = "fermi.ro:synced:v1";

/** Anonymous per-browser id used to deduplicate plays in the community stats. */
export function getClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID(); // storage blocked: id lasts for this page view only
  }
}

/** Keys of entries already sent to the server (tagged with who they were sent as). */
export function getSynced(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SYNCED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function markSynced(keys: string[]) {
  try {
    const all = getSynced();
    keys.forEach((k) => all.add(k));
    localStorage.setItem(SYNCED_KEY, JSON.stringify([...all]));
  } catch {
    /* ignore */
  }
}
