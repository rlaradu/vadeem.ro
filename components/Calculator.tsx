"use client";

import { useState } from "react";
import { evalExpression } from "@/lib/calc";
import { formatNumber } from "@/lib/scoring";
import Icon from "./Icon";

/** Minimalist calculator icon; opens a visual keypad to help build an estimate. */
export default function Calculator({ onUse }: { onUse: (value: number) => void }) {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");

  // Transformăm simbolurile de pe ecran în operatori matematici pentru evalExpression
  const getParsableExpr = (str: string) => {
    return str
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, Math.PI.toString())
      .replace(/%/g, "/100");
  };

  // Evaluăm expresia folosind utilitarul tău existent
  const result = evalExpression(getParsableExpr(display));

  const handlePress = (val: string) => {
    if (val === "C") {
      setDisplay("0");
    } else if (val === "⌫") {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (val === "=") {
      if (result !== null) {
        setDisplay(String(result));
      } else {
        setDisplay("Eroare");
      }
    } else {
      setDisplay((prev) => {
        // Prevenim 0-urile inutile la început (ex: 05, 09), dar permitem 0.
        if (prev === "0" && !["+", "-", "×", "÷", "%", "."].includes(val)) {
          return val;
        }
        if (prev === "Eroare") return val;
        return prev + val;
      });
    }
  };

  function use() {
    if (result === null || result <= 0) return;
    onUse(result);
    setOpen(false);
    setDisplay("0");
  }

  // Funcție pentru aplicarea culorilor din imagine pentru fiecare buton
  const getButtonClass = (btn: string) => {
    const base =
      "text-xl font-bold rounded-full h-[3.25rem] w-[3.25rem] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all shadow-sm ";
    switch (btn) {
      case "C":
        return base + "bg-[#F2EFE9] text-black";
      case "⌫":
      case "%":
        return base + "bg-[#333333] text-white";
      case "÷":
        return base + "bg-[#B75BFE] text-white";
      case "×":
        return base + "bg-[#F9553E] text-white";
      case "-":
        return base + "bg-[#5568FE] text-white";
      case "+":
        return base + "bg-[#1FCA74] text-white";
      case "=":
        return base + "bg-[#F9D02E] text-black text-2xl";
      default:
        return base + "bg-[#333333] text-white";
    }
  };

  const buttons = [
    "C", "⌫", "%", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "π", "0", ".", "=",
  ];

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
        <div className="animate-pop absolute bottom-[4.25rem] left-0 z-10 w-[300px] rounded-3xl bg-[#1E1E1E] p-4 text-white shadow-2xl">
          {/* Ecran Calculator */}
          <div className="mb-4 flex min-h-[5rem] items-center justify-end overflow-x-auto truncate rounded-2xl bg-[#5568FE] p-4 text-right text-4xl font-medium tracking-wider text-white shadow-inner">
            {display}
          </div>

          {/* Grilă de butoane */}
          <div className="mb-4 grid grid-cols-4 place-items-center gap-2">
            {buttons.map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => handlePress(btn)}
                className={getButtonClass(btn)}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Buton Submit */}
          <button
            type="button"
            onClick={use}
            disabled={result === null || result <= 0}
            className="btn btn-card w-full !bg-[var(--card)] !py-3 !text-white rounded-xl uppercase tracking-widest font-bold disabled:opacity-50"
          >
            Folosește {result !== null && result > 0 ? `(${formatNumber(result)})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}