/** The public origin, used for metadataBase, canonical links, robots.txt and the sitemap */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(vercel ? `https://${vercel}` : "http://localhost:3000");
}

/** Pages worth indexing. Per hotkey, transaction and shared report pages are reached by link, not by crawl */
export const INDEXED_ROUTES = ["/", "/live", "/weather", "/bot", "/guide", "/sim", "/subnets", "/plan", "/explain", "/changelog", "/house"] as const;
