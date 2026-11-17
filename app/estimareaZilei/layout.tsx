import { Suspense } from "react";
import GameTabs, { GameTabsFallback } from "@/components/GameTabs";

const TABS = [
  { href: "/estimareaZilei", label: "Azi" },
  { href: "/estimareaZilei/arhiva", label: "Arhivă" },
  { href: "/estimareaZilei/clasament", label: "Clasament" },
] as const;

export default function EstimareaZileiLayout({ children }: LayoutProps<"/estimareaZilei">) {
  return (
    <>
      <Suspense fallback={<GameTabsFallback tabs={TABS} />}>
        <GameTabs tabs={TABS} />
      </Suspense>
      {children}
    </>
  );
}
