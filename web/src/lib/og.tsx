import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatInt } from "./format";

export const OG_SIZE = { width: 1200, height: 630 };

export type OgTone = "critical" | "medium" | "healthy" | "neutral";

// The dark theme tokens from globals.css; Satori has no CSS variables
const C = {
  bg: "#0a0b0d",
  surface: "#111215",
  line: "rgba(235,238,245,0.09)",
  fg: "#ededf0",
  muted: "#a3a7b1",
  faint: "#868b96",
  accent: "#6aa8ff",
  critical: "#ff7b72",
  medium: "#e8c35a",
  healthy: "#56d68a",
  neutral: "#a3a7b1",
};

export interface OgCard {
  eyebrow: string;
  headline: string;
  badge?: { label: string; tone: OgTone };
  network: string;
  subject?: string;
  block?: number;
}

async function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [semibold, regular, mono] = await Promise.all([
    readFile(join(dir, "Geist-SemiBold.ttf")),
    readFile(join(dir, "Geist-Regular.ttf")),
    readFile(join(dir, "GeistMono-Medium.ttf")),
  ]);
  return [
    { name: "Geist", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ];
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 3).trimEnd()}...`;
}

export async function renderOg(card: OgCard): Promise<ImageResponse> {
  const headline = clip(card.headline, 150);
  const size = headline.length > 100 ? 52 : headline.length > 60 ? 62 : 72;
  const tone = card.badge ? C[card.badge.tone] : C.neutral;
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: C.bg, padding: "64px 72px", fontFamily: "Geist" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", width: 44, height: 44, borderRadius: 12, background: C.fg, alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M6.5 12.5l3.2 3.2L17.5 7.5" stroke={C.bg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, color: C.fg, letterSpacing: -0.6 }}>Preflight</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 999, border: `1px solid ${C.line}`, color: C.muted, fontSize: 22 }}>
            <div style={{ width: 9, height: 9, borderRadius: 9, background: card.network === "finney" ? C.healthy : C.medium }} />
            {card.network.charAt(0).toUpperCase() + card.network.slice(1)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 64, flexGrow: 1 }}>
          <div style={{ fontFamily: "Geist Mono", fontSize: 20, letterSpacing: 2, color: C.faint, textTransform: "uppercase" }}>{card.eyebrow}</div>
          <div style={{ marginTop: 22, fontSize: size, lineHeight: 1.08, fontWeight: 600, color: C.fg, letterSpacing: -size * 0.03, maxWidth: 1000 }}>{headline}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, borderTop: `1px solid ${C.line}`, paddingTop: 28 }}>
          {card.badge && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 999, border: `1px solid ${tone}55`, background: `${tone}1a`, color: tone, fontSize: 24, fontWeight: 600 }}>
              <div style={{ width: 9, height: 9, borderRadius: 9, background: tone }} />
              {card.badge.label}
            </div>
          )}
          {card.subject && <div style={{ fontFamily: "Geist Mono", fontSize: 22, color: C.muted }}>{card.subject}</div>}
          {card.block != null && <div style={{ marginLeft: "auto", fontFamily: "Geist Mono", fontSize: 22, color: C.faint }}>block {formatInt(card.block)}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
