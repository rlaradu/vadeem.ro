import { JUDETE } from "./data";
import { haversineKm } from "./geo";
import type { GuessResult, Judet, TileState } from "./types";

/** Câte încercări are jucătorul. */
export const MAX_GUESSES = 6;

/** Sub această distanță între centre, județul ghicit e „aproape”. */
export const CLOSE_DISTANCE_KM = 100;

/** Dacă populația diferă cu cel mult 35% (raport ≤ 1,35), e „apropiată”. */
export const CLOSE_POPULATION_RATIO = 1.35;

/** Cea mai mare distanță dintre centrele a două județe (baza procentului de apropiere). */
export const MAX_DISTANCE_KM = (() => {
  let max = 0;
  for (const a of JUDETE) for (const b of JUDETE) max = Math.max(max, haversineKm(a, b));
  return max;
})();

/**
 * Compară județul ghicit cu cel căutat și întoarce starea fiecărui indiciu:
 *  - regiune: aceeași regiune sau nu;
 *  - populație: apropiată (±35%) sau nu, plus sensul în care se află ținta;
 *  - vecin: dacă județul ghicit are graniță comună cu ținta;
 *  - distanță: kilometri între centre și procentul de apropiere (fără direcție).
 */
export function compareGuess(guess: Judet, target: Judet): GuessResult {
  const isCorrect = guess.code === target.code;

  const km = isCorrect ? 0 : haversineKm(guess, target);
  const ratio =
    Math.max(guess.population, target.population) /
    Math.min(guess.population, target.population);

  const populationState: TileState = isCorrect
    ? "correct"
    : ratio <= CLOSE_POPULATION_RATIO
      ? "close"
      : "far";

  return {
    code: guess.code,
    isCorrect,
    region: { state: guess.region === target.region ? "correct" : "far" },
    population: {
      state: populationState,
      direction: isCorrect ? "none" : target.population > guess.population ? "up" : "down",
      ratio,
    },
    neighbor: {
      state: isCorrect || target.neighbors.includes(guess.code) ? "correct" : "far",
    },
    distance: {
      state: isCorrect ? "correct" : km <= CLOSE_DISTANCE_KM ? "close" : "far",
      km,
      proximity: Math.round(100 * (1 - Math.min(km, MAX_DISTANCE_KM) / MAX_DISTANCE_KM)),
    },
  };
}

/** Populația pe scurt, cu virgulă zecimală: „1,72 mil.” / „326 mii”. */
export function formatPopulation(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString("ro-RO", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} mil.`;
  }
  return `${Math.round(n / 1000).toLocaleString("ro-RO")} mii`;
}

const SYMBOL: Record<TileState, string> = { correct: "●", close: "◐", far: "○" };

/** Un rând din textul de distribuit: câte un simbol pentru regiune, populație, vecin, distanță. */
export function shareRow(r: GuessResult): string {
  return [r.region.state, r.population.state, r.neighbor.state, r.distance.state]
    .map((s) => SYMBOL[s])
    .join("");
}

/** Textul copiat la „Copiază rezultatul”. */
export function buildShareText(edition: string, results: GuessResult[], won: boolean): string {
  const score = `${won ? results.length : "X"}/${MAX_GUESSES}`;
  return [
    `vadeem.ro · Județul zilei No. ${edition} · ${score}`,
    ...results.map(shareRow),
    "vadeem.ro/judetulZilei",
  ].join("\n");
}
