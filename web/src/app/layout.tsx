import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { AppStateProvider } from "@/components/site/app-state";
import { CommandPalette } from "@/components/site/command-palette";
import { OfflineBanner } from "@/components/site/offline-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeProvider } from "@/components/site/theme-provider";
import { isOffline } from "@/lib/server-api";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Preflight, the Bittensor debugger", template: "%s | Preflight" },
  description:
    "Paste a hotkey, a transaction or a netuid. Preflight tells you why your miner earns zero, and lets you test a transaction before you spend a single rao",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Offline mode is a deploy time switch for the stage demo, so read it per request, not at build
  await connection();
  const offline = isOffline();
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <ThemeProvider>
          <AppStateProvider offline={offline}>
            {offline && <OfflineBanner />}
            <SiteHeader />
            <main id="main" className="flex min-w-0 flex-1 flex-col">
              {children}
            </main>
            <SiteFooter />
            <CommandPalette />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
