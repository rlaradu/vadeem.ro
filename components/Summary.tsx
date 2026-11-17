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
import { emWidth } from "@/lib/emWidth";
import { getClientId, type GameEntry } from "@/lib/gameStorage";
import type { DailyQuestion } from "@/lib/types";
import Countdown from "./Countdown";
import Explanation from "./Explanation";
import Histogram from "./Histogram";
import Icon from "./Icon";
import Pip from "./Pip";
import QuestionCard from "./QuestionCard";
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
    <QuestionCard fit headerRight={<span title={dateLabel}>No. {edition}</span>}>
      <div className="flex items-end gap-x-4 sm:gap-x-5">
        <p
          style={{
            // cât de mare permite ecranul, dar lăsăm loc (~9rem) pentru textul din dreapta
            fontSize: `min(var(--score-size), calc((var(--card-inner) - 9rem) / ${emWidth(formatFactor(score)).toFixed(2)}))`,
          }}
          className="animate-pop whitespace-nowrap font-display font-extrabold leading-none tracking-tight text-accent"
        >
          {formatFactor(score)}
        </p>
        <div className="min-w-0 pb-0.5 sm:pb-2">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted sm:text-xs">
            {"// eroare medie"}
          </p>
          <p className="mt-0.5 font-display text-sm font-bold leading-tight sm:text-lg">
            {total > 1
              ? `Top ${topPercent}% dintre jucători`
              : "Ești primul jucător azi"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:mt-4 md:grid-cols-[1.1fr_1fr] md:gap-8">
        <div>
          <div className="flex items-baseline justify-between gap-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
            <p>{"// cum au jucat toți"}</p>
            <p className="whitespace-nowrap">
              Serie: {streak} · Record: {maxStreak}
            </p>
          </div>
          <div className="mt-1">
            <Histogram buckets={buckets} mine={score} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 sm:mt-4">
            <ShareButton date={date} factors={factors} score={score} />
            {showCountdown && <Countdown />}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            <p>{"// întrebările"}</p>
            <p className="flex items-center gap-2.5 font-normal normal-case tracking-normal">
              <span className="flex items-center gap-1">
                <Icon name="up" className="h-3 w-3" /> prea mult
              </span>
              <span className="flex items-center gap-1">
                <Icon name="down" className="h-3 w-3" /> prea puțin
              </span>
            </p>
          </div>
          <div className="mt-1.5 divide-y divide-line border-y border-line">
            {rows.map(({ q, e, factor, dir }) => (
              <details key={q.id} className="group py-1 sm:py-1.5">
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <QuestionImage
                    src={q.image_url}
                    seed={q.id + q.question_text}
                    alt=""
                    className="h-8 w-8 shrink-0 !rounded-lg sm:h-11 sm:w-11"
                  />
                  <span className="line-clamp-2 min-w-0 flex-1 break-words text-xs font-bold leading-snug sm:text-sm">
                    {q.question_text}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="flex items-center gap-1 font-mono text-xs font-bold sm:text-sm">
                      <Icon
                        name={dir === "over" ? "up" : "down"}
                        className="h-3.5 w-3.5 text-muted"
                      />
                      {formatFactor(factor)}
                    </span>
                    <Pip score={scoreFromFactor(factor)} className="h-2 w-6" />
                  </span>
                </summary>
                <div className="mt-2 space-y-2 text-sm leading-relaxed">
                  <p className="break-words font-mono">
                    {q.question_text}
                  </p>
                  <p className="break-words font-mono">
                    Răspuns: <b>{formatNumber(q.correct_answer)}</b> · Tu:{" "}
                    <b>{formatNumber(e.guess)}</b>
                  </p>
                  <Explanation text={q.explanation_text} />
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
          <p className="mt-1.5 hidden text-[11px] text-muted sm:block">
            Apasă o întrebare pentru răspuns și explicație.
          </p>
        </div>
      </div>
    </QuestionCard>
  );
}
