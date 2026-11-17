"use client";

import { useEffect, useState } from "react";
import {
  QUESTIONS_PER_DAY,
  entriesForDate,
  getHistory,
  localDateString,
} from "@/lib/gameStorage";
import { deriveStatus } from "@/lib/judet/daily";
import { MAX_GUESSES } from "@/lib/judet/logic";
import { getJudetHistory } from "@/lib/judet/storage";

export type GameId = "estimare" | "judet";

interface Status {
  label: string;
  done: boolean;
}

/** Cum stă jucătorul azi la un joc, din progresul salvat în browser. */
function readStatus(game: GameId): Status {
  const today = localDateString();

  if (game === "estimare") {
    const answered = entriesForDate(getHistory(), today).length;
    if (answered === 0) return { label: "Nejucat azi", done: false };
    if (answered >= QUESTIONS_PER_DAY) return { label: "Jucat azi", done: true };
    return { label: `${answered}/${QUESTIONS_PER_DAY} întrebări`, done: false };
  }

  const entry = getJudetHistory()[today];
  if (!entry) return { label: "Nejucat azi", done: false };
  const status = deriveStatus(today, entry.guesses);
  if (status === "won") return { label: `Ghicit în ${entry.guesses.length}/${MAX_GUESSES}`, done: true };
  if (status === "lost") return { label: "Încercat azi", done: true };
  return { label: `${entry.guesses.length}/${MAX_GUESSES} încercări`, done: false };
}

/** Insigna „Nejucat azi / Jucat azi” de pe cardul unui joc, citită după montare (localStorage). */
export default function GameStatus({ game }: { game: GameId }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(readStatus(game));
  }, [game]);

  // Până la montare rezervăm locul, ca layoutul să nu sară.
  if (!status) return <span className="inline-block h-7 w-28" aria-hidden="true" />;

  return (
    <span
      // --game = culoarea cardului jocului (setată pe cardul din meniu); altfel culoarea cardului.
      className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest ${
        status.done ? "bg-white text-[var(--game,var(--card))]" : "border border-white/50"
      }`}
    >
      {status.label}
    </span>
  );
}
