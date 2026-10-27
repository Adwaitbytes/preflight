import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The custom type scale in globals.css would otherwise be read as colours and merged away
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["2xs", "display", "headline", "title"] }] } },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
