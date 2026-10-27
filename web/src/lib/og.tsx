import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { MARK_NODE, MARK_PATH, MARK_STROKE, MARK_VIEWBOX } from "./brand";
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
  accentSoft: "rgba(106,168,255,0.12)",
  critical: "#ff7b72",
  medium: "#e8c35a",
  healthy: "#56d68a",
  neutral: "#a3a7b1",
};

export interface OgCard {
  eyebrow: string;
  headline: string;
  /** One supporting line under the headline */
  detail?: string;
  badge?: { label: string; tone: OgTone };
  network: string;
  subject?: string;
  block?: number;
}

async function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [semibold, regular, mono] = await Promise.all([
    readFile(join(dir, "Geist-SemiBold-og.ttf")),
    readFile(join(dir, "Geist-Regular-og.ttf")),
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

// Layout constants: 1200 x 630 with 72 px side margins; the footer sits on a runway line at RUNWAY_Y
const PAD_X = 72;
const RUNWAY_Y = 528;
const NODE_X = OG_SIZE.width - PAD_X;

export async function renderOg(card: OgCard): Promise<ImageResponse> {
  const headline = clip(card.headline, 150);
  const size = headline.length > 100 ? 52 : headline.length > 60 ? 62 : 76;
  const tone = card.badge ? C[card.badge.tone] : C.neutral;
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: C.bg, padding: `60px ${PAD_X}px 0`, fontFamily: "Geist", position: "relative" }}>
        {/* The brand path: a dashed runway under the content, a checkpoint at its end, then the climb out */}
        <svg width={OG_SIZE.width} height={OG_SIZE.height} viewBox={`0 0 ${OG_SIZE.width} ${OG_SIZE.height}`} fill="none" style={{ position: "absolute", top: 0, left: 0 }}>
          <path d={`M${PAD_X} ${RUNWAY_Y}H${NODE_X - 22}`} stroke={C.line} strokeWidth="2" strokeDasharray="14 10" />
          <path d={`M${NODE_X} ${RUNWAY_Y}C${NODE_X + 40} ${RUNWAY_Y} ${NODE_X + 62} ${RUNWAY_Y - 30} ${NODE_X + 90} ${RUNWAY_Y - 110}`} stroke={C.accent} strokeOpacity="0.6" strokeWidth="2" />
          <circle cx={NODE_X} cy={RUNWAY_Y} r="16" fill={C.accentSoft} stroke={C.accent} strokeOpacity="0.4" strokeWidth="1.5" />
          <circle cx={NODE_X} cy={RUNWAY_Y} r="6" fill={C.accent} />
        </svg>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="44" height="44" viewBox={MARK_VIEWBOX} fill="none">
              <path d={MARK_PATH} stroke={C.fg} strokeWidth={MARK_STROKE} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={MARK_NODE.cx} cy={MARK_NODE.cy} r={MARK_NODE.r} fill={C.accent} />
            </svg>
            <div style={{ fontSize: 32, fontWeight: 600, color: C.fg, letterSpacing: -0.9 }}>Preflight</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 999, border: `1px solid ${C.line}`, color: C.muted, fontSize: 22 }}>
            <div style={{ width: 9, height: 9, borderRadius: 9, background: card.network === "finney" ? C.healthy : C.medium }} />
            {card.network.charAt(0).toUpperCase() + card.network.slice(1)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: RUNWAY_Y - 60 - 44, paddingBottom: 12 }}>
          <div style={{ fontFamily: "Geist Mono", fontSize: 20, letterSpacing: 2, color: C.faint, textTransform: "uppercase" }}>{card.eyebrow}</div>
          <div style={{ marginTop: 20, fontSize: size, lineHeight: 1.06, fontWeight: 600, color: C.fg, letterSpacing: -size * 0.032, textWrap: "balance", maxWidth: OG_SIZE.width - 2 * PAD_X }}>{headline}</div>
          {card.detail && <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.35, color: C.muted, maxWidth: 940 }}>{clip(card.detail, 120)}</div>}
        </div>

        <div style={{ position: "absolute", left: PAD_X, right: PAD_X + 40, top: RUNWAY_Y + 26, display: "flex", alignItems: "center", gap: 18 }}>
          {card.badge && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 999, border: `1px solid ${tone}55`, background: `${tone}1a`, color: tone, fontSize: 24, fontWeight: 600 }}>
              <div style={{ width: 9, height: 9, borderRadius: 9, background: tone }} />
              {card.badge.label}
            </div>
          )}
          {card.subject && <div style={{ fontFamily: "Geist Mono", fontSize: 22, color: C.muted }}>{card.subject}</div>}
          {card.block != null && <div style={{ marginLeft: "auto", fontFamily: "Geist Mono", fontSize: 22, color: C.faint }}>{`block ${formatInt(card.block)}`}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
