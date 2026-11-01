import Link from "next/link";
import QuestionCard from "@/components/QuestionCard";

export default function NotFound() {
  return (
    <QuestionCard headerRight="~/404">
      <div className="py-6 sm:py-10">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          {"// eroare 404"}
        </p>
        <h1 className="mt-2 text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">
          Estimare greșită.
          <span className="mt-1 block text-white/70">Pagina nu există.</span>
        </h1>
        <Link href="/" className="btn btn-card mt-8">
          Înapoi acasă
        </Link>
      </div>
    </QuestionCard>
  );
}
