/**
 * The Preflight mark, drawn once and shared by the header, the icons and the Open Graph cards.
 *
 * A P written as one flight path: it rolls along the runway (the foot), lifts off (the stem),
 * turns (the bowl) and stops at a checkpoint (the node) before it closes the loop. The gap
 * between node and stem is the "pre": the check happens before the commitment.
 *
 * Drawn on a 24 unit grid with a 2 unit stroke so every straight edge lands on a whole pixel at 24 px.
 */
export const MARK_VIEWBOX = "0 0 24 24";
export const MARK_PATH = "M4 20h4V4h6a5 5 0 0 1 0 10";
export const MARK_STROKE = 2;
export const MARK_NODE = { cx: 13, cy: 14, r: 2.5 } as const;

/** Optical size for 24 px and below: no runway foot, a heavier stroke, edges on whole pixels at 24 and 48 */
export const MARK_SMALL_PATH = "M7.5 18.5V5.5H12a4.5 4.5 0 0 1 0 9";
export const MARK_SMALL_STROKE = 3;
export const MARK_SMALL_NODE = { cx: 12.75, cy: 14.5, r: 2.25 } as const;

/** Fixed brand colours for places without CSS variables: icons, manifest, Satori */
export const BRAND = {
  ink: "#121316",
  night: "#0a0b0d",
  paper: "#f7f7f8",
  white: "#ffffff",
  accent: "#1f6feb",
  accentOnDark: "#6aa8ff",
} as const;
