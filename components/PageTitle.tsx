/** Page heading inside the card: a `// comment` label, a bold title and an optional description. */
export default function PageTitle({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70">
        {"// "}
        {label}
      </p>
      <h1 className="mt-2 text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
        {title}
        <span className="cursor-blink font-mono font-normal text-white/70">_</span>
      </h1>
      {children && <p className="mt-4 max-w-xl leading-relaxed text-muted">{children}</p>}
    </header>
  );
}
