import {
  clearLocalProgress,
  entryKey,
  getClientId,
  getHistory,
  getSynced,
  markSynced,
  writeHistory,
  type GameHistory,
} from "./gameStorage";
import { scoreFromFactor } from "./scoring";
import { supabase } from "./supabaseClient";

/** Access token of the signed-in user, if any. */
export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Send played questions to the server (community stats; linked to the account
 * when signed in). Safe to call repeatedly: already-sent entries are skipped,
 * and failures are silent so the game always works offline.
 */
export async function syncHistory(history: GameHistory): Promise<void> {
  try {
    const session = await getSession();
    // Entries sent anonymously are re-sent once after sign-in to link them to the user.
    const tag = session?.user.id ?? "anon";
    const synced = getSynced();
    const pending = Object.values(history).filter(
      (e) => !synced.has(`${entryKey(e.date, e.position)}|${tag}`),
    );
    if (pending.length === 0) return;

    const res = await fetch("/api/plays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        clientId: getClientId(),
        entries: pending.map((e) => ({
          date: e.date,
          position: e.position,
          guess: e.guess,
          playedOn: e.playedOn,
        })),
      }),
    });
    if (res.ok) {
      markSynced(pending.map((e) => `${entryKey(e.date, e.position)}|${tag}`));
    }
  } catch {
    /* offline or server down: retried on the next change */
  }
}

/**
 * Two-way sync for a signed-in user:
 *  1. download what the account already has and merge it into this browser
 *     (the account wins when both have the same question);
 *  2. upload whatever was played here (e.g. as a guest) but isn't in the account yet.
 * Returns the merged history, or null if nobody is signed in / the server is unreachable.
 */
export async function syncAccount(): Promise<GameHistory | null> {
  try {
    const session = await getSession();
    if (!session) return null;

    const res = await fetch("/api/plays", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return null;
    const { plays } = (await res.json()) as {
      plays: { date: string; position: number; guess: number; factor: number; playedOn: string }[];
    };

    const merged = getHistory();
    const tag = session.user.id;
    for (const p of plays) {
      merged[entryKey(p.date, p.position)] = {
        date: p.date,
        position: p.position,
        guess: p.guess,
        score: scoreFromFactor(p.factor),
        status: "completed",
        playedOn: p.playedOn,
      };
    }
    writeHistory(merged);
    markSynced(plays.map((p) => `${entryKey(p.date, p.position)}|${tag}`));

    await syncHistory(merged); // upload what only exists locally
    return merged;
  } catch {
    return null;
  }
}

/** Push anything unsent, then wipe this browser's progress (it lives in the account). */
export async function signOutAndClear(): Promise<void> {
  await syncHistory(getHistory());
  await supabase?.auth.signOut();
  clearLocalProgress();
}
