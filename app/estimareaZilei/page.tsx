import type { Metadata } from "next";
import Game from "@/components/Game";

export const metadata: Metadata = {
  title: "Estimarea zilei – 3 întrebări Fermi, fără Google",
  description:
    "Joc zilnic gratuit de estimare: trei întrebări Fermi în fiecare zi. Estimează răspunsul fără să cauți pe Google și vezi de câte ori ai greșit. Scor, clasament și arhivă.",
  keywords: [
    "estimarea zilei",
    "întrebări Fermi",
    "joc de estimare",
    "estimări Fermi",
    "joc de logică",
    "cultură generală",
    "joc zilnic",
  ],
  alternates: { canonical: "/estimareaZilei" },
  openGraph: {
    type: "website",
    url: "/estimareaZilei",
    title: "Estimarea zilei – 3 întrebări Fermi, fără Google",
    description: "Trei întrebări pe zi. Estimează răspunsul și vezi de câte ori ai greșit.",
    locale: "ro_RO",
  },
};

export default function EstimareaZileiPage() {
  return (
    <>
      <Game />
      <noscript>
        <h1>Estimarea zilei: întrebări Fermi în română</h1>
        <p>
          Joc zilnic gratuit. Primești trei întrebări Fermi în fiecare zi (de exemplu „câți afinați...?”),
          estimezi răspunsul fără să cauți pe Google, iar scorul arată de câte ori ai greșit. Activează
          JavaScript pentru a juca.
        </p>
      </noscript>
    </>
  );
}
