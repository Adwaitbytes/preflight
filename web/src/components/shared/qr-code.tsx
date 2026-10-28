import { encode } from "uqr";
import { cn } from "@/lib/utils";

/**
 * A QR code drawn as one SVG path on the server: no client JavaScript, crisp at any print size.
 * Dark modules on a light tile in both themes, since phone cameras read dark on light best.
 */
export function QrCode({ value, label, className }: { value: string; label: string; className?: string }) {
  const { data, size } = encode(value, { ecc: "M", border: 2 });
  const path = data
    .flatMap((row, y) => row.flatMap((dark, x) => (dark ? [`M${x} ${y}h1v1h-1z`] : [])))
    .join("");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges" className={cn("rounded-lg bg-[#fbfbfc]", className)}>
      <path d={path} fill="#121316" />
    </svg>
  );
}
