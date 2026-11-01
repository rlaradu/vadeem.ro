import type { ReactNode } from "react";
import PageTitle from "./PageTitle";
import QuestionCard from "./QuestionCard";

/** Text pages (About, Privacy) inside the game card. */
export default function Prose({
  label,
  path,
  title,
  children,
}: {
  label: string;
  path: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <QuestionCard headerRight={path}>
      <PageTitle label={label} title={title} />
      <div className="space-y-4 leading-relaxed text-white/90 [&_h2]:mt-10 [&_h2]:font-mono [&_h2]:text-xs [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-[0.2em] [&_h2]:text-white [&_h2]:before:mr-2 [&_h2]:before:text-white/50 [&_h2]:before:content-['//'] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        {children}
      </div>
    </QuestionCard>
  );
}
