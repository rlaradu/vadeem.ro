import type { Metadata } from "next";
import IdeaForm from "@/components/IdeaForm";
import PageTitle from "@/components/PageTitle";
import QuestionCard from "@/components/QuestionCard";

export const metadata: Metadata = {
  title: "Trimite o idee de întrebare sau de joc",
  description: "Ai o idee de întrebare Fermi sau de joc zilnic nou? Trimite-o către vadeem.ro.",
  alternates: { canonical: "/ideas" },
};

export default function IdeasPage() {
  return (
    <QuestionCard headerRight="~/idei">
      <PageTitle label="idei" title="Trimite o întrebare">
        Ai în cap o întrebare bună de estimare? Trimite-o! Cele mai bune
        întrebări au un răspuns care se poate verifica și un număr mare, greu
        de ghicit din prima.
      </PageTitle>
      <IdeaForm />
    </QuestionCard>
  );
}
