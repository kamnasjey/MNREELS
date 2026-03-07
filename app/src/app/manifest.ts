import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MNREELS — Монголын богино кино",
    short_name: "MNREELS",
    description:
      "Монголын анхны богино хэмжээний кино платформ. Swipe хийж, шилдэг бүтээгчдийн кино үзээрэй.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    categories: ["entertainment", "video"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
