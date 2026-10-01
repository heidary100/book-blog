import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Margins — reading notes",
    short_name: "Margins",
    description:
      "Personal notes from books worth revisiting — summaries, key ideas, and takeaways, kept in one place.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#161412",
    theme_color: "#161412",
    lang: "en",
    categories: ["books", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
