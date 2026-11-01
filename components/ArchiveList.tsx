"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { entriesForDate } from "@/lib/gameStorage";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { useGameState } from "@/lib/useGameState";
import Icon from "./Icon";
import { prettyDate } from "./Game";
import QuestionImage from "./QuestionImage";

interface Row {
  id: string;
  publish_date: string;
  position: number;
  question_text: string;
  image_url: string | null;
}

type Load =
  | { status: "loading" }
  | { status: "ready"; days: [string, Row[]][] }
  | { status: "error"; message: string };

/** Past days (before today's local date), newest first, with played status. */
export default function ArchiveList() {
  const { history, today, ready } = useGameState();
  const [load, setLoad] = useState<Load>(
    isSupabaseConfigured
      ? { status: "loading" }
      : { status: "error", message: "Baza de date nu este configurată." },
  );

  useEffect(() => {
    if (!supabase || !today) return;
    let cancelled = false;
    supabase
      .from("daily_questions")
      .select("id, publish_date, position, question_text, image_url")
      .lt("publish_date", today)
      .order("publish_date", { ascending: false })
      .order("position")
      .limit(300)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setLoad({ status: "error", message: "Nu am putut încărca arhiva." });
          return;
        }
        const byDate = new Map<string, Row[]>();
        for (const r of (data ?? []) as Row[]) {
          byDate.set(r.publish_date, [...(byDate.get(r.publish_date) ?? []), r]);
        }
        setLoad({ status: "ready", days: [...byDate.entries()] });
      });
    return () => {
      cancelled = true;
    };
  }, [today]);

  if (load.status === "loading" || !ready) {
    return (
      <p className="py-10 text-center font-mono text-sm uppercase tracking-widest text-muted">
        Se încarcă…
      </p>
    );
  }
  if (load.status === "error") {
    return <p className="py-10 text-center font-bold">{load.message}</p>;
  }
  if (load.days.length === 0) {
    return (
      <p className="py-10 text-center text-muted">
        Nu există încă întrebări în arhivă.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {load.days.map(([date, questions], i) => {
        const played = entriesForDate(history, date).length;
        const done = played >= questions.length;
        return (
          <li key={date} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
            <Link
              href={`/archive/${date}`}
              className="group block rounded-3xl border border-line bg-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_20px_40px_-25px_var(--accent)] active:scale-[0.99] sm:p-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex shrink-0 -space-x-3">
                  {questions.map((q) => (
                    <QuestionImage
                      key={q.id}
                      src={q.image_url}
                      seed={q.id + q.question_text}
                      alt=""
                      className="h-14 w-14 !rounded-2xl border-2 border-surface"
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold">{prettyDate(date)}</p>
                  <p className="truncate text-sm text-muted">
                    {questions.map((q) => q.question_text).join(" · ")}
                  </p>
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest ${
                    done
                      ? "bg-accent text-accent-fg"
                      : played > 0
                        ? "border border-accent text-accent"
                        : "border border-line text-muted"
                  }`}
                >
                  {done ? (
                    <>
                      Jucat <Icon name="check" className="h-3 w-3" />
                    </>
                  ) : played > 0 ? (
                    `${played}/${questions.length}`
                  ) : (
                    "Joacă"
                  )}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
