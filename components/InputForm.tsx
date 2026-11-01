"use client";

import { useState } from "react";
import { parseGuess } from "@/lib/scoring";
import Calculator from "./Calculator";
import Icon from "./Icon";

/** Numeric guess input with the unit at the far right. Calls onSubmit with a validated positive number. */
export default function InputForm({
  unit,
  onSubmit,
}: {
  unit?: string | null;
  onSubmit: (guess: number) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const guess = parseGuess(value);
    if (guess === null) {
      setError("Introdu un număr pozitiv (ex: 2500000 sau 2.5e6).");
      return;
    }
    setError(null);
    onSubmit(guess);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-4 rounded-3xl bg-black/20 px-6 py-5 transition-colors focus-within:bg-black/30">
        <span aria-hidden="true" className="select-none font-mono text-3xl font-bold text-white/60 sm:text-4xl">
          &gt;
        </span>
        <input
          autoFocus
          // "text" + inputMode keeps scientific notation typeable on mobile
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            // only digits, separators and scientific notation characters
            setValue(e.target.value.replace(/[^0-9.,eE+\-\s]/g, ""));
            setError(null);
          }}
          placeholder="estimarea ta"
          aria-label="Estimarea ta"
          className="min-w-0 flex-1 bg-transparent font-mono text-3xl font-bold tracking-tight outline-none placeholder:text-white/45 sm:text-4xl"
        />
        {unit && (
          <span className="shrink-0 text-xs font-extrabold uppercase tracking-wide text-white/85 sm:text-sm">
            {unit}
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-bold text-white">
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <Calculator
          onUse={(n) => {
            setValue(String(Number(n.toPrecision(12))));
            setError(null);
          }}
        />
        <button
          type="submit"
          className="btn btn-card flex-1 !py-5 !text-base sm:max-w-xs sm:flex-none sm:!px-14"
        >
          Blochează
          <Icon name="enter" className="icon-nudge h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
