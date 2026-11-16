"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Score } from "./scoring";
import { syncAccount, syncHistory } from "./cloudSync";
import {
  computeStreaks,
  entriesForDate,
  getHistory,
  localDateString,
  saveEntry,
  type GameHistory,
} from "./gameStorage";
import { supabase } from "./supabaseClient";

export function useGameState(viewDate?: string) {
  // Start empty so server rendering matches the first client render.
  const [history, setHistory] = useState<GameHistory>({});
  const [today, setToday] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const ready = isMounted && today !== "";
  const historyRef = useRef(history);

  // 1. Mount: read local progress (browser only).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setHistory(getHistory());
    setToday(localDateString());
    setIsMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // 2. Account sync: whenever someone is (or becomes) signed in, merge their
  //    saved plays into this browser and upload what was played here as a guest.
  useEffect(() => {
    if (!isMounted || !supabase) return;
    const client = supabase;
    let running = false;

    async function run() {
      if (running) return;
      running = true;
      try {
        const merged = await syncAccount();
        if (merged) setHistory(merged);
      } finally {
        running = false;
      }
    }

    void run();
    const { data } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void run();
      if (event === "SIGNED_OUT") setHistory(getHistory());
    });
    return () => data.subscription.unsubscribe();
  }, [isMounted]);

  // 3. Upload new plays whenever history changes (no-op when everything is synced).
  useEffect(() => {
    historyRef.current = history;
    if (ready) void syncHistory(history);
  }, [history, ready]);

  const date = isMounted ? (viewDate ?? today) : "";
  const dayEntries = isMounted ? entriesForDate(history, date) : [];
  const { streak, maxStreak } = isMounted
    ? computeStreaks(history, today)
    : { streak: 0, maxStreak: 0 };

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
