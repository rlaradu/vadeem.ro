import type { CSSProperties, ReactNode } from "react";
import { emWidth } from "@/lib/emWidth";
import {
  errorFactor,
  formatFactor,
  formatNumber,
  guessDirection,
  scoreFromFactor,
} from "@/lib/scoring";
import type { DailyQuestion } from "@/lib/types";
import Explanation from "./Explanation";
import Icon from "./Icon";
import Pip from "./Pip";
import Polaroid from "./Polaroid";

/**
 * Result of a single question. Same structure as the question screen: the
 * polaroid stays small on the right, the score sits on the left. `action` is the
 * "next" button: under everything on a phone, next to the numbers on wide screens
 * (see .result-grid in globals.css), so the whole result fits on one screen.
 */
export default function ResultCard({
  question,
  guess,
  action,
}: {
  question: DailyQuestion;
  guess: number;
  action?: ReactNode;
}) {
  const factor = errorFactor(guess, question.correct_answer);
  const dir = guessDirection(guess, question.correct_answer);
  const exact = factor < 1.005;

  // Scorul e cât de mare permite ecranul, dar nu mai lat decât coloana din stânga (altfel ar intra sub poză).
  const scoreText = formatFactor(factor);
  const scoreStyle = {
    fontSize: `min(var(--score-size), calc(var(--score-col) / ${emWidth(scoreText).toFixed(2)}))`,
  } satisfies CSSProperties;

  return (
    <div className="result-grid animate-rise">
      <div className="result-top">
        {/* Pe telefon întrebarea stă pe toată lățimea, deasupra scorului (mai puține rânduri); pe ecrane late, lângă poză. */}
        <p className="mb-1.5 text-xs font-bold leading-snug tracking-tight sm:hidden">
          {question.question_text}
        </p>

        <div className="flex items-start justify-between gap-3 sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="hidden text-base font-bold leading-snug tracking-tight sm:block">
              {question.question_text}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-bold uppercase text-white/70 sm:mt-3 sm:text-xs">
              <span className="tracking-[0.2em]">{"// scor"}</span>
              <span className="flex items-center gap-2 tracking-widest text-white/85">
                <Pip score={scoreFromFactor(factor)} className="h-3.5 w-3.5" />
                {exact ? (
                  "exact"
                ) : (
                  <span className="flex items-center gap-1">
                    <Icon name={dir === "over" ? "up" : "down"} className="h-3.5 w-3.5" />
                    {dir === "over" ? "prea mult" : "prea puțin"}
                  </span>
                )}
              </span>
            </div>
            <div
              style={scoreStyle}
              className="animate-pop mt-1 whitespace-nowrap font-display font-black leading-none tracking-tight"
            >
              {scoreText}
            </div>
          </div>

          <Polaroid
            src={question.image_url}
            seed={question.id + question.question_text}
            alt={question.question_text}
            // Pe telefon poza e mai mică aici decât la întrebare: altfel e mai înaltă decât scorul și lasă un gol.
            className="mt-1 w-[min(22vw,5.5rem)] shrink-0 sm:w-[var(--polaroid-w)]"
          />
        </div>
      </div>

      <dl className="result-tiles grid grid-cols-[auto_minmax(0,1fr)] gap-2 sm:grid-cols-2 sm:gap-3">
        <div className="rounded-2xl bg-black/20 px-3 py-1.5 sm:px-4 sm:py-2.5">
          <dt className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/70 sm:text-[11px]">
            Estimarea ta
          </dt>
          <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 font-mono text-base font-bold [overflow-wrap:anywhere] sm:text-xl">
            {formatNumber(guess)}
            {question.unit && (
              <span className="text-[10px] font-bold uppercase text-white/70 sm:text-xs">
                {question.unit}
              </span>
            )}
          </dd>
        </div>
        <div className="rounded-2xl bg-white px-3 py-1.5 text-[var(--card)] sm:px-4 sm:py-2.5">
          <dt className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-70 sm:text-[11px]">
            Răspuns corect
          </dt>
          <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 font-mono text-base font-bold [overflow-wrap:anywhere] sm:text-xl">
            {formatNumber(question.correct_answer)}
            {question.unit && (
              <span className="text-[10px] font-bold uppercase opacity-70 sm:text-xs">
                {question.unit}
              </span>
            )}
          </dd>
        </div>
      </dl>

      {/* Explicația: dacă e neobișnuit de lungă, derulează în interiorul ei, nu în toată pagina. */}
      <div className="result-explain max-h-[19dvh] overflow-y-auto pr-1">
        <Explanation text={question.explanation_text} />
        {question.source_link && (
          <a
            href={question.source_link}
            target="_blank"
            rel="noopener noreferrer"
            className="link-anim mt-2 inline-block text-xs font-bold sm:text-sm"
          >
            Sursă
          </a>
        )}
      </div>

      {action && <div className="result-action">{action}</div>}
    </div>
  );
}
