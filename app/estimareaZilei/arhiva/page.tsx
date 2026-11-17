import type { Metadata } from "next";
import ArchiveList from "@/components/ArchiveList";
import PageTitle from "@/components/PageTitle";
import QuestionCard from "@/components/QuestionCard";

export const metadata: Metadata = {
  title: "Arhiva Estimării zilei – întrebări Fermi din zilele trecute",
  description: "Joacă întrebările Fermi din zilele trecute pe care le-ai ratat. Nu contează pentru serie.",
  alternates: { canonical: "/estimareaZilei/arhiva" },
};

export default function ArchivePage() {
  return (
    <QuestionCard headerRight="~/arhiva">
      <PageTitle label="arhivă" title="Zilele trecute">
        Joacă întrebările pe care le-ai ratat. Nu contează pentru serie.
      </PageTitle>
      <ArchiveList />
    </QuestionCard>
  );
}