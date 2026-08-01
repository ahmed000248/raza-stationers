import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Raza Stationers",
    short_name: "Raza Stationers",
    description: "Wholesale and retail stationery catalogue and ordering.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F9F6",
    theme_color: "#051F20",
    icons: [{ src: "/brand-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  }
}
