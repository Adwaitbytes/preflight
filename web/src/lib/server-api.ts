import "server-only";

import { headers } from "next/headers";
import { createHttpApi, type PreflightApi } from "./api";
import { offlineApi } from "./offline";

/** `PREFLIGHT_OFFLINE=1` serves recorded finney fixtures, for a stage demo without Wi Fi */
export function isOffline(): boolean {
  return process.env.PREFLIGHT_OFFLINE === "1";
}

async function sameOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("127.") || host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function getApi(): Promise<PreflightApi> {
  if (isOffline()) return offlineApi;
  const configured = process.env.PREFLIGHT_API_URL?.trim();
  return createHttpApi({ baseUrl: configured || (await sameOrigin()) });
}
