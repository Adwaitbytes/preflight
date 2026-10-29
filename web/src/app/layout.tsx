import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Analytics } from "@/components/site/analytics";
import { AppStateProvider } from "@/components/site/app-state";
import { LazyCommandPalette } from "@/components/site/command-palette-loader";
import { OfflineBanner } from "@/components/site/offline-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeProvider } from "@/components/site/theme-provider";
import { BRAND } from "@/lib/brand";
import { isOffline } from "@/lib/server-api";
import { siteUrl } from "@/lib/site";
import { geistMono, geistSans, instrumentSerif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: "Preflight, the Bittensor debugger", template: "%s | Preflight" },
  applicationName: "Preflight",
  openGraph: { siteName: "Preflight", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  appleWebApp: { title: "Preflight", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false, address: false, email: false },
  description:
    "Paste a hotkey, a transaction or a netuid. Preflight tells you why your miner earns zero, and lets you test a transaction before you spend a single rao",
};

// The site opens dark whatever the OS prefers, so the browser chrome starts dark too; ThemeProvider follows the toggle
export const viewport: Viewport = {
  themeColor: BRAND.night,
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Offline mode is a deploy time switch for the stage demo, so read it per request, not at build
  await connection();
  const offline = isOffline();
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <ThemeProvider>
          <AppStateProvider offline={offline}>
            {offline && <OfflineBanner />}
            <SiteHeader />
            {/* At least a screen tall, so the footer never sits in the first viewport while a page streams in */}
            <main id="main" className="flex min-h-[calc(100svh-3.5rem)] min-w-0 flex-1 flex-col">
              {children}
            </main>
            <SiteFooter />
            <LazyCommandPalette />
            <Analytics />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
