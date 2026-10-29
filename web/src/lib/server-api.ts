import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { createHttpApi, type PreflightApi } from "./api";
import type { NetworkId } from "./networks";
import { offlineApi } from "./offline";

/** `PREFLIGHT_OFFLINE=1` serves recorded finney fixtures, for a stage demo without Wi Fi */
export function isOffline(): boolean {
  return process.env.PREFLIGHT_OFFLINE === "1";
}

export async function sameOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("127.") || host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function getApi(): Promise<PreflightApi> {
  if (isOffline()) return offlineApi;
  const configured = process.env.PREFLIGHT_API_URL?.trim();
  return createHttpApi({ baseUrl: configured || (await sameOrigin()), client: "site" });
}

// One read per request: generateMetadata and the page share the same chain read
export const getDoctor = cache(async (network: NetworkId, hotkey: string, netuid: number | null, fresh = false) =>
  (await getApi()).doctor(network, hotkey, { netuid, fresh }),
);
export const getTx = cache(async (network: NetworkId, ref: string) => (await getApi()).tx(network, ref));
export const getReport = cache(async (id: string) => (await getApi()).report(id));
