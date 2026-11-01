import type { ReactNode } from "react";
import Header from "./Header";

/** The single large rounded card (solid colour) shared by every game screen. */
export default function QuestionCard({
  headerRight,
  children,
}: {
  headerRight?: string;
  children: ReactNode;
}) {
  return (
    <div className="animate-rise mx-auto w-full max-w-[860px] px-4 py-8 sm:py-14">
      <section className="game-card rounded-[2.5rem] p-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.35)] sm:p-12">
        <Header right={headerRight} />
        <div className="mt-6 sm:mt-8">{children}</div>
      </section>
    </div>
  );
}
