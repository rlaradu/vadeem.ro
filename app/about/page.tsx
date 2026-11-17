import type { Metadata } from "next";
import Prose from "@/components/Prose";

export const metadata: Metadata = {
  title: "Despre vadeem.ro – jocuri zilnice românești",
  description:
    "Despre vadeem.ro: o platformă de jocuri zilnice gratuite în română, fără Google. Cum se joacă Județul zilei și Estimarea zilei, surse și credite.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Prose label="despre" path="~/despre" title="Despre vadeem.ro">
      <p>
        vadeem.ro este o platformă de jocuri zilnice, fără Google. Deocamdată
        sunt două: <b>Estimarea zilei</b> (trei întrebări la care nu ai cum să
        știi răspunsul exact) și <b>Județul zilei</b> (ghicești un județ pe
        baza unor indicii).
      </p>

      <h2>Credite</h2>
      <p>
        Întregul concept al acestui mini-joc de estimare și layout-ul general pornesc de la platforma originală fermi.gg (creată de echipa lui Joshua Comeau și comunitatea de acolo). Ne-a plăcut atât de mult modul în care transformă problemele Fermi într-o experiență modernă de browser, încât am vrut să aducem un format similar și pentru publicul din România, adaptat la contextul și cultura locală.
      </p>

      <h2>Estimarea zilei: cum se joacă</h2>
      <ul>
        <li>Trei întrebări noi în fiecare zi.</li>
        <li>Scrii un număr (poți folosi și notația științifică, ex. 2.5e6).</li>
        <li>
          Pentru fiecare întrebare vezi de câte ori ai greșit (ex. 2,99×).
          1× înseamnă exact. Scorul zilei este media geometrică a celor trei
          erori: cu cât e mai mic, cu atât mai bine.
        </li>
        <li>Distribui rezultatul</li>
      </ul>

      <h2>fără Google</h2>
      <p>
        Regula de aur: nu ai voie să cauți răspunsul pe internet. Gândește-te,
        împarte problema în bucăți, estimează fiecare bucată și înmulțește.
        Distracția stă în raționament, nu în căutare.
      </p>

      <h2>Județul zilei: cum se joacă</h2>
      <ul>
        <li>Un județ misterios în fiecare zi, iar tu ai 6 încercări să-l ghicești.</li>
        <li>
          După fiecare încercare primești indicii: regiunea istorică (Transilvania,
          Muntenia, Moldova etc.), populația (mai mulți sau mai puțini locuitori),
          dacă se învecinează cu el și distanța. În plus, aplicația alege la
          întâmplare un indiciu despre județul căutat, care se adaugă în caseta de indicii.
        </li>
        <li>
          Scrii numele județului (merge și fără diacritice). Harta arată doar ce ai încercat până acum:
          nu se poate atinge, iar la final se dezvăluie județul căutat.
        </li>
        <li>Jocul e inspirat de jocurile de tip Worldle, adaptat pentru România.</li>
      </ul>

      <h2>Surse</h2>
      <p>
        Populația județelor: INS, recensământul din 2021. Harta: geoBoundaries
        (World Bank), licență CC BY 4.0.
      </p>

      <h2>DISCLAIMER</h2>
      <p>
        Numele platformei este o referință pur umoristică la cultura generală și la stilul inconfundabil în care regretatul Corneliu Vadim Tudor opera cu cifre, date și statistici în spațiul public. vadeem.ro nu susține, nu promovează și nu are nicio legătură cu ideologiile politice sau convingerile acestuia. Exact cum fermi.gg folosește numele fizicianului Enrico Fermi ca o emblemă pentru estimări științifice, la fel și aici totul este tratat strict ca un meme cultural și un omagiu adus formatului de jocuri de browser.
      </p>
    </Prose>
  );
}
