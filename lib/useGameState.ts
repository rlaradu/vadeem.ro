"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Score } from "./scoring";
import { syncHistory } from "./cloudSync";
import {
  computeStreaks,
  entriesForDate,
  getHistory,
  localDateString,
  saveEntry,
  type GameHistory,
} from "./gameStorage";
import { supabase } from "./supabaseClient";

/**
 * Persisted game state: history, results for a given day and streaks.
 * `viewDate` selects the day shown (defaults to today; archive pages pass a past date).
 */
export function useGameState(viewDate?: string) {
  const [history, setHistory] = useState<GameHistory>({});
  const [today, setToday] = useState("");
  const ready = today !== "";
  const historyRef = useRef(history);

  useEffect(() => {
  if (!ready || !supabase) return;

  async function pullCloudPlays() {
    const { data: { session } } = await supabase!.auth.getSession();
    if (!session?.user) return;

    const { data: cloudPlays, error } = await supabase!
      .from("plays")
      .select("publish_date, position, guess, played_on")
      .eq("user_id", session.user.id);

    if (error || !cloudPlays || cloudPlays.length === 0) return;

    let currentHistory = getHistory();
    let hasNewData = false;

    cloudPlays.forEach((play) => {
      currentHistory = saveEntry({
        date: play.publish_date,
        position: play.position,
        guess: play.guess,
        score: 0 as unknown as Score,
        status: "completed",
        playedOn: play.played_on,
      });
      hasNewData = true;
    });

    if (hasNewData) {
      setHistory(currentHistory);
    }
  }

  // 1. Încercăm descărcarea imediată
  void pullCloudPlays();

  // 2. Ascultăm orice schimbare de sesiune (când se încarcă token-ul pe mobil)
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      void pullCloudPlays();
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
}, [ready]);

  const date = viewDate ?? today;
  const dayEntries = entriesForDate(history, date);
  const { streak, maxStreak } = computeStreaks(history, today);

  /** Record a played question for `date` (defaults to the day being viewed). */
  const recordPlay = useCallback(
    (position: number, guess: number, score: Score, forDate: string) => {
      setHistory(
        saveEntry({
          date: forDate,
          position,
          guess,
          score,
          status: "completed",
          playedOn: localDateString(),
        }),
      );
    },
    [],
  );

  return { history, dayEntries, streak, maxStreak, ready, today, recordPlay };
}