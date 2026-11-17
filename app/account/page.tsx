import type { Metadata } from "next";
import AccountPanel from "@/components/AccountPanel";
import PageTitle from "@/components/PageTitle";
import QuestionCard from "@/components/QuestionCard";

// Pagina de cont nu are ce căuta în Google.
export const metadata: Metadata = { title: "Cont", robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <QuestionCard headerRight="~/cont">
      <PageTitle label="cont" title="Contul tău" />
      <AccountPanel />
    </QuestionCard>
  );
}