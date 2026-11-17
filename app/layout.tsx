import type { Metadata, Viewport } from "next";
import ConsentBanner from "@/components/ConsentBanner";
import { Courier_Prime, Inter } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteNav";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"], // latin-ext covers ă â î ș ț
});

// Typewriter-style monospace used for body text, labels, buttons and numbers.
const code = Courier_Prime({
  variable: "--font-code",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vadeem.ro";

const SITE_TITLE = "vadeem.ro – jocuri zilnice românești: Județul zilei și Estimarea zilei";
const SITE_DESCRIPTION =
  "Jocuri zilnice gratuite în română, fără Google: ghicește județul zilei din 6 încercări (ca Worldle, dar pentru România) și estimează răspunsuri la întrebări Fermi. Fără cont, câte un joc nou în fiecare zi.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: SITE_TITLE, template: "%s | vadeem.ro" },
  description: SITE_DESCRIPTION,
  applicationName: "vadeem.ro",
  keywords: [
    "jocuri zilnice",
    "joc zilnic românesc",
    "județul zilei",
    "ghicește județul",
    "joc județe România",
    "Worldle România",
    "joc geografie România",
    "harta României joc",
    "județele României",
    "estimarea zilei",
    "întrebări Fermi",
    "joc de estimare",
    "joc de logică",
    "joc de cultură generală",
    "jocuri online gratis",
    "joc zilnic gratis",
    "vadeem",
  ],
  authors: [{ name: "vadeem.ro", url: SITE }],
  creator: "vadeem.ro",
  publisher: "vadeem.ro",
  category: "games",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { email: false, address: false, telephone: false },
  // Verificare Google Search Console / Bing: pune codul în .env (opțional).
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "vadeem.ro",
    locale: "ro_RO",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
};

// Date structurate (JSON-LD): site-ul și cele două jocuri, pentru rezultate îmbogățite în Google.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "vadeem.ro",
      description: SITE_DESCRIPTION,
      inLanguage: "ro-RO",
    },
    {
      "@type": "Game",
      "@id": `${SITE}/judetulZilei#game`,
      url: `${SITE}/judetulZilei`,
      name: "Județul zilei",
      description:
        "Ghicește județul misterios din 6 încercări, cu indicii despre regiunea istorică, populație, vecini și distanță. Un județ nou în fiecare zi.",
      inLanguage: "ro-RO",
      genre: "geografie",
      gamePlatform: "Web",
      isAccessibleForFree: true,
      publisher: { "@id": `${SITE}/#website` },
    },
    {
      "@type": "Game",
      "@id": `${SITE}/estimareaZilei#game`,
      url: `${SITE}/estimareaZilei`,
      name: "Estimarea zilei",
      description:
        "Trei întrebări Fermi în fiecare zi: estimează răspunsul fără Google și vezi de câte ori ai greșit.",
      inLanguage: "ro-RO",
      genre: "estimare, logică",
      gamePlatform: "Web",
      isAccessibleForFree: true,
      publisher: { "@id": `${SITE}/#website` },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#d93a28",
};

// Runs before first paint so the saved/system theme is applied without a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      suppressHydrationWarning
      className={`${body.variable} ${code.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="flex min-h-dvh flex-col font-mono antialiased">
        <SiteHeader />
        {/* Coloană flex: cardurile de joc se centrează vertical în spațiul rămas (my-auto). */}
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
