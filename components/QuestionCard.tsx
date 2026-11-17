import type { ReactNode } from "react";
import Header from "./Header";

/**
 * The single large rounded card (solid colour) shared by every game screen.
 *
 * - `fit`: ecran de joc. Spațiile se strâng, iar cardul se centrează vertical în
 *   spațiul rămas, ca jocul să încapă pe ecran fără scroll. Pentru pagini de text
 *   (Despre, Confidențialitate...) rămâne varianta largă, care derulează normal.
 * - `tone`: culoarea cardului. Roșu implicit; verde pentru „Județul zilei”.
 * - `bare`: doar cardul, fără învelișul de pagină (lățime, margini), când pagina îl așază singură.
 */
export default function QuestionCard({
  headerRight,
  tone = "red",
  fit = false,
  bare = false,
  children,
}: {
  headerRight?: ReactNode;
  tone?: "red" | "green";
  fit?: boolean;
  bare?: boolean;
  children: ReactNode;
}) {
  const card = (
    <section
      className={`game-card shadow-[0_30px_60px_-25px_rgba(0,0,0,0.35)] ${
        tone === "green" ? "theme-judet" : ""
      } ${
        fit
          ? "rounded-[2rem] p-4 sm:rounded-[2.5rem] sm:p-6"
          : "rounded-[2.5rem] p-6 sm:p-12"
      }`}
    >
      <Header right={headerRight} />
      <div className={fit ? "mt-3" : "mt-6 sm:mt-8"}>{children}</div>
    </section>
  );

  if (bare) return card;

  return (
    <div
      className={`animate-rise mx-auto w-full max-w-[860px] ${
        fit ? "my-auto px-3 py-2 sm:px-4 sm:py-3" : "px-4 py-8 sm:py-14"
      }`}
    >
      {card}
    </div>
  );
}
