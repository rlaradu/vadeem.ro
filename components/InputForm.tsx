"use client";

import { useState } from "react";
import { parseGuess } from "@/lib/scoring";
import Calculator from "./Calculator";
import Icon from "./Icon";

/**
 * Numeric guess input with the unit at the far right. Calls onSubmit with a validated positive number.
 * Pe telefon: câmpul pe un rând, dedesubt calculatorul și butonul. Pe ecrane late, totul pe un singur rând.
 */
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
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid grid-cols-[auto_1fr] items-center gap-2.5 sm:grid-cols-[auto_1fr_auto] sm:gap-3"
    >
      <div className="col-span-2 row-start-1 flex items-center gap-3 rounded-3xl bg-black/20 px-4 py-2.5 transition-colors focus-within:bg-black/30 sm:col-span-1 sm:col-start-2 sm:gap-4 sm:px-5 sm:py-3">
        <span aria-hidden="true" className="select-none font-mono text-2xl font-bold text-white/60 sm:text-3xl">
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
          className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-bold tracking-tight outline-none placeholder:text-white/45 sm:text-3xl"
        />
        {unit && (
          <span className="shrink-0 text-xs font-extrabold uppercase tracking-wide text-white/85 sm:text-sm">
            {unit}
          </span>
        )}
      </div>

      <div className="row-start-2 sm:col-start-1 sm:row-start-1">
        <Calculator
          onUse={(n) => {
            setValue(String(Number(n.toPrecision(12))));
            setError(null);
          }}
        />
      </div>

      <button
        type="submit"
        className="btn btn-card row-start-2 !py-3.5 !text-sm sm:col-start-3 sm:row-start-1 sm:!px-10 sm:!py-4"
      >
        Blochează
        <Icon name="enter" className="icon-nudge h-5 w-5" />
      </button>

      {error && (
        <p role="alert" className="col-span-full text-sm font-bold text-white">
          {error}
        </p>
      )}
    </form>
  );
}
