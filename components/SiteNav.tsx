import Link from "next/link";
import { CookieSettingsButton } from "./ConsentBanner";
import ThemeToggle from "./ThemeToggle";

export const NAV_LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/archive", label: "Arhivă" },
  { href: "/leaderboard", label: "Clasament" },
  { href: "/ideas", label: "Idei" },
  { href: "/about", label: "Despre" },
  { href: "/privacy", label: "Confidențialitate" },
  { href: "/account", label: "Cont" },
];

const TOP_LINKS = ["/archive", "/leaderboard", "/ideas", "/account"];

/** Top bar: logo, main navigation and the theme switch. */
export function SiteHeader() {
  return (
    <header className="border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link
          href="/"
          className="font-mono text-xl font-extrabold tracking-tight transition-transform hover:scale-105 active:scale-95"
        >
          vadeem.ro<span className="cursor-blink text-code">_</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="flex gap-4 font-mono text-[11px] uppercase tracking-widest text-muted sm:gap-6 sm:text-xs">
            {NAV_LINKS.filter((l) => TOP_LINKS.includes(l.href)).map((l) => (
              <Link key={l.href} href={l.href} className="link-anim">
                {l.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/** Bottom bar: all links, including legal pages. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[860px] flex-col gap-3 px-4 py-6 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 uppercase tracking-widest">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="link-anim">
              {l.label}
            </Link>
          ))}
          <CookieSettingsButton />
        </nav>
        <span>
          {"// "}© vadeem.ro
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
