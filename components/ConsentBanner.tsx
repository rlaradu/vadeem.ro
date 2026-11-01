"use client";

import Link from "next/link";
import Script from "next/script";
import { resetConsent, setConsent, useConsent } from "@/lib/consent";

// GoatCounter site code (the part before .goatcounter.com). Empty = no statistics at all.
const GOATCOUNTER = process.env.NEXT_PUBLIC_GOATCOUNTER;

/** Cookie banner, plus the analytics script which only loads after "Accept toate". */
export default function ConsentBanner() {
  const consent = useConsent();

  return (
    <>
      {consent === "all" && GOATCOUNTER && (
        <Script
          src="https://gc.zgo.at/count.js"
          data-goatcounter={`https://${GOATCOUNTER}.goatcounter.com/count`}
          strategy="afterInteractive"
        />
      )}

      {consent === "unset" && (
        <div
          role="dialog"
          aria-label="Cookie-uri și stocare locală"
          className="game-card animate-rise fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-[2rem] p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] sm:p-6"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            {"// cookie-uri"}
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Folosim stocare locală pentru ca jocul să funcționeze (progres, temă,
            cont). Cu acordul tău, folosim și statistici anonime, fără cookie-uri
            de publicitate. Detalii în{" "}
            <Link href="/privacy#cookie" className="link-anim font-bold">
              politica de confidențialitate
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => setConsent("all")} className="btn btn-card flex-1 !py-3">
              Accept toate
            </button>
            <button onClick={() => setConsent("necessary")} className="btn btn-ghost flex-1 !py-3">
              Doar necesare
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer link that reopens the banner. */
export function CookieSettingsButton() {
  return (
    <button onClick={resetConsent} className="link-anim uppercase tracking-widest">
      Setări cookie
    </button>
  );
}
