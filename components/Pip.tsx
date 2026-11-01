import type { Score } from "@/lib/scoring";

const COLOR: Record<Score, string> = {
  green: "bg-good",
  yellow: "bg-mid",
  red: "bg-bad",
};

/** Small rounded square showing how close a guess was (empty = not answered yet). */
export default function Pip({
  score,
  className = "h-3.5 w-3.5",
}: {
  score?: Score;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-[5px] ${className} ${
        score ? COLOR[score] : "border-2 border-line"
      }`}
    />
  );
}
