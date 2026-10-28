import type { MetadataRoute } from "next";
import { INDEXED_ROUTES, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return INDEXED_ROUTES.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: path === "/live" ? "always" : path === "/" || path === "/subnets" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
