import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Preflight, the Bittensor debugger",
    short_name: "Preflight",
    description: "The debugger for Bittensor. Paste an address, a transaction or an error: Preflight explains what went wrong, predicts what happens next, and warns you before it costs you TAO",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BRAND.night,
    theme_color: BRAND.night,
    categories: ["developer", "utilities"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/icon-maskable-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
