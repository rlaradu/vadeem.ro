import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vadeem.ro";

// Jocurile se schimbă zilnic; restul paginilor rar. Pagina de cont nu se indexează.
const PAGES: { path: string; changeFrequency: "daily" | "weekly" | "monthly" | "yearly"; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/judetulZilei", changeFrequency: "daily", priority: 0.9 },
  { path: "/estimareaZilei", changeFrequency: "daily", priority: 0.9 },
  { path: "/estimareaZilei/arhiva", changeFrequency: "daily", priority: 0.6 },
  { path: "/estimareaZilei/clasament", changeFrequency: "daily", priority: 0.5 },
  { path: "/about", changeFrequency: "monthly", priority: 0.4 },
  { path: "/ideas", changeFrequency: "monthly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
