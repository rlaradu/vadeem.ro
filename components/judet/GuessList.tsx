import type { ReactNode } from "react";
import { REGIUNI } from "@/lib/judet/data";
import { MAX_GUESSES, formatPopulation } from "@/lib/judet/logic";
import { BY_CODE } from "@/lib/judet/lookup";
import type { GuessResult, TileState } from "@/lib/judet/types";
import Icon from "../Icon";

// Culorile vin din card (vezi `.game-card` / `.theme-judet` în globals.css): corect = alb,
// aproape = galben-chihlimbar, departe = verde închis. Nu ne bazăm doar pe culoare:
// fiecare indiciu are și text, săgeți sau bife.
const TILE_STYLE: Record<TileState, string> = {
  correct: "bg-good text-accent-fg",
  close: "bg-mid text-[var(--tile-mid-fg)]",
  far: "bg-bad text-white",
};

// Aceleași coloane la antet și la rânduri: județ | regiune | populație | vecin | distanță.
const COLS =
  "grid grid-cols-[minmax(0,1.35fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,.72fr)_minmax(0,1fr)] gap-1 sm:gap-1.5";

function Tile({
  state,
  description,
  main,
  sub,
  delay,
  animate,
}: {
  state: TileState;
  /** Descriere completă pentru cititoare de ecran. */
  description: string;
  main: ReactNode;
  sub?: ReactNode;
  delay: number;
  animate: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={description}
      className={`flex min-w-0 flex-col items-center justify-center rounded-lg px-0.5 text-center leading-[1.1] sm:rounded-xl ${TILE_STYLE[state]} ${animate ? "animate-pop" : ""}`}
      style={animate ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span aria-hidden="true" className="text-[10px] font-extrabold [overflow-wrap:anywhere] sm:text-xs">
        {main}
      </span>
      {sub && (
        <span
          aria-hidden="true"
          className="mt-px flex items-center gap-0.5 text-[9px] font-bold opacity-80 sm:text-[11px]"
        >
          {sub}
        </span>
      )}
    </div>
  );
}

/** Un rând completat: numele județului ghicit și patru indicii. */
function GuessRow({ result: r, number, animate }: { result: GuessResult; number: number; animate: boolean }) {
  const judet = BY_CODE[r.code];

  return (
    <li className={`${COLS} h-[var(--row-h)]`} aria-label={`Încercarea ${number}: ${judet.name}`}>
      <span className="flex min-w-0 items-center font-display text-[13px] font-black leading-[1.05] tracking-tight sm:text-base">
        <span className="line-clamp-2">{judet.name}</span>
      </span>

      <Tile
        state={r.region.state}
        description={`Regiune: ${REGIUNI[judet.region]}, ${r.region.state === "correct" ? "aceeași ca a județului căutat" : "diferită de a județului căutat"}`}
        main={REGIUNI[judet.region]}
        sub={r.region.state === "correct" ? <Icon name="check" className="h-3 w-3" /> : undefined}
        delay={0}
        animate={animate}
      />
      <Tile
        state={r.population.state}
        description={`Populație: ${judet.population.toLocaleString("ro-RO")} locuitori. ${
          r.population.direction === "none"
            ? "Exact județul căutat."
            : r.population.direction === "up"
              ? "Județul căutat are mai mulți locuitori."
              : "Județul căutat are mai puțini locuitori."
        }`}
        main={formatPopulation(judet.population)}
        sub={
          r.population.direction === "none" ? (
            <Icon name="check" className="h-3 w-3" />
          ) : (
            <Icon name={r.population.direction} className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          )
        }
        delay={120}
        animate={animate}
      />
      <Tile
        state={r.neighbor.state}
        description={
          r.isCorrect
            ? "Județul căutat."
            : r.neighbor.state === "correct"
              ? "Se învecinează cu județul căutat."
              : "Nu se învecinează cu județul căutat."
        }
        main={r.neighbor.state === "correct" ? "DA" : "NU"}
        delay={240}
        animate={animate}
      />
      <Tile
        state={r.distance.state}
        description={
          r.isCorrect
            ? "Județul căutat."
            : `Distanță: ${Math.round(r.distance.km)} kilometri, ${r.distance.proximity}% apropiere.`
        }
        main={r.isCorrect ? "0 km" : `${Math.round(r.distance.km)} km`}
        sub={r.isCorrect ? <Icon name="check" className="h-3 w-3" /> : `${r.distance.proximity}%`}
        delay={360}
        animate={animate}
      />
    </li>
  );
}

/** Un loc încă liber: contururi stinse, ca să se vadă câte încercări au rămas. */
function EmptyRow({ number, next }: { number: number; next: boolean }) {
  return (
    <li aria-hidden="true" className={`${COLS} h-[var(--row-h)]`}>
      <span className="flex items-center font-mono text-xs font-bold text-white/35">{number}</span>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`rounded-lg sm:rounded-xl ${next ? "bg-black/20 ring-1 ring-white/25" : "bg-black/10"}`} />
      ))}
    </li>
  );
}

