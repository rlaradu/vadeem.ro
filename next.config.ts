import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Adresele vechi ale jocului de estimare (distribuite deja) trimit la locul nou.
  async redirects() {
    return [
      { source: "/archive", destination: "/estimareaZilei/arhiva", permanent: true },
      { source: "/archive/:date", destination: "/estimareaZilei/arhiva/:date", permanent: true },
      { source: "/leaderboard", destination: "/estimareaZilei/clasament", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
