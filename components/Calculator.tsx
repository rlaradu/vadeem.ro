"use client";

import { useEffect, useState } from "react";
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

  // Escape închide calculatorul.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
        className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border-2 border-white/70 text-white transition duration-200 hover:scale-110 hover:bg-white hover:text-[var(--card)] active:scale-90 sm:h-14 sm:w-14"
      >
        <Icon name="calculator" className="h-6 w-6" />
      </button>

      {open && (
        // Fereastră centrată, nu deasupra butonului: pe ecrane scunde un panou de ~480px
        // deasupra butonului ar ieși din ecran. Un clic pe fundal îl închide.
        <div
          className="fixed inset-0 z-40 grid place-items-center p-3"
          role="dialog"
          aria-modal="true"
          aria-label="Calculator"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Închide calculatorul"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/45"
          />
          <div className="animate-pop relative max-h-[calc(100dvh-1.5rem)] w-[300px] max-w-full overflow-y-auto rounded-3xl bg-[#1E1E1E] p-4 text-white shadow-2xl">
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
        </div>
      )}
    </div>
  );
}