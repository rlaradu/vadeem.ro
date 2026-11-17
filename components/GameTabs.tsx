"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

function TabLinks({ tabs, pathname }: { tabs: readonly Tab[]; pathname: string }) {
  const base = tabs[0].href;

  return (
    <nav
      aria-label="Secțiunile jocului"
      className="mx-auto flex w-full max-w-[860px] flex-wrap gap-2 px-3 pt-2 font-mono text-[10px] font-bold uppercase tracking-widest sm:px-4 sm:pt-3 sm:text-xs"
    >
      {tabs.map((tab) => {
        // Prima filă (jocul de azi) e activă doar pe adresa ei exactă.
        const active = tab.href === base ? pathname === base : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full border px-3.5 py-1 transition duration-200 hover:-translate-y-0.5 active:scale-95 sm:px-4 sm:py-1.5 ${
              active
                ? "border-accent bg-accent text-accent-fg"
                : "border-line text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mică navigare între paginile unui joc (Azi / Arhivă / Clasament), cu fila curentă evidențiată. */
export default function GameTabs({ tabs }: { tabs: readonly Tab[] }) {
  // Adresa curentă se știe abia la cerere, deci folosirea ei cere un <Suspense> în jur.
  const pathname = usePathname();
  return <TabLinks tabs={tabs} pathname={pathname} />;
}

/** Același meniu, fără fila activă: apare imediat, până se află adresa curentă. */
export function GameTabsFallback({ tabs }: { tabs: readonly Tab[] }) {
  return <TabLinks tabs={tabs} pathname="" />;
}
