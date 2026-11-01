"use client";

import { useEffect, useState } from "react";
import {
  BUCKETS,
  bucketOf,
  errorFactor,
  formatFactor,
  formatNumber,
  guessDirection,
  overallScore,
  scoreFromFactor,
} from "@/lib/scoring";
import { getClientId, type GameEntry } from "@/lib/gameStorage";
import type { DailyQuestion } from "@/lib/types";
import Countdown from "./Countdown";
import Histogram from "./Histogram";
import Icon from "./Icon";
import Pip from "./Pip";
import QuestionImage from "./QuestionImage";
import ShareButton from "./ShareButton";

interface Stats {
  buckets: number[];
  total: number; // other players who finished this day
  better: number; // of those, how many scored better
}

/** End-of-day screen: overall score, community distribution and per-question details. */
export default function Summary({
  date,
  dateLabel,
  edition,
  showCountdown = false,
  questions,
  entries,
  streak,
  maxStreak,
}: {
  date: string;
  dateLabel: string;
  edition: string;
  showCountdown?: boolean;
  questions: DailyQuestion[];
  entries: GameEntry[];
  streak: number;
  maxStreak: number;
}) {
  const byPos = new Map(entries.map((e) => [e.position, e]));
  const rows = questions
    .filter((q) => byPos.has(q.position))
    .map((q) => {
      const e = byPos.get(q.position)!;
      return {
        q,
        e,
        factor: errorFactor(e.guess, q.correct_answer),
        dir: guessDirection(e.guess, q.correct_answer),
      };
    });
  const factors = rows.map((r) => r.factor);
  const score = overallScore(factors);

  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    if (!Number.isFinite(score)) return;
    let cancelled = false;
    const params = new URLSearchParams({
      date,
      clientId: getClientId(),
      score: String(score),
    });
    fetch(`/api/stats?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => !cancelled && s && setStats(s))
      .catch(() => {}); // stats are optional: show just the player's own score
    return () => {
      cancelled = true;
    };
  }, [date, score]);

  // Add this player to the distribution locally (the server excludes them).
  const buckets = [...(stats?.buckets ?? new Array<number>(BUCKETS).fill(0))];
  buckets[bucketOf(score)]++;
  const total = (stats?.total ?? 0) + 1;
  const topPercent = Math.ceil((((stats?.better ?? 0) + 1) / total) * 100);

  return (
    <div className="animate-rise mx-auto w-full max-w-[860px] px-4 py-8 sm:py-14">
      <section className="game-card rounded-[2.5rem] p-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.35)] sm:p-12">
        <div className="flex items-center justify-between text-sm font-extrabold text-white/90 sm:text-base">
          <span>vadeem.ro</span>
          <span title={dateLabel}>No. {edition}</span>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
          <p className="animate-pop font-display text-7xl font-extrabold leading-none tracking-tight text-accent sm:text-8xl">
            {formatFactor(score)}
          </p>
          <div className="pb-2">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
              {"// eroare medie"}
            </p>
            <p className="mt-1 font-display text-lg font-bold">
              {total > 1
                ? `Top ${topPercent}% dintre jucători`
                : "Ești primul jucător azi"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
              {"// cum au jucat toți"}
            </p>
            <div className="mt-2">
              <Histogram buckets={buckets} mine={score} />
            </div>
            <div className="mt-6 flex items-center gap-6 font-mono text-xs font-bold uppercase tracking-widest text-muted">
              <span>Serie: {streak}</span>
              <span>Record: {maxStreak}</span>
            </div>
            <div className="mt-5">
              <ShareButton date={date} factors={factors} score={score} />
            </div>
            {showCountdown && (
              <div className="mt-5">
                <Countdown />
              </div>
            )}
            {showCountdown && (
              <div className="mt-5">
                <Countdown />
              </div>
            )}
          </div>

          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
              {"// întrebările"}
            </p>
            <div className="mt-3 divide-y divide-line border-y border-line">
              {rows.map(({ q, e, factor, dir }) => (
                <details key={q.id} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <QuestionImage
                      src={q.image_url}
                      seed={q.id + q.question_text}
                      alt=""
                      className="h-12 w-12 shrink-0 !rounded-xl"
                    />
                    <span className="flex-1 text-sm font-bold leading-snug">
                      {q.question_text}
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="flex items-center gap-1 font-mono text-sm font-bold">
                        <Icon
                          name={dir === "over" ? "up" : "down"}
                          className="h-3.5 w-3.5 text-muted"
                        />
                        {formatFactor(factor)}
                      </span>
                      <Pip score={scoreFromFactor(factor)} className="h-2.5 w-6" />
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2 text-sm leading-relaxed text-fg/80">
                    <p className="font-mono">
                      Răspuns: <b>{formatNumber(q.correct_answer)}</b> · Tu:{" "}
                      <b>{formatNumber(e.guess)}</b>
                    </p>
                    <p>{q.explanation_text}</p>
                    {q.source_link && (
                      <a
                        href={q.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-anim font-bold"
                      >
                        Sursă
                      </a>
                    )}
                  </div>
                </details>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              Săgeata sus = ai estimat prea mult, jos = prea puțin. Apasă o
              întrebare pentru răspuns.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
