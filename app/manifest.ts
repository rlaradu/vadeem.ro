import type { MetadataRoute } from "next";

/** Makes the site installable as an app (PWA) and ready for Capacitor. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "vadeem.ro",
    short_name: "vadeem",
    description: "Jocul zilnic de estimare. Trei întrebări, zero Google.",
    start_url: "/",
    display: "standalone",
    background_color: "#e9e6dd",
    theme_color: "#d93a28",
    lang: "ro",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