/**
 * Cele 6 încercări, în ordinea în care au fost făcute, cu locurile libere vizibile.
 * Lista are mereu aceeași înălțime, deci jocul nu „crește” și rămâne pe un singur ecran.
 * `notice` (eroare la căutare) ia locul antetului de coloane, tot fără să schimbe înălțimea.
 */
export default function GuessList({
  results,
  notice,
}: {
  results: readonly GuessResult[];
  notice?: string | null;
}) {
  return (
    <div>
      {notice ? (
        <p
          role="alert"
          className="mb-1 flex h-4 items-center rounded-md bg-black/25 px-2 text-[11px] font-bold text-white sm:text-xs"
        >
          {notice}
        </p>
      ) : (
        <div
          aria-hidden="true"
          className={`${COLS} mb-1 h-4 items-end font-mono text-[9px] font-bold uppercase tracking-wider text-white/60 sm:text-[10px]`}
        >
          <span />
          <span className="text-center">Regiune</span>
          <span className="text-center">
            <span className="sm:hidden">Pop.</span>
            <span className="hidden sm:inline">Populație</span>
          </span>
          <span className="text-center">Vecin</span>
          <span className="text-center">Distanță</span>
        </div>
      )}

      <ol className="flex flex-col gap-1 sm:gap-1.5" aria-label="Încercările tale">
        {Array.from({ length: MAX_GUESSES }, (_, i) => {
          const result = results[i];
          return result ? (
            <GuessRow key={result.code} result={result} number={i + 1} animate={i === results.length - 1} />
          ) : (
            <EmptyRow key={`empty-${i}`} number={i + 1} next={i === results.length} />
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Recapitularea de la final: un chenar mic pe încercare (indicativul județului și patru
 * pătrățele colorate), într-un singur rând. Numele complet e în `title` / `aria-label`.
 */
export function GuessRecap({ results }: { results: readonly GuessResult[] }) {
  return (
    <ol className="grid grid-cols-6 gap-1.5" aria-label="Încercările tale">
      {results.map((r, i) => {
        const judet = BY_CODE[r.code];
        const states = [r.region.state, r.population.state, r.neighbor.state, r.distance.state];
        return (
          <li
            key={r.code}
            title={judet.name}
            aria-label={`Încercarea ${i + 1}: ${judet.name}`}
            className="min-w-0 rounded-xl bg-black/20 px-1 py-1.5 text-center"
          >
            <span className="block font-mono text-[10px] font-extrabold leading-none sm:text-xs">{r.code}</span>
            <span aria-hidden="true" className="mt-1.5 grid grid-cols-4 gap-0.5">
              {states.map((s, k) => (
                <i key={k} className={`h-2 rounded-[3px] sm:h-2.5 ${TILE_STYLE[s]}`} />
              ))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
