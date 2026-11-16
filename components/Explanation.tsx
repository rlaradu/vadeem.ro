/**
 * Question explanation. A line like "Label ..... value" becomes a row with a
 * dotted leader; anything else is a normal paragraph. Rows wrap on narrow
 * screens instead of overflowing.
 */
export default function Explanation({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="space-y-2 text-sm leading-relaxed text-white/90 sm:text-base">
      {text.split("\n").map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        const parts = trimmed.split(/\.{3,}/);
        if (parts.length < 2) {
          return (
            <p key={idx} className="break-words">
              {trimmed}
            </p>
          );
        }

        const label = parts[0].replace(/^-\s*/, "").trim();
        const value = parts.slice(1).join("").trim();
        return (
          <div key={idx} className="flex flex-wrap items-baseline gap-x-2 font-mono">
            <span className="min-w-0 break-words">{label}</span>
            <span
              aria-hidden="true"
              className="hidden min-w-6 grow border-b border-dotted border-white/40 sm:block"
            />
            <span className="ml-auto font-bold sm:ml-0">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
