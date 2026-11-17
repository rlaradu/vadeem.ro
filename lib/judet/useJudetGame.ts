"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { localDateString } from "@/lib/gameStorage";
import { deriveStatus, targetCodeFor } from "./daily";
import { hintOrder } from "./hints";
import { compareGuess } from "./logic";
import { BY_CODE } from "./lookup";
import {
  computeJudetStats,
  getJudetHistory,
  persistJudetHistory,
  type JudetHistory,
} from "./storage";

export type SubmitOutcome = "ok" | "duplicate" | "invalid" | "finished";

/**
 * Starea jocului „Județul zilei” pentru ziua de azi: încercările, rezultatul fiecărei
 * încercări, statusul și statisticile (inclusiv seria). Totul stă doar în localStorage,
 * fără server și fără clasament.
 */
export function useJudetGame() {
  // Pornim goi, ca randarea pe server și prima randare din browser să coincidă.
  const [history, setHistory] = useState<JudetHistory>({});
  const [today, setToday] = useState("");
  const ready = today !== "";
  const historyRef = useRef(history);

  // 1. La montare: citim progresul local (doar în browser).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setHistory(getJudetHistory());
    setToday(localDateString());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // 2. Ținem referința la zi cu istoricul curent (pentru submitGuess).
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const guessCodes = history[today]?.guesses ?? [];
  const status = ready ? deriveStatus(today, guessCodes) : "playing";
  const target = ready ? BY_CODE[targetCodeFor(today)] : null;
  const results = target
    ? guessCodes.map((code) => compareGuess(BY_CODE[code], target))
    : [];
  // Câte un indiciu la întâmplare pentru fiecare încercare făcută (ordinea e stabilă în aceeași zi).
  const hints = target ? hintOrder(today, target).slice(0, guessCodes.length) : [];
  const stats = computeJudetStats(history, today);

  /** Înregistrează o încercare. Întoarce de ce a fost refuzată, dacă a fost. */
  const submitGuess = useCallback(
    (code: string): SubmitOutcome => {
      const current = historyRef.current;
      const entry = current[today];
      const guesses = entry?.guesses ?? [];

      if (deriveStatus(today, guesses) !== "playing") return "finished";
      if (!BY_CODE[code]) return "invalid";
      if (guesses.includes(code)) return "duplicate";

      const next: JudetHistory = {
        ...current,
        [today]: {
          date: today,
          guesses: [...guesses, code],
          playedOn: entry?.playedOn ?? localDateString(),
        },
      };
      persistJudetHistory(next);
      historyRef.current = next;
      setHistory(next);
      return "ok";
    },
    [today],
  );

  return { ready, today, target, guesses: guessCodes, results, hints, status, stats, submitGuess };
}
