import { createHttpApi, type PreflightApi } from "./api";
import { LOCAL_API_URL, type NetworkId } from "./networks";

/** Browser side client. Local chains are only reachable from the user's own machine */
export function browserApi(network: NetworkId): PreflightApi {
  if (network === "local") return createHttpApi({ baseUrl: LOCAL_API_URL, timeoutMs: 60_000 });
  const configured = process.env.NEXT_PUBLIC_PREFLIGHT_API_URL?.trim();
  return createHttpApi({ baseUrl: configured || window.location.origin });
}

/** True only when `preflight serve` answers on this machine. Never throws */
export async function detectLocalApi(timeoutMs = 1500): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_API_URL}/v1/health`, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
    if (!response.ok) return false;
    const body: unknown = await response.json();
    return typeof body === "object" && body !== null && "ok" in body && (body as { ok: unknown }).ok === true;
  } catch {
    return false;
  }
}
