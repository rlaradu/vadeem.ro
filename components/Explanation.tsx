/**
 * Question explanation. A line like "Label ..... value" becomes a row with a
 * dotted leader; anything else is a normal paragraph. Rows wrap on narrow
 * screens instead of overflowing.
 */
export default function Explanation({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="space-y-1 text-[13px] leading-snug text-white/90 sm:space-y-2 sm:text-sm">
      {text.split("\n").map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

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
        // Pe telefon eticheta și valoarea curg într-un singur paragraf („etichetă: valoare”), ca să nu
        // ocupe câte 3 rânduri; pe ecrane late rămâne rândul cu puncte de legătură.
        return (
          <div key={idx} className="font-mono sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-2">
            <span className="min-w-0 break-words">{label}</span>
            <span aria-hidden="true" className="sm:hidden">
              :
            </span>
            <span
              aria-hidden="true"
              className="hidden min-w-6 grow border-b border-dotted border-white/40 sm:block"
            />
            <span className="ml-1.5 font-bold sm:ml-0">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
