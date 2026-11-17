"use client";

import { useRef } from "react";
import { CLOSE_DISTANCE_KM, MAX_GUESSES } from "@/lib/judet/logic";
import Icon from "../Icon";

const SAMPLE =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 align-middle text-[10px] font-extrabold";

/**
 * Regulile jocului. `compact` = varianta scurtă, afișată în locul listei goale înainte
 * de prima încercare; varianta completă stă în fereastra deschisă cu butonul „?”.
 */
export function HowToText({ compact = false }: { compact?: boolean }) {
  if (compact) return <HowToCompact />;

  return (
    <div className="space-y-2 text-sm leading-snug text-white/90">
      <p>
        Ghicește județul zilei din <b>{MAX_GUESSES} încercări</b>. Scrie numele unui județ (merge și fără
        diacritice). După fiecare încercare primești patru indicii și, în plus, un indiciu ales la întâmplare
        despre județul căutat (apare în caseta „indicii”):
      </p>
      <ul className="space-y-2">
        <li>
          <b>Regiune:</b> regiunea istorică (Transilvania, Muntenia, Moldova etc.) a județului ales, comparată cu a celui căutat.
        </li>
        <li>
          <b>Populație:</b> săgeata arată dacă județul căutat are mai mulți (
          <Icon name="up" className="inline h-3 w-3 align-text-bottom" />) sau mai puțini (
          <Icon name="down" className="inline h-3 w-3 align-text-bottom" />) locuitori. „Aproape” = diferență de
          cel mult 35%.
        </li>
        <li>
          <b>Vecin:</b> DA dacă județul ales are graniță comună cu cel căutat.
        </li>
        <li>
          <b>Distanță:</b> kilometri între centre și procent de apropiere (fără direcție).
          „Aproape” = sub {CLOSE_DISTANCE_KM} km.
        </li>
      </ul>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          <span className={`${SAMPLE} bg-good text-accent-fg`}>✓</span> corect
        </span>
        <span>
          <span className={`${SAMPLE} bg-mid text-[var(--tile-mid-fg)]`}>~</span> aproape
        </span>
        <span>
          <span className={`${SAMPLE} bg-bad text-white`}>✗</span> departe
        </span>
      </p>
      <p>
        Harta arată doar ce ai încercat: județele ghicite se colorează după cât de aproape erau, iar la final se
        arată cel căutat. Nu poate fi atinsă; județul trebuie scris.
      </p>
    </div>
  );
}

/** Varianta scurtă, pusă în locul listei goale: aceleași reguli, în puține cuvinte. */
function HowToCompact() {
  return (
    <div className="space-y-2 text-[12px] leading-snug text-white/90">
      <p>
        Ghicește județul zilei din <b>{MAX_GUESSES} încercări</b>. Scrie un județ; după fiecare încercare primești
        patru indicii:
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="font-bold">Regiune</dt>
        <dd>aceeași regiune istorică cu ținta?</dd>
        <dt className="font-bold">Populație</dt>
        <dd>săgeata: ținta are mai mulți sau mai puțini (~ = ±35%)</dd>
        <dt className="font-bold">Vecin</dt>
        <dd>DA = graniță comună cu ținta</dd>
        <dt className="font-bold">Distanță</dt>
        <dd>
          km între centre și % apropiere (~ = sub {CLOSE_DISTANCE_KM} km)
        </dd>
        <dt className="font-bold">Indiciu</dt>
        <dd>unul nou, la întâmplare, după fiecare încercare</dd>
      </dl>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          <span className={`${SAMPLE} bg-good text-accent-fg`}>✓</span> corect
        </span>
        <span>
          <span className={`${SAMPLE} bg-mid text-[var(--tile-mid-fg)]`}>~</span> aproape
        </span>
        <span>
          <span className={`${SAMPLE} bg-bad text-white`}>✗</span> departe
        </span>
      </p>
    </div>
  );
}

/** Butonul „?” din antetul cardului: deschide regulile într-o fereastră, fără să ocupe loc în joc. */
export function HowToButton() {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label="Cum se joacă"
        title="Cum se joacă"
        className="grid h-6 w-6 cursor-pointer place-items-center rounded-full border border-white/60 font-mono text-xs font-extrabold leading-none transition duration-200 hover:scale-110 hover:bg-white hover:text-[var(--card)] active:scale-90"
      >
        ?
      </button>

      <dialog
        ref={dialog}
        aria-label="Cum se joacă"
        // Clic pe fundalul întunecat (în afara casetei) închide fereastra.
        onClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const outside =
            e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom;
          if (outside) e.currentTarget.close();
        }}
        // font-normal: dialogul e în DOM sub antetul cardului (care e îngroșat) și ar moșteni greutatea.
        className="game-card theme-judet m-auto max-h-[88dvh] w-[min(92vw,34rem)] overflow-y-auto rounded-[2rem] border-0 p-5 font-normal shadow-2xl backdrop:bg-black/55 sm:p-7"
      >
        {/* Butonul de închidere e primul element focalizabil: fereastra se deschide cu începutul vizibil. */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            {"// cum se joacă"}
          </p>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Închide"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border border-white/50 transition duration-200 hover:scale-110 hover:bg-white hover:text-[var(--card)] active:scale-90"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <HowToText />
        <button type="button" onClick={() => dialog.current?.close()} className="btn btn-card mt-5">
          Am înțeles
        </button>
      </dialog>
    </>
  );
}
