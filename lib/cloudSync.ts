import {
  entryKey,
  getClientId,
  getSynced,
  markSynced,
  type GameHistory,
} from "./gameStorage";
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
