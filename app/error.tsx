"use client";

import QuestionCard from "@/components/QuestionCard";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <QuestionCard headerRight="~/eroare">
      <div className="py-6 sm:py-10">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          {"// ceva n-a mers"}
        </p>
        <h1 className="mt-2 text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">
          Hopa, o eroare.
        </h1>
        <p className="mt-4 text-white/80">Încearcă din nou. Progresul tău e salvat.</p>
        <button onClick={reset} className="btn btn-card mt-8">
          Reîncearcă
        </button>
      </div>
    </QuestionCard>
  );
}
