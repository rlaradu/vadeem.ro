"use client";

import { useState } from "react";
import { evalExpression } from "@/lib/calc";
import { formatNumber } from "@/lib/scoring";
import Icon from "./Icon";

/** Minimalist calculator icon; opens a small expression box to help build an estimate. */
export default function Calculator({ onUse }: { onUse: (value: number) => void }) {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState("");
  const result = evalExpression(expr);

  function use() {
    if (result === null || result <= 0) return;
    onUse(result);
    setOpen(false);
    setExpr("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Calculator"
        aria-expanded={open}
        title="Calculator"
        className="grid h-14 w-14 cursor-pointer place-items-center rounded-full border-2 border-white/70 text-white transition duration-200 hover:scale-110 hover:bg-white hover:text-[var(--card)] active:scale-90"
      >
        <Icon name="calculator" className="h-6 w-6" />
      </button>

      {open && (
        <div className="animate-pop absolute bottom-[4.25rem] left-0 z-10 w-72 rounded-3xl bg-[#f6f3ec] p-4 text-[#1f1814] shadow-2xl">
          <input
            autoFocus
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                use();
              }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="ex: 8000000 * 0.3 / 2"
            aria-label="Expresie"
            className="w-full rounded-xl bg-[#e9e6dd] px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--card)]"
          />
          <p className="mt-3 min-h-8 break-words font-mono text-2xl font-bold">
            {result === null ? <span className="text-black/25">=</span> : `= ${formatNumber(result)}`}
          </p>
          <button
            type="button"
            onClick={use}
            disabled={result === null || result <= 0}
            className="btn btn-card mt-3 w-full !bg-[var(--card)] !text-white !py-2.5"
          >
            Folosește
          </button>
        </div>
      )}
    </div>
  );
}
