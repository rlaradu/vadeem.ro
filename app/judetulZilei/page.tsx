import type { Metadata, Viewport } from "next";
import JudetZilei from "@/components/judet/JudetZilei";

export const metadata: Metadata = {
  title: "Județul zilei – ghicește județul din România în 6 încercări",
  description:
    "Joc zilnic gratuit: ghicește județul misterios al României din 6 încercări. Indicii despre regiunea istorică, populație, vecini și distanță, plus un indiciu la întâmplare după fiecare încercare. Un județ nou în fiecare zi.",
  keywords: [
    "județul zilei",
    "ghicește județul",
    "joc județe România",
    "Worldle România",
    "joc geografie România",
    "județele României",
    "harta României joc",
    "regiunile istorice ale României",
    "joc zilnic",
  ],
  alternates: { canonical: "/judetulZilei" },
  openGraph: {
    type: "website",
    url: "/judetulZilei",
    title: "Județul zilei – ghicește județul din România în 6 încercări",
    description:
      "Un județ nou în fiecare zi. Ai 6 încercări și indicii despre regiune, populație, vecini și distanță.",
    locale: "ro_RO",
  },
};

// Bara browserului de pe telefon ia culoarea cardului verde al jocului.
export const viewport: Viewport = {
  themeColor: "#1f7a4d",
};

export default function JudetulZileiPage() {
  return (
    <>
      <JudetZilei />
      {/* Text pentru motoarele de căutare și pentru cei fără JavaScript (jocul se încarcă în browser). */}
      <noscript>
        <h1>Județul zilei: ghicește județul din România</h1>
        <p>
          Joc zilnic gratuit, în română. Ai 6 încercări să ghicești județul misterios al zilei. După fiecare
          încercare primești indicii despre regiunea istorică (Transilvania, Muntenia, Moldova, Oltenia, Banat,
          Crișana, Maramureș, Bucovina, Dobrogea), populație, vecini și distanță, plus un indiciu ales la
          întâmplare. Activează JavaScript pentru a juca.
        </p>
      </noscript>
    </>
  );
}
