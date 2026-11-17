import type { Metadata } from "next";
import Link from "next/link";
import GameStatus, { type GameId } from "@/components/GameStatus";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import QuestionCard from "@/components/QuestionCard";

// Titlul și descrierea principale vin din layout; aici doar adresa canonică a paginii principale.
export const metadata: Metadata = { alternates: { canonical: "/" } };

const GAMES: readonly {
  id: GameId;
  href: string;
  tag: string;
  title: string;
  blurb: string;
  /** Culoarea cardului jocului: fiecare joc își păstrează culoarea și în meniu. */
  surface: string;
  /** Culoarea textului din insigna „Jucat azi” (culoarea cardului jocului). */
  accent: string;
  isNew?: boolean;
}[] = [
  {
    id: "estimare",
    href: "/estimareaZilei",
    tag: "3 întrebări",
    title: "Estimarea zilei",
    blurb: "Trei întrebări, zero Google. Estimează și vezi de câte ori ai greșit.",
    surface: "bg-black/20 hover:bg-black/30",
    accent: "#d93a28",
  },
  {
    id: "judet",
    href: "/judetulZilei",
    tag: "6 încercări",
    title: "Județul zilei",
    blurb: "Ghicește județul misterios din 6 încercări, cu indicii și o hartă.",
    surface: "bg-[#1f7a4d] hover:brightness-110",
    accent: "#1f7a4d",
    isNew: true,
  },
];

/** Pagina principală: toate jocurile zilei, cu starea fiecăruia pentru jucător. */
export default function Home() {
  return (
    <QuestionCard fit headerRight="~/jocuri">
      <PageTitle tight label="jocuri zilnice" title="Alege jocul zilei">
        Câte un joc nou în fiecare zi. Fără Google.
      </PageTitle>

      {/* Pe telefon cardurile stau unul sub altul; pe ecrane late, alăturate (încap mai ușor pe ecran). */}
      <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
        {GAMES.map((game) => (
          <li key={game.id} className="flex">
            <Link
              href={game.href}
              className={`group relative flex w-full flex-col rounded-3xl p-3 transition duration-300 hover:-translate-y-1 active:scale-[0.99] min-[380px]:p-3.5 sm:p-6 ${game.surface}`}
              style={{ "--game": game.accent } as React.CSSProperties}
            >
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                {"// "}
                {game.tag}
              </p>
              {/* Insigna stă în colț, ca să nu schimbe înălțimea rândului (titlurile rămân aliniate). */}
              {game.isNew && (
                <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--game)] sm:right-5 sm:top-5">
                  nou
                </span>
              )}
              <h2 className="font-display mt-1.5 text-3xl font-black leading-[0.98] tracking-tight sm:mt-2 sm:text-4xl">
                {game.title}
              </h2>
              <p className="mt-1.5 max-w-md text-[13px] leading-snug text-white/85 sm:mt-3 sm:text-base sm:leading-relaxed">
                {game.blurb}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 sm:mt-auto sm:pt-4">
                <GameStatus game={game.id} />
                <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest">
                  Joacă
                  <Icon
                    name="arrow"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </QuestionCard>
  );
}
