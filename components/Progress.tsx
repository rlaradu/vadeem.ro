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
    <div className="mb-6 flex items-end gap-3">
      {Array.from({ length: total }, (_, i) => i + 1).map((pos) => (
        <div key={pos} className="flex-1">
          <div
            className={`h-1 rounded-full transition-colors ${
              pos === current ? "bg-accent" : scores[pos] ? "bg-fg/30" : "bg-line"
            }`}
          />
          <div
            className={`mt-2 flex items-center gap-2 font-mono text-xs font-bold tracking-widest ${
              pos === current ? "text-accent" : "text-muted"
            }`}
          >
            Q{pos}
            <Pip score={scores[pos]} className="h-3 w-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
