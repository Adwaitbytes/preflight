/** The directory's capability filters, in the order the brief lists them */
export const CAPABILITIES = [
  { id: "inference", label: "Inference" },
  { id: "data", label: "Data" },
  { id: "3d", label: "3D" },
  { id: "video", label: "Video" },
  { id: "voice", label: "Voice" },
  { id: "agents", label: "Agents" },
  { id: "compute", label: "Compute" },
  { id: "prediction", label: "Prediction" },
] as const;

export type CapabilityId = (typeof CAPABILITIES)[number]["id"];

export function capabilityLabel(id: string): string {
  return CAPABILITIES.find((c) => c.id === id.toLowerCase())?.label ?? id.charAt(0).toUpperCase() + id.slice(1);
}

export function hasPublicApi(api: string | null | undefined): boolean {
  return !!api && api !== "none";
}
