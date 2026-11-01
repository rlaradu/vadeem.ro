import type { Metadata } from "next";
import LeaderboardTable from "@/components/LeaderboardTable";
import PageTitle from "@/components/PageTitle";
import QuestionCard from "@/components/QuestionCard";

export const metadata: Metadata = { title: "Clasament – vadeem.ro" };

export default function LeaderboardPage() {
  return (
    <QuestionCard headerRight="~/clasament">
      <PageTitle label="clasament" title="Cei mai aproape de adevăr">
        Scorul este media geometrică a erorilor tale (mai mic = mai bun; 1× =
        exact). Apar doar jucătorii cu cont și cel puțin 3 întrebări jucate.
      </PageTitle>
      <LeaderboardTable />
    </QuestionCard>
  );
}