import { LOCAL_API_URL } from "./networks";

/**
 * True only when `preflight serve` answers on this machine. Never throws.
 * Kept apart from the API client so the layout does not pull the response schemas into every page.
 */
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
