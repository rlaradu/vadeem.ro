import type { Metadata } from "next";
import AccountPanel from "@/components/AccountPanel";
import PageTitle from "@/components/PageTitle";
import QuestionCard from "@/components/QuestionCard";

export const metadata: Metadata = { title: "Cont – vadeem.ro" };

export default function AccountPage() {
  return (
    <QuestionCard headerRight="~/cont">
      <PageTitle label="cont" title="Contul tău" />
      <AccountPanel />
    </QuestionCard>
  );
}