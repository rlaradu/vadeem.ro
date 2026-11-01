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

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "vadeem.ro – estimarea zilei",
  description: "Un joc zilnic de estimare. Trei întrebări, zero Google.",
  openGraph: {
    type: "website",
    siteName: "vadeem.ro",
    locale: "ro_RO",
    title: "vadeem.ro – estimarea zilei",
    description: "Un joc zilnic de estimare. Trei întrebări, zero Google.",
  },
  twitter: { card: "summary_large_image" },
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
      </head>
      <body className="flex min-h-full flex-col font-mono antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
