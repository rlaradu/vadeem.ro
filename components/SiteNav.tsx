import Link from "next/link";
import { CookieSettingsButton } from "./ConsentBanner";
import ThemeToggle from "./ThemeToggle";

export const NAV_LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/estimareaZilei", label: "Estimarea zilei", short: "Estimare" },
  { href: "/judetulZilei", label: "Județul zilei", short: "Județ" },
  { href: "/ideas", label: "Idei" },
  { href: "/about", label: "Despre" },
  { href: "/privacy", label: "Confidențialitate" },
  { href: "/account", label: "Cont" },
];

// Sus: jocurile și contul. Jos: restul (pagini informative și juridice), ca subsolul să fie scurt.
const TOP_LINKS = ["/estimareaZilei", "/judetulZilei", "/ideas", "/account"];
const FOOTER_LINKS = ["/about", "/privacy"]; // „Acasă” e logo-ul din antet

/** Top bar: logo, main navigation and the theme switch, all on one row (also on phones). */
export function SiteHeader() {
  return (
    <header className="border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-[860px] items-center justify-between gap-2 px-3 py-2 sm:gap-6 sm:px-4">
        <Link
          href="/"
          className="shrink-0 font-mono text-lg font-extrabold tracking-tight transition-transform hover:scale-105 active:scale-95 sm:text-xl"
        >
          vadeem.ro<span className="cursor-blink text-code">_</span>
        </Link>
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-6">
          <nav className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-wider text-muted min-[380px]:gap-3 min-[380px]:text-[11px] sm:gap-6 sm:text-xs sm:tracking-widest">
            {NAV_LINKS.filter((l) => TOP_LINKS.includes(l.href)).map((l) => (
              <Link key={l.href} href={l.href} className="link-anim py-2">
                {"short" in l ? l.short : l.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/** Bottom bar: informative and legal links, kept to a line or two so game screens fit. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2.5 font-mono text-[10px] text-muted sm:gap-x-6 sm:px-4 sm:py-2.5 sm:text-xs">
        <nav className="flex flex-wrap gap-x-3.5 gap-y-1 uppercase sm:gap-x-5 sm:tracking-widest">
          {NAV_LINKS.filter((l) => FOOTER_LINKS.includes(l.href)).map((l) => (
            <Link key={l.href} href={l.href} className="link-anim">
              {l.label}
            </Link>
          ))}
          <CookieSettingsButton />
        </nav>
        <span className="shrink-0 whitespace-nowrap">
          <span className="hidden sm:inline">{"// "}</span>© vadeem.ro
          {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
            <>
              {" · "}
              <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="link-anim">
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
              </a>
            </>
          )}
        </span>
      </div>
    </footer>
  );
}
