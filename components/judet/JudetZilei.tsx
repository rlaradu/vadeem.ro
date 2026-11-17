"use client";

import { useState } from "react";
import { editionNumber } from "@/lib/edition";
import { MAX_GUESSES } from "@/lib/judet/logic";
import { resolveJudet, uniqueMatch } from "@/lib/judet/lookup";
import { useJudetGame } from "@/lib/judet/useJudetGame";
import QuestionCard from "../QuestionCard";
import CountyPicker from "./CountyPicker";
import GuessList from "./GuessList";
import HintBox from "./HintBox";
import { HowToButton, HowToText } from "./HowToPlay";
import MapFrame from "./MapFrame";
import ResultPanel from "./ResultPanel";
import type { MapState } from "./RomaniaMap";

const LABEL = "font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-xs";
const TITLE =
  "mt-1 text-[clamp(2.1rem,10vw,2.8rem)] font-black leading-[0.95] tracking-tight md:text-[clamp(2.4rem,6.8dvh,3.8rem)]";

/**
 * „Județul zilei”: ghicește județul misterios din 6 încercări, cu indicii despre
 * regiune, populație, vecinătate și distanță. Județul se scrie (harta nu se poate
 * atinge), iar tot jocul încape pe un singur ecran: lista are 6 locuri fixe.
 */
export default function JudetZilei() {
  const { ready, today, target, guesses, results, hints, status, stats, submitGuess } =
    useJudetGame();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!ready || !target) {
    return (
      <QuestionCard fit tone="green">
        <p className="py-16 text-center font-mono text-sm uppercase tracking-widest text-white/70">
          Se încarcă…
        </p>
      </QuestionCard>
    );
  }

  const finished = status !== "playing";
  const won = status === "won";
  const tried = new Set(guesses);
  const edition = editionNumber(today);

  // Culoarea fiecărui județ ghicit pe hartă. „Aproape” = vecin cu ținta sau sub 100 km.
  const mapStates: Record<string, MapState> = {};
  for (const r of results) {
    mapStates[r.code] = r.isCorrect
      ? "won"
      : r.neighbor.state === "correct" || r.distance.state === "close"
        ? "close"
        : "far";
  }
  if (status === "lost") mapStates[target.code] = "target"; // dezvăluim județul căutat

  // Înainte de prima încercare, în locul listei goale arătăm regulile.
  const showHelp = guesses.length === 0 && !error;

  function handleSubmit() {
    // Nume exact, indicativ sau un început de nume care se potrivește cu un singur județ.
    const judet = resolveJudet(text) ?? uniqueMatch(text, tried);
    if (!judet) {
      setError("Nu cunosc județul. Alege unul din sugestii.");
      return;
    }
    const outcome = submitGuess(judet.code);
    if (outcome === "duplicate") {
      setError(`Ai încercat deja ${judet.name}.`);
    } else if (outcome === "ok") {
      setText("");
      setError(null);
    }
  }

  const note = "// INS 2021 · hartă: geoBoundaries, CC BY 4.0";

  return (
    // Harta și indiciile stau în afara cardului verde (pe fundalul paginii): în stânga pe ecrane
    // late, deasupra pe telefon. Cardul conține doar jocul: câmpul și atributele încercărilor.
    <div className="animate-rise mx-auto my-auto w-full max-w-[1040px] px-3 py-2 sm:px-4 sm:py-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-center md:gap-8">
      <aside className="mb-2 flex items-start gap-3 md:mb-0 md:flex-col md:items-stretch md:gap-4">
        <MapFrame
          states={mapStates}
          caption={finished ? target.code : `${guesses.length}/${MAX_GUESSES}`}
        />
        {!finished && <HintBox hints={hints} />}
        <p className="hidden font-mono text-[10px] leading-relaxed text-muted md:block">{note}</p>
      </aside>

      <QuestionCard
        fit
        bare
        tone="green"
        headerRight={
          <>
            <HowToButton />
          </>
        }
      >
        <div className="space-y-2 sm:space-y-2.5">
          {finished ? (
            <>
              <h1 className="sr-only">Județul zilei</h1>
              <p className={LABEL}>{won ? `// ai ghicit în ${results.length}/${MAX_GUESSES}` : "// mai încearcă mâine"}</p>
              <p className={`${TITLE} font-display`} aria-live="polite">
                {target.name}
              </p>
              <ResultPanel target={target} results={results} won={won} edition={edition} stats={stats} />
            </>
          ) : (
            <>
              <div>
                <p className={LABEL}>
                  {"// încercarea "}
                  {guesses.length + 1}
                  {" din "}
                  {MAX_GUESSES}
                </p>
                <h1 className={TITLE}>
                  Județul zilei<span className="cursor-blink font-mono font-normal text-white/70">_</span>
                </h1>
              </div>
              <CountyPicker
                text={text}
                onTextChange={(value) => {
                  setText(value);
                  setError(null);
                }}
                onSubmit={handleSubmit}
                excluded={tried}
              />
              {/* Regulile se așază exact peste lista (încă goală), ca înălțimea să nu se schimbe. */}
              <div className="relative">
                <div className={showHelp ? "invisible" : undefined} aria-hidden={showHelp || undefined}>
                  <GuessList results={results} notice={error} />
                </div>
                {showHelp && (
                  <div className="absolute inset-0 overflow-y-auto rounded-2xl bg-black/15 p-3">
                    <HowToText compact />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/60 md:hidden">{note}</p>
      </QuestionCard>
    </div>
  );
}