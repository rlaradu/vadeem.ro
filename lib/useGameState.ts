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
  // Empty until mounted: the date and localStorage only exist in the browser,
  // and reading them during render would break prerendering.
  const [today, setToday] = useState("");
  const ready = today !== "";
  const historyRef = useRef(history);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setHistory(getHistory());
    setToday(localDateString());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Upload new plays whenever history changes (no-op when everything is synced).
  useEffect(() => {
    historyRef.current = history;
    if (ready) void syncHistory(history);
  }, [history, ready]);

  // When the user signs in, re-send everything so it's linked to the account.
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void syncHistory(historyRef.current);
    });
    return () => data.subscription.unsubscribe();
  }, []);

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
