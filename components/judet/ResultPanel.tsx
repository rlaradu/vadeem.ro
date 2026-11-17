import { REGIUNI } from "@/lib/judet/data";
import { buildShareText } from "@/lib/judet/logic";
import type { GuessResult, Judet } from "@/lib/judet/types";
import Countdown from "../Countdown";
import CopyTextButton from "../CopyTextButton";
import { GuessRecap } from "./GuessList";

/**
 * Finalul jocului, sub numele județului (care apare în locul titlului): câteva date despre
 * el, seria, recapitularea încercărilor, butonul de distribuire și cronometrul.
 * Totul e strâns, ca și ecranul de final să încapă fără scroll.
 */
export default function ResultPanel({
  target,
  results,
  won,
  edition,
  stats,
}: {
  target: Judet;
  results: readonly GuessResult[];
  won: boolean;
  edition: string;
  stats: { streak: number; maxStreak: number; played: number; wins: number };
}) {
  return (
    <section className="animate-rise space-y-2.5 sm:space-y-3" aria-label="Rezultatul zilei">
      <p className="text-[11px] font-bold leading-snug text-white/85 sm:text-xs">
        {REGIUNI[target.region]} · {target.population.toLocaleString("ro-RO")} locuitori ·{" "}
        {target.areaKm2.toLocaleString("ro-RO")} km² ·{" "}
        {target.seat ? `reședința ${target.seat}` : "capitala României"}
      </p>

      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-white/80 sm:text-xs">
        Serie: {stats.streak} · Record: {stats.maxStreak} · Victorii: {stats.wins}/{stats.played}
      </p>

      <GuessRecap results={results} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <CopyTextButton
          text={buildShareText(edition, [...results], won)}
          className="btn btn-card !py-3"
        />
        <Countdown label="// județ nou în " />
      </div>
    </section>
  );
}
