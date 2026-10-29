import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";

// Geist and Geist Mono (OFL, see assets/fonts/OFL.txt) subset to Latin, Greek and the symbols the UI uses,
// which halves what every first visit downloads
export const geistSans = localFont({
  src: "../../assets/fonts/Geist-Variable-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

export const geistMono = localFont({
  src: "../../assets/fonts/GeistMono-Variable-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

// The italic accent in display headlines: one word in a serif, set against Geist
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
