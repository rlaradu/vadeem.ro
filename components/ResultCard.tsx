import {
  errorFactor,
  formatFactor,
  formatNumber,
  guessDirection,
  scoreFromFactor,
} from "@/lib/scoring";
import type { DailyQuestion } from "@/lib/types";
import Icon from "./Icon";
import Pip from "./Pip";
import Polaroid from "./Polaroid";

/**
 * Result of a single question. Same structure as the question screen: the
 * polaroid stays small on the right, the score sits on the left.
 */
export default function ResultCard({
  question,
  guess,
}: {
  question: DailyQuestion;
  guess: number;
}) {
  const factor = errorFactor(guess, question.correct_answer);
  const dir = guessDirection(guess, question.correct_answer);
  const exact = factor < 1.005;

  // Funcție care procesează textul explicației și formatează liniile cu puncte
  const renderExplanation = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Detectăm rândurile care conțin puncte de aliniere (3 sau mai multe puncte consecutive)
      const parts = trimmed.split(/\.{3,}/);

      if (parts.length >= 2) {
        // Curățăm eventualul simbol de listă (ex: "- ") de la începutul etichetei
        const label = parts[0].replace(/^-\s*/, "").trim();
        const value = parts.slice(1).join("").trim();

        return (
          <div key={idx} className="flex items-baseline justify-between my-1.5 text-xs sm:text-sm md:text-base font-mono">
            <span className="shrink-0 pr-2 text-white/90">{label}</span>
            <span className="mx-2 grow border-b border-dotted border-white/30"></span>
            <span className="shrink-0 pl-2 text-white font-semibold text-right">{value}</span>
          </div>
        );
      } else {
        // Pentru paragrafele normale (fără puncte, ex: concluzia de la final)
        return (
          <p key={idx} className="mt-3 leading-relaxed text-white/90 text-sm md:text-base">
            {trimmed}
          </p>
        );
      }
    });
  };

  return (
    <div className="animate-rise">
      <div className="flex items-start justify-between gap-4 sm:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-xl font-black leading-tight tracking-tight sm:text-3xl">
            {question.question_text}
          </p>

          <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            {"// scor"}
          </p>
          <div className="animate-pop mt-1 font-display text-6xl font-black leading-none tracking-tight sm:text-8xl">
            {formatFactor(factor)}
          </div>
          <div className="mt-3 flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest text-white/80">
            <Pip score={scoreFromFactor(factor)} className="h-4 w-4" />
            {exact ? (
              "exact"
            ) : (
              <span className="flex items-center gap-1">
                <Icon name={dir === "over" ? "up" : "down"} className="h-3.5 w-3.5" />
                {dir === "over" ? "prea mult" : "prea puțin"}
              </span>
            )}
          </div>
        </div>

        <Polaroid
          src={question.image_url}
          seed={question.id + question.question_text}
          alt={question.question_text}
          className="mt-1 w-28 shrink-0 sm:w-52"
        />
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-black/20 p-4">
          <dt className="font-mono text-[11px] font-bold uppercase tracking-widest text-white/70">
            Estimarea ta
          </dt>
          <dd className="mt-1 break-words font-mono text-xl font-bold sm:text-2xl">
            {formatNumber(guess)}
            {question.unit && (
              <span className="ml-2 text-xs font-bold uppercase text-white/70">
                {question.unit}
              </span>
            )}
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-4 text-[var(--card)]">
          <dt className="font-mono text-[11px] font-bold uppercase tracking-widest opacity-70">
            Răspuns corect
          </dt>
          <dd className="mt-1 break-words font-mono text-xl font-bold sm:text-2xl">
            {formatNumber(question.correct_answer)}
            {question.unit && (
              <span className="ml-2 text-xs font-bold uppercase opacity-70">
                {question.unit}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        {renderExplanation(question.explanation_text)}
      </div>

      {question.source_link && (
        <a
          href={question.source_link}
          target="_blank"
          rel="noopener noreferrer"
          className="link-anim mt-4 inline-block text-sm font-bold"
        >
          Sursă
        </a>
      )}
    </div>
  );
}