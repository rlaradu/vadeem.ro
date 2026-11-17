import type { CSSProperties, ReactNode } from "react";
import QuestionImage from "./QuestionImage";

/**
 * Floating polaroid: white frame, slightly tilted. Holds the question picture or, with
 * `children`, any other content (the map in „Județul zilei”). `caption` is written in
 * the thick strip at the bottom, like on a real instant photo.
 */
export default function Polaroid({
  src,
  seed = "",
  alt = "",
  className = "",
  tilt = 5,
  caption,
  children,
}: {
  src?: string | null;
  seed?: string;
  alt?: string;
  className?: string;
  /** Înclinarea în grade (pozitiv = spre dreapta). */
  tilt?: number;
  caption?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <figure
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      className={`animate-pop relative rotate-[var(--tilt)] bg-white p-1.5 pb-5 shadow-[0_20px_35px_-14px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:rotate-0 hover:scale-105 sm:p-2.5 sm:pb-8 ${className}`}
    >
      {children ?? (
        <QuestionImage
          src={src}
          seed={seed}
          alt={alt}
          className="aspect-square !rounded-none"
        />
      )}
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 flex h-5 items-center justify-center font-mono text-[9px] font-bold uppercase tracking-widest text-[#5c5348] sm:h-8 sm:text-[11px]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
