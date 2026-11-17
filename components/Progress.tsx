import type { Score } from "@/lib/scoring";
import Pip from "./Pip";

/** Segmented Q1 Q2 Q3 progress: a pip per question, the current one underlined. */
export default function Progress({
  total,
  scores,
  current,
}: {
  total: number;
  scores: Record<number, Score | undefined>; // by position
  current?: number;
}) {
  return (
    <div className="mb-2.5 flex items-end gap-2 sm:mb-4 sm:gap-3">
      {Array.from({ length: total }, (_, i) => i + 1).map((pos) => (
        <div key={pos} className="flex-1">
          <div
            className={`h-1 rounded-full transition-colors ${
              pos === current ? "bg-accent" : scores[pos] ? "bg-fg/30" : "bg-line"
            }`}
          />
          <div
            className={`mt-1 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest sm:mt-2 sm:gap-2 sm:text-xs ${
              pos === current ? "text-accent" : "text-muted"
            }`}
          >
            Q{pos}
            <Pip score={scores[pos]} className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
