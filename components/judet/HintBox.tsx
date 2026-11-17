"use client";

import { useEffect, useState } from "react";

/** Scrie `text` literă cu literă (sau îl arată direct, dacă `animate` e fals sau utilizatorul preferă fără animații). */
function Typed({ text, animate }: { text: string; animate: boolean }) {
  const [n, setN] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setN(text.length);
      return;
    }
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 22);
    return () => clearInterval(id);
  }, [animate, text]);

  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="cursor-blink">_</span>}
    </>
  );
}

/**
 * Indiciile despre județul căutat, în afara cardului verde: după fiecare încercare apare
 * unul nou („indiciu 2: ...”), scris literă cu literă. Cele mai noi sunt sus. Înălțimea e
 * fixă (derulează în interior dacă sunt multe), ca jocul să rămână pe un singur ecran.
 */
export default function HintBox({ hints }: { hints: readonly string[] }) {
  // Doar indiciile apărute după ce s-a afișat caseta se scriu animat (nu și cele de la reîncărcare).
  const [initial] = useState(hints.length);

  return (
    <section
      aria-label="Indicii despre județul căutat"
      className="h-[6.2rem] min-w-0 flex-1 overflow-y-auto rounded-2xl border border-line bg-surface px-3 py-2 text-fg md:h-[8.5rem] md:flex-none"
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
        {"// indicii "}
        {hints.length}/5
      </p>
      {hints.length === 0 ? (
        <p className="mt-1 font-mono text-[12px] leading-snug text-muted md:text-[13px]">
          Primul indiciu apare după prima încercare.
        </p>
      ) : (
        <ol className="mt-1 space-y-1 font-mono text-[12px] leading-snug md:text-[13px]">
          {hints
            .map((h, i) => ({ h, n: i + 1 }))
            .reverse()
            .map(({ h, n }) => (
              <li key={n} className={n === hints.length ? "font-bold" : "text-muted"}>
                indiciu {n}: <Typed text={h} animate={n > initial} />
              </li>
            ))}
        </ol>
      )}
    </section>
  );
}
