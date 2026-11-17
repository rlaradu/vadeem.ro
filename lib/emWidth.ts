/**
 * Lățimea aproximativă a unui text de cifre, în „em” (1 em = mărimea fontului), pentru fontul
 * gros folosit la scoruri. Servește la alegerea unei mărimi de font care să încapă în loc:
 * `font-size = lățime disponibilă / emWidth(text)`. Nu e exactă, dar nimerește destul de bine
 * ca „150.000×” să nu intre sub poză.
 */
export function emWidth(text: string): number {
  let em = 0;
  for (const ch of text) {
    if (ch >= "0" && ch <= "9") em += 0.64;
    else if (ch === "." || ch === ",") em += 0.3;
    else em += 0.62; // „×” și alte semne
  }
  return em;
}
