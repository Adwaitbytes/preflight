/**
 * Typed client for the Preflight HTTP API. Every call resolves to an `ApiResult`, never throws,
 * so each view can render a precise state for each failure instead of a generic error page.
 */

import type { z } from "zod";
import {
  houseStatsSchema,
  neuronHistorySchema,
  sharedReportSchema,
  type HouseStats,
  type NeuronHistory,
  type SharedReport,
  type ShareKind,
} from "./schemas";
import type { NetworkId } from "./networks";
import type {
  AskAnswer,
  DoctorReport,
  ErrorExplanation,
  HealthScores,
  LaunchPlan,
  ServiceHealth,
  SimRequest,
  SimResult,
  SubnetCard,
  SubnetDetail,
  TxReport,
} from "./types";

import type { ApiError } from "./api-errors";

export { API_ERROR_TITLE, type ApiError, type ApiErrorKind } from "./api-errors";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export type SimAction = SimRequest["action"];

export type { HouseStats, NeuronHistory, SharedReport, ShareKind } from "./schemas";

export interface DoctorOptions {
  netuid?: number | null;
  probe?: boolean;
  /** Skip the API and CDN caches, for Run again after a fix */
  fresh?: boolean;
}

export interface PreflightApi {
  doctor(network: NetworkId, hotkey: string, options?: DoctorOptions): Promise<ApiResult<DoctorReport>>;
  tx(network: NetworkId, ref: string): Promise<ApiResult<TxReport>>;
  explainError(text: string): Promise<ApiResult<ErrorExplanation>>;
  simulate(network: NetworkId, request: SimRequest): Promise<ApiResult<SimResult>>;
  plan(network: NetworkId): Promise<ApiResult<LaunchPlan>>;
  subnets(network: NetworkId): Promise<ApiResult<SubnetCard[]>>;
  subnet(network: NetworkId, netuid: number): Promise<ApiResult<SubnetDetail>>;
  find(query: string): Promise<ApiResult<SubnetCard[]>>;
  ask(query: string): Promise<ApiResult<AskAnswer>>;
  health(): Promise<ApiResult<ServiceHealth>>;
  house(): Promise<ApiResult<HouseStats>>;
  joinHouse(id: string): Promise<ApiResult<HouseStats>>;
  share(kind: ShareKind, payload: DoctorReport | TxReport | SimResult): Promise<ApiResult<SharedReport>>;
  report(id: string): Promise<ApiResult<SharedReport>>;
  history(network: NetworkId, hotkey: string, netuid: number): Promise<ApiResult<NeuronHistory>>;
}

/** Served by the HTTP API only: the offline recording already carries health on every card */
export interface ScoresApi {
  scores(network: NetworkId): Promise<ApiResult<HealthScores>>;
}

export type HttpApi = PreflightApi & ScoresApi;

export function hasScores(api: PreflightApi): api is HttpApi {
  return "scores" in api && typeof api.scores === "function";
}

const DEFAULT_TIMEOUT_MS = 45_000;
// Scoring every subnet takes about 40 s on a cold cache
const SCORES_TIMEOUT_MS = 90_000;

export function errorForStatus(status: number, detail: string | null, retryAfter: string | null): ApiError {
  const message = detail ?? `The API answered ${status}`;
  if (status === 400 || status === 422) return { kind: "invalid_input", status, message };
  if (status === 404) return { kind: "not_found", status, message };
  if (status === 429) {
    const seconds = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN;
    return { kind: "rate_limited", status, message, retryAfter: Number.isFinite(seconds) ? seconds : null };
  }
  if (status === 503 || status === 504) return { kind: "unreachable", status, message };
  return { kind: "server", status, message };
}

/** FastAPI puts a string in `detail` for HTTPException and a list of issues for validation */
export function readDetail(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("detail" in body)) return null;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first: unknown = detail[0];
    if (typeof first === "object" && first !== null && "msg" in first) {
      const msg = (first as { msg: unknown }).msg;
      if (typeof msg === "string") return msg;
    }
  }
  return null;
}

/** Cheap structural check: the body is an object carrying the keys this endpoint promises */
function hasKeys(body: unknown, keys: readonly string[]): boolean {
  return typeof body === "object" && body !== null && keys.every((key) => key in body);
}

