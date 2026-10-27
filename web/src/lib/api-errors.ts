/**
 * API failure kinds and their titles. Lives apart from the API client so error states,
 * which render on every page through the root error boundary, do not pull the response schemas into the bundle.
 */

export type ApiErrorKind = "invalid_input" | "not_found" | "unreachable" | "rate_limited" | "server" | "offline_miss" | "network";

export interface ApiError {
  kind: ApiErrorKind;
  status: number | null;
  message: string;
  /** Seconds, from Retry-After on a 429 */
  retryAfter?: number | null;
}

export const API_ERROR_TITLE: Record<ApiErrorKind, string> = {
  invalid_input: "That input does not look right",
  not_found: "Nothing found",
  unreachable: "The chain is not answering",
  rate_limited: "Too many requests",
  server: "The API had a problem",
  offline_miss: "Not in the offline demo",
  network: "The Preflight API is not reachable",
};
