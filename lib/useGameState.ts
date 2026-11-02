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

export function useGameState(viewDate?: string) {
  // Pornim cu stări goale, sigure pentru Server-Side Rendering
  const [history, setHistory] = useState<GameHistory>({});
  const [today, setToday] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const ready = isMounted && today !== "";
  const historyRef = useRef(history);

  // 1. Efect de Montare - rulează doar pe client
  useEffect(() => {
    setHistory(getHistory());
    setToday(localDateString());
    setIsMounted(true);
  }, []);

  // 2. Efectul de Sincronizare cu Cloud-ul
  useEffect(() => {
    if (!isMounted || !supabase) return;
    const client = supabase;

    async function pullCloudPlays() {
      try {
        const { data: { session } } = await client.auth.getSession();
        
        if (!session?.user) {
          return;
        }

        const { data: cloudPlays, error } = await client
          .from("plays")
          .select("publish_date, position, guess, played_on")
          .eq("user_id", session.user.id);

        console.log("🔍 SYNC DEBUG:", { userId: session.user.id, cloudPlays });

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
      } catch (err) {
        console.error("Eroare sync:", err);
      }
    }

    void pullCloudPlays();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void pullCloudPlays();
    });

    return () => authListener.subscription.unsubscribe();
  }, [isMounted]);

  // 3. Efect pentru Push către Cloud
  useEffect(() => {
    historyRef.current = history;
    if (ready) void syncHistory(history);
  }, [history, ready]);

  // Asigurăm valori sigure pentru SSR înainte de montare
  const date = isMounted ? (viewDate ?? today) : "";
  const dayEntries = isMounted ? entriesForDate(history, date) : [];
  const { streak, maxStreak } = isMounted ? computeStreaks(history, today) : { streak: 0, maxStreak: 0 };

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
        })
      );
    },
    []
  );

  return { history, dayEntries, streak, maxStreak, ready, today, recordPlay };
}