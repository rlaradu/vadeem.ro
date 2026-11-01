/** Top row of the card: three small dots + site name left, edition number / path right. */
export default function Header({ right }: { right?: string }) {
  return (
    <div className="flex items-center justify-between font-mono text-xs font-bold text-white/90 sm:text-sm">
      <span className="flex items-center gap-3">
        <span className="flex gap-1" aria-hidden="true">
          <i className="h-2 w-2 rounded-full bg-white/60" />
          <i className="h-2 w-2 rounded-full bg-white/40" />
          <i className="h-2 w-2 rounded-full bg-white/25" />
        </span>
        vadeem.ro
      </span>
      {right && <span>{right}</span>}
    </div>
  );
}
