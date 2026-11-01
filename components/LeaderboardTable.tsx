"use client";

import { useEffect, useState } from "react";
import { formatFactor } from "@/lib/scoring";

interface Row {
  rank: number;
  username: string;
  score: number;
  streak: number;
  played: number;
}

type Load =
  | { status: "loading" }
  | { status: "ready"; rows: Row[] }
  | { status: "error" };

export default function LeaderboardTable() {
  const [load, setLoad] = useState<Load>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelled && setLoad({ status: "ready", rows: d.rows }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  if (load.status === "loading") {
    return (
      <p className="py-10 text-center font-mono text-sm uppercase tracking-widest text-muted">
        Se încarcă…
      </p>
    );
  }
  if (load.status === "error") {
    return (
      <p className="py-10 text-center font-bold">
        Nu am putut încărca clasamentul. Încearcă din nou mai târziu.
      </p>
    );
  }
  if (load.rows.length === 0) {
    return (
      <p className="py-10 text-center text-muted">
        Încă nu e nimeni în clasament. Creează un cont și joacă cel puțin 3
        întrebări!
      </p>
    );
  }

  return (
    <div className="animate-rise overflow-x-auto rounded-3xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line font-mono text-[11px] uppercase tracking-widest text-muted">
          <tr>
            <th className="px-5 py-4">Loc</th>
            <th className="px-5 py-4">Utilizator</th>
            <th className="px-5 py-4 text-right">Scor</th>
            <th className="px-5 py-4 text-right">Serie</th>
          </tr>
        </thead>
        <tbody>
          {load.rows.map((r) => (
            <tr
              key={r.rank}
              className="border-b border-line/60 transition-colors last:border-0 hover:bg-accent-soft"
            >
              <td className="px-5 py-3">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full font-mono text-xs font-bold ${
                    r.rank <= 3 ? "bg-accent text-accent-fg" : "text-muted"
                  }`}
                >
                  {r.rank}
                </span>
              </td>
              <td className="px-5 py-3 font-bold">
                {r.username}
                <span className="ml-2 font-mono text-xs font-normal text-muted">
                  {r.played} întrebări
                </span>
              </td>
              <td className="px-5 py-3 text-right font-mono font-bold text-accent">
                {formatFactor(r.score)}
              </td>
              <td className="px-5 py-3 text-right font-mono">{r.streak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