type Guard = (body: unknown) => boolean;
const objectWith =
  (...keys: string[]): Guard =>
  (body) =>
    hasKeys(body, keys);
const arrayOf =
  (...keys: string[]): Guard =>
  (body) =>
    Array.isArray(body) && body.every((item) => hasKeys(item, keys));

export interface HttpApiOptions {
  baseUrl: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

export function createHttpApi({ baseUrl, fetch: fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS }: HttpApiOptions): HttpApi {
  const root = baseUrl.replace(/\/+$/, "");

  async function call<T>(path: string, guard: Guard, init?: RequestInit, limitMs = timeoutMs): Promise<ApiResult<T>> {
    let response: Response;
    try {
      response = await fetchImpl(`${root}${path}`, {
        ...init,
        headers: { accept: "application/json", ...(init?.body ? { "content-type": "application/json" } : {}) },
        signal: AbortSignal.timeout(limitMs),
        cache: "no-store",
      });
    } catch (cause) {
      const timedOut = cause instanceof DOMException && cause.name === "TimeoutError";
      return {
        ok: false,
        error: {
          kind: "network",
          status: null,
          message: timedOut ? `The Preflight API did not answer within ${Math.round(limitMs / 1000)} s` : "Could not reach the Preflight API",
        },
      };
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      return { ok: false, error: errorForStatus(response.status, readDetail(body), response.headers.get("retry-after")) };
    }
    if (!guard(body)) {
      return { ok: false, error: { kind: "server", status: response.status, message: "The API answered with an unexpected shape" } };
    }
    return { ok: true, data: body as T };
  }

  async function parsed<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<ApiResult<T>> {
    const result = await call<unknown>(path, () => true, init);
    if (!result.ok) return result;
    const checked = schema.safeParse(result.data);
    return checked.success
      ? { ok: true, data: checked.data }
      : { ok: false, error: { kind: "server", status: 200, message: "The API answered with an unexpected shape" } };
  }

  const enc = encodeURIComponent;

  return {
    doctor(network, hotkey, options = {}) {
      const query = new URLSearchParams();
      if (options.netuid != null) query.set("netuid", String(options.netuid));
      if (options.probe) query.set("probe", "true");
      if (options.fresh) query.set("fresh", "true");
      const suffix = query.size ? `?${query}` : "";
      return call(`/v1/doctor/${network}/${enc(hotkey)}${suffix}`, objectWith("hotkey", "diagnoses", "verdict", "headline"));
    },
    tx: (network, ref) => call(`/v1/tx/${network}/${enc(ref)}`, objectWith("pallet", "call", "success", "events")),
    explainError: (text) =>
      call("/v1/explain-error", objectWith("error", "title", "explanation"), { method: "POST", body: JSON.stringify({ text }) }),
    simulate: (network, request) =>
      call(`/v1/sim/${network}`, objectWith("would_succeed", "mode", "effects"), { method: "POST", body: JSON.stringify(request) }),
    plan: (network) => call(`/v1/plan/${network}`, objectWith("lock_cost_tao", "timeline", "defaults")),
    subnets: (network) => call(`/v1/subnets/${network}`, arrayOf("netuid")),
    subnet: (network, netuid) => call(`/v1/subnets/${network}/${netuid}`, objectWith("card", "hyperparams")),
    scores: (network) => call(`/v1/scores/${network}`, objectWith("chain", "scores"), undefined, Math.max(timeoutMs, SCORES_TIMEOUT_MS)),
    find: (query) => call(`/v1/find?q=${enc(query)}`, arrayOf("netuid")),
    ask: (query) => call(`/v1/ask?q=${enc(query)}`, objectWith("intent", "message")),
    health: () => call("/v1/health", objectWith("ok", "networks")),
    house: () => parsed("/v1/house", houseStatsSchema),
    joinHouse: (id) => parsed("/v1/house/join", houseStatsSchema, { method: "POST", body: JSON.stringify({ id }) }),
    share: (kind, payload) => parsed("/v1/reports", sharedReportSchema, { method: "POST", body: JSON.stringify({ kind, payload }) }),
    report: (id) => parsed(`/v1/reports/${enc(id)}`, sharedReportSchema),
    history: (network, hotkey, netuid) => parsed(`/v1/history/${network}/${enc(hotkey)}?netuid=${netuid}`, neuronHistorySchema),
  };
}

