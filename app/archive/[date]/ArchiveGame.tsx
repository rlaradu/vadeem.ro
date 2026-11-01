"use client";

import { use } from "react";
import Game from "@/components/Game";
import QuestionCard from "@/components/QuestionCard";

export default function ArchiveGame({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <QuestionCard>
        <p className="py-12 text-center text-xl font-bold">Dată invalidă.</p>
      </QuestionCard>
    );
  }
  return <Game date={date} />;
}
