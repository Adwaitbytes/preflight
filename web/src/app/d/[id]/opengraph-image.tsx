import { OG_SIZE, renderOg } from "@/lib/og";
import { summarizeShared } from "@/lib/shared-summary";
import { getReport } from "@/lib/server-api";

export const alt = "Shared Preflight report";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = /^[A-Za-z0-9]{4,32}$/.test(id) ? await getReport(id) : null;
  if (result?.ok) return renderOg(summarizeShared(result.data));
  return renderOg({ eyebrow: "Shared report", headline: "This shared report was not found", network: "finney" });
}
