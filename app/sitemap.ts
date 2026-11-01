import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vadeem.ro";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/archive", "/leaderboard", "/ideas", "/about", "/privacy"].map((path) => ({
    url: `${SITE}${path}`,
  }));
}
