import { bucketOf } from "@/lib/scoring";

/** Log-scale histogram (1x..1000x) of everyone's score with a "TU" marker. */
export default function Histogram({
  buckets,
  mine,
}: {
  buckets: number[];
  mine: number;
}) {
  const max = Math.max(...buckets, 1);
  const mineBucket = bucketOf(mine);

  return (
    <div>
      <div className="relative flex h-32 items-end gap-[3px] pt-9">
        {buckets.map((count, i) => (
          <div key={i} className="relative flex h-full flex-1 items-end">
            {i === mineBucket && (
              <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-md bg-fg px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-bg">
                TU
              </span>
            )}
            <div
              className={`animate-grow w-full rounded-t-[3px] ${
                i === mineBucket ? "bg-accent" : "bg-accent/25"
              }`}
              style={{
                height: `${Math.max((count / max) * 100, 5)}%`,
                animationDelay: `${i * 25}ms`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="relative mt-2 h-4 font-mono text-[11px] font-bold text-muted">
        {[0, 1, 2, 3].map((decade) => (
          <span
            key={decade}
            className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
            style={{ left: `${(decade / 3) * 100}%` }}
          >
            {(10 ** decade).toLocaleString("ro-RO")}×
          </span>
        ))}
      </div>
    </div>
  );
}
