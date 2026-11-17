"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import {
  errorFactor,
  scoreFromFactor,
  scoreGuess,
  type Score,
} from "@/lib/scoring";
import { editionNumber } from "@/lib/edition";
import { useGameState } from "@/lib/useGameState";
import type { DailyQuestion } from "@/lib/types";
import Icon from "./Icon";
import InputForm from "./InputForm";
import Polaroid from "./Polaroid";
import Progress from "./Progress";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import Summary from "./Summary";

type Load =
  | { status: "loading" }
  | { status: "ready"; questions: DailyQuestion[] }
  | { status: "empty" }
  | { status: "error"; message: string };

/** Romanian long date, e.g. "1 noiembrie 2026". */
export function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Clasa de mărime a titlului după lungimea întrebării (vezi `.q-title` în globals.css). */
function titleLength(text: string): "s" | "m" | "l" {
  return text.length <= 55 ? "s" : text.length <= 110 ? "m" : "l";
}

/**
 * The game. Without `date` it plays today's questions; with `date` (archive)
 * it plays that past day's questions, which never affect streaks.
 */
export default function Game({ date: archiveDate }: { date?: string }) {
  const { dayEntries, streak, maxStreak, ready, today, recordPlay } =
    useGameState(archiveDate);
  const [load, setLoad] = useState<Load>(
    isSupabaseConfigured
      ? { status: "loading" }
      : {
          status: "error",
          message:
            "Baza de date nu este configurată. Completează .env.local și repornește serverul.",
        },
  );
  const [started, setStarted] = useState(false);
  // Position of the question whose result is being shown right after answering.
  const [reviewing, setReviewing] = useState<number | null>(null);

  const date = archiveDate ?? today;
  // Archive dates must be strictly in the past (local date).
  const notAvailable = Boolean(archiveDate && today && archiveDate >= today);

  // Fetch the day's questions (publish_date = local date), Q1..Q3.
  useEffect(() => {
    if (!supabase || !date || notAvailable) return;
    let cancelled = false;
    supabase
      .from("daily_questions")
      .select("*")
      .eq("publish_date", date)
      .order("position")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error)
          setLoad({
            status: "error",
            message: "Nu am putut încărca întrebările. Încearcă din nou.",
          });
        else if (!data?.length) setLoad({ status: "empty" });
        else setLoad({ status: "ready", questions: data as DailyQuestion[] });
      });
    return () => {
      cancelled = true;
    };
  }, [date, notAvailable]);

  if (notAvailable) {
    return (
      <QuestionCard fit>
        <p className="py-12 text-center text-xl font-bold">
          Această zi nu este disponibilă încă.
        </p>
      </QuestionCard>
    );
  }

  if (load.status === "loading" || !ready) {
    return (
      <QuestionCard fit>
        <p className="py-16 text-center font-mono text-sm uppercase tracking-widest text-muted">
          Se încarcă…
        </p>
      </QuestionCard>
    );
  }

  if (load.status === "error") {
    return (
      <QuestionCard fit>
        <p className="py-12 text-center text-xl font-bold">{load.message}</p>
      </QuestionCard>
    );
  }

  const headerRight = `No. ${editionNumber(date)}`;

  if (load.status === "empty") {
    return (
      <QuestionCard fit headerRight={headerRight}>
        <h1 className="py-10 text-center text-3xl font-black sm:text-4xl">
          {archiveDate
            ? "Nu există întrebări pentru ziua asta."
            : "Nicio întrebare pentru azi."}
          {!archiveDate && <span className="mt-2 block">Revino mâine!</span>}
        </h1>
      </QuestionCard>
    );
  }

  const { questions } = load;
  const entryByPos = new Map(dayEntries.map((e) => [e.position, e]));
  // Colours are derived from the real answer, not from what was stored.
  const scores: Record<number, Score | undefined> = {};
  for (const q of questions) {
    const e = entryByPos.get(q.position);
    if (e) scores[q.position] = scoreFromFactor(errorFactor(e.guess, q.correct_answer));
  }
  const next = questions.find((q) => !entryByPos.has(q.position));

  // Result of the question that was just answered, with a "next" button.
  if (reviewing !== null) {
    const q = questions.find((x) => x.position === reviewing);
    const e = entryByPos.get(reviewing);
    if (q && e) {
      return (
        <QuestionCard fit headerRight={headerRight}>
          <Progress total={questions.length} scores={scores} current={q.position} />
          <ResultCard
            key={q.id}
            question={q}
            guess={e.guess}
            action={
              <button
                onClick={() => setReviewing(null)}
                className="btn btn-card w-full !py-3.5 !text-sm sm:w-auto sm:!px-8"
              >
                {next ? "Următoarea" : "Vezi rezumatul"}
                <Icon name="arrow" className="icon-nudge h-4 w-4" />
              </button>
            }
          />
        </QuestionCard>
      );
    }
  }

  // Every question of the day answered -> summary.
  if (!next) {
    return (
      <Summary
        date={date}
        dateLabel={prettyDate(date)}
        edition={editionNumber(date)}
        showCountdown={!archiveDate}
        questions={questions}
        entries={dayEntries}
        streak={streak}
        maxStreak={maxStreak}
      />
    );
  }

  // Landing screen (only if nothing has been answered yet that day).
  if (!started && dayEntries.length === 0) {
    return (
      <QuestionCard fit headerRight={headerRight}>
        <div className="relative overflow-hidden py-2 sm:py-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-8 select-none font-display text-[12rem] font-extrabold leading-none text-accent-soft sm:-top-10 sm:text-[16rem]"
          >
            ≈
          </span>
          <div className="relative">
            <h1 className="text-[clamp(2.6rem,12vw,3.6rem)] font-black leading-[0.95] tracking-tight sm:text-[clamp(3rem,11dvh,5rem)]">
              Trei întrebări.

            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:mt-5 sm:text-lg">
              Estimează răspunsul și vezi de câte ori ai greșit. Cu cât scorul
              e mai aproape de 1×, cu atât ești mai aproape de adevăr.
            </p>
            <p className="mt-3 text-base text-muted sm:text-lg">
              {"//credits: fermi.gg"}
            </p>
            {archiveDate ? (
              <p className="mt-3 text-sm text-muted">
                Jocurile din arhivă nu contează pentru serie.{" "}
                <Link href="/estimareaZilei/arhiva" className="link-anim font-bold">
                  Înapoi la arhivă
                </Link>
              </p>
            ) : (
              streak > 0 && (
                <p className="mt-3 font-mono text-xs font-bold uppercase tracking-widest text-muted">
                  Serie: {streak}
                </p>
              )
            )}
            <button onClick={() => setStarted(true)} className="btn btn-card mt-5 sm:mt-6">
              Începe
              <Icon name="arrow" className="icon-nudge h-4 w-4" />
            </button>
          </div>
        </div>
      </QuestionCard>
    );
  }

  // Current question + input.
  return (
    <QuestionCard fit headerRight={headerRight}>
      <Progress total={questions.length} scores={scores} current={next.position} />
      <div key={next.id} className="animate-rise">
        <div>
          <Polaroid
            src={next.image_url}
            seed={next.id + next.question_text}
            alt={next.question_text}
            className="float-right mb-2 ml-3 w-[var(--polaroid-w)] sm:ml-6"
          />
          <h1 className="q-title" data-len={titleLength(next.question_text)}>
            {next.question_text}
          </h1>
          <div className="clear-both" />
        </div>
        <div className="mt-3 sm:mt-4">
          <InputForm
            unit={next.unit}
            onSubmit={(guess) => {
              recordPlay(next.position, guess, scoreGuess(guess, next.correct_answer), date);
              setReviewing(next.position);
            }}
          />
        </div>
      </div>
    </QuestionCard>
  );
}
