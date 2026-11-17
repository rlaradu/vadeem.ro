/** Page heading inside the card: a `// comment` label, a bold title and an optional description. */
export default function PageTitle({
  label,
  title,
  tight = false,
  children,
}: {
  label: string;
  title: string;
  /** Varianta strânsă, pentru ecrane care trebuie să încapă fără scroll. */
  tight?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <header className={tight ? "mb-3 sm:mb-5" : "mb-8"}>
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70">
        {"// "}
        {label}
      </p>
      <h1
        className={`mt-2 font-black leading-[1.02] tracking-tight ${
          tight ? "text-3xl sm:text-5xl" : "text-4xl sm:text-6xl"
        }`}
      >
        {title}
        <span className="cursor-blink font-mono font-normal text-white/70">_</span>
      </h1>
      {children && (
        <p className={`max-w-xl leading-relaxed text-muted ${tight ? "mt-2 text-sm sm:mt-3 sm:text-base" : "mt-4"}`}>
          {children}
        </p>
      )}
    </header>
  );
}
