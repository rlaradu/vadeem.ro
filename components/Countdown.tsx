"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Time left until the next questions (local midnight), e.g. "05:12:30". */
export default function Countdown() {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const s = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      setLeft(`${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`);
    }
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  return (
    <p className="font-mono text-xs font-bold uppercase tracking-widest text-white/80">
      {"// întrebări noi în "}
      <span className="tabular-nums">{left ?? "--:--:--"}</span>
    </p>
  );
}
