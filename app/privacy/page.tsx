import type { Metadata } from "next";
import Prose from "@/components/Prose";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politica de confidențialitate – vadeem.ro",
};

export default function PrivacyPage() {
  return (
    <Prose
      label="confidențialitate"
      path="~/confidentialitate"
      title="Politica de confidențialitate"
    >
      <p>
        Ultima actualizare: {LEGAL.updated}. Această politică explică ce date
        prelucrăm când folosești vadeem.ro, de ce, cât timp le păstrăm și ce
        drepturi ai, conform Regulamentului (UE) 2016/679 (GDPR) și Legii nr.
        506/2004.
      </p>

      <h2>Cine suntem</h2>
      <p>
        Operatorul datelor este <b>{LEGAL.operatorName}</b>, cu adresa{" "}
        {LEGAL.address}
        {LEGAL.registration ? `, ${LEGAL.registration}` : ""}. Ne poți scrie la{" "}
        <b>{LEGAL.email}</b>.
      </p>

      <h2>Ce date prelucrăm</h2>
      <ul>
        <li>
          <b>Progresul în joc</b> (data, estimările tale, scorurile, seria):
          rămân în browserul tău. Se trimit la server doar estimarea, data
          întrebării și un identificator anonim generat aleatoriu în browser,
          pentru statistici („cum au jucat toți”) și clasament.
        </li>
        <li>
          <b>Cont (opțional)</b>: adresa de email, numele de utilizator ales și
          istoricul partidelor legat de cont. Numele de utilizator și scorurile
          apar public în clasament. Emailul nu este afișat.
        </li>
        <li>
          <b>Idei de întrebări</b>: textul trimis și, doar dacă le completezi,
          răspunsul, sursa și numele sau emailul tău.
        </li>
        <li>
          <b>Statistici de utilizare</b> (doar cu acordul tău): pagini vizitate,
          țară, tip de dispozitiv și browser, fără a te identifica.
        </li>
        <li>
          <b>Date tehnice</b> (adresă IP, jurnale de server): prelucrate de
          furnizorii de găzduire pentru securitate și funcționare.
        </li>
      </ul>

      <h2>De ce și pe ce bază legală</h2>
      <ul>
        <li>
          Pentru a-ți oferi jocul, statisticile și clasamentul: executarea
          serviciului cerut de tine și interesul legitim de a-l furniza
          (art. 6 alin. 1 lit. b și f GDPR).
        </li>
        <li>
          Pentru contul tău și trimiterea linkului de autentificare pe email:
          executarea serviciului (lit. b).
        </li>
        <li>
          Pentru ideile trimise: consimțământul tău (lit. a), exprimat prin
          trimiterea formularului.
        </li>
        <li>
          Pentru statisticile de utilizare: consimțământul tău (lit. a), pe care
          îl poți retrage oricând din „Setări cookie”.
        </li>
        <li>
          Pentru securitate și prevenirea abuzurilor (de exemplu limitarea
          trimiterilor repetate): interes legitim (lit. f).
        </li>
      </ul>

      <h2 id="cookie">Cookie-uri și stocare locală</h2>
      <p>
        Site-ul nu folosește cookie-uri de publicitate sau de urmărire între
        site-uri. Folosește „stocare locală” (localStorage) în browserul tău:
      </p>
      <ul>
        <li>
          <b>Necesare</b> (nu cer acord, fără ele jocul nu funcționează):
          istoricul partidelor, tema aleasă (luminos/întunecat), identificatorul
          anonim al browserului, marcajele de sincronizare, alegerea ta privind
          cookie-urile și, dacă te autentifici, sesiunea de cont (stocată de
          Supabase). Administratorul site-ului folosește și un cookie de sesiune
          securizat, care nu este setat pentru vizitatori.
        </li>
        <li>
          <b>Statistici</b> (doar cu acordul tău): GoatCounter măsoară vizitele
          în mod agregat, fără cookie-uri și fără să te urmărească între
          site-uri. Dacă alegi „Doar necesare”, nu se încarcă deloc.
        </li>
      </ul>
      <p>
        Îți poți schimba oricând alegerea din linkul „Setări cookie” din subsolul
        paginii. Poți șterge datele stocate local din setările browserului; în
        acest caz îți pierzi progresul de pe acest dispozitiv, dacă nu ai cont.
      </p>

      <h2>Cât timp păstrăm datele</h2>
      <ul>
        <li>Progresul local: până îl ștergi din browser.</li>
        <li>
          Partidele trimise la server și contul: până ștergi contul sau ne ceri
          ștergerea.
        </li>
        <li>
          Ideile de întrebări: cel mult 12 luni de la primire, sau până la
          ștergere dacă ne-o ceri.
        </li>
        <li>Datele tehnice: perioada stabilită de furnizorii de găzduire.</li>
      </ul>

      <h2>Cui transmitem datele</h2>
      <p>
        Nu vindem datele. Folosim furnizori care prelucrează date în numele
        nostru: <b>Supabase</b> (bază de date, autentificare și stocarea
        imaginilor), <b>Netlify</b> (găzduire), <b>GoatCounter</b> (statistici anonime, doar cu acordul tău) și
        furnizorul de email prin care Supabase trimite linkurile de autentificare.
        Unii furnizori pot prelucra date în afara Spațiului Economic European;
        în acest caz transferul se face pe baza clauzelor contractuale standard
        sau a altor garanții prevăzute de GDPR.
      </p>

      <h2>Drepturile tale</h2>
      <p>
        Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate
        și opoziție, precum și dreptul de a retrage consimțământul oricând, fără
        să afecteze prelucrările anterioare. Scrie-ne la <b>{LEGAL.email}</b> și
        îți răspundem în cel mult 30 de zile. Poți depune o plângere la{" "}
        <a
          href="https://www.dataprotection.ro"
          target="_blank"
          rel="noopener noreferrer"
          className="link-anim font-bold"
        >
          Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter
          Personal (ANSPDCP)
        </a>
        .
      </p>

      <h2>Minori</h2>
      <p>
        Site-ul nu se adresează copiilor sub 16 ani. Dacă ai sub 16 ani, nu crea
        un cont și nu trimite date personale fără acordul părinților.
      </p>

      <h2>Modificări</h2>
      <p>
        Putem actualiza această politică. Data ultimei actualizări este
        afișată la început.
      </p>
    </Prose>
  );
}
