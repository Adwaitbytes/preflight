/**
 * Fleet and mining economics reads. Same contract as `api.ts`: every call resolves to an
 * `ApiResult` and never throws, errors map through the shared `errorForStatus`, and offline mode
 * answers from recorded finney responses instead of inventing one.
 */

import "server-only";

import { cache } from "react";
import { z } from "zod";
import economicsSn51 from "@/data/samples/economics-51.json";
import fleetSample from "@/data/samples/fleet.json";
import { errorForStatus, readDetail, type ApiResult, type HttpApiOptions } from "./api";
import { truncateMiddle } from "./format";
import type { NetworkId } from "./networks";
import { doctorReportSchema } from "./schemas";
import { isOffline, sameOrigin } from "./server-api";
import type { FleetReport, MinerEconomics } from "./types";

export type HostedNetwork = Exclude<NetworkId, "local">;

// Built from the Doctor's schema so a Finding validates identically on every page
const diagnosisShape = doctorReportSchema.shape.diagnoses.element.shape;
const finding = diagnosisShape.findings.element;

export const fleetReportSchema = z.object({
  coldkey: z.string(),
  chain: doctorReportSchema.shape.chain,
  hotkeys: z.number().int(),
  checked: z.number().int(),
  rows: z.array(
    z.object({
      hotkey: z.string(),
      netuid: z.number().int().nullable(),
      subnet_name: z.string().nullish(),
      uid: z.number().int().nullish(),
      role: diagnosisShape.role,
      verdict: doctorReportSchema.shape.verdict,
      headline: z.string(),
      worst: finding.nullish(),
      incentive: z.number().optional(),
      alpha_per_day: z.number().optional(),
      tao_per_day: z.number().optional(),
    }),
  ),
  broken: z.number().int(),
  warning: z.number().int(),
  healthy: z.number().int(),
  tao_per_day: z.number(),
  headline: z.string(),
  elapsed_ms: z.number(),
}) satisfies z.ZodType<FleetReport>;

export const minerEconomicsSchema = z.object({
  chain: doctorReportSchema.shape.chain,
  netuid: z.number().int(),
  name: z.string(),
  verdict: z.enum(["promising", "competitive", "hard", "closed"]),
  headline: z.string(),
  registration_cost_tao: z.number(),
  burn_history: z.array(z.tuple([z.number(), z.number()])),
  seats_used: z.number().int(),
  seats_max: z.number().int(),
  miners: z.number().int(),
  earning_miners: z.number().int(),
  alpha_price_tao: z.number(),
  bands: z.array(z.object({ label: z.string(), alpha_per_day: z.number(), tao_per_day: z.number() })),
  immunity_blocks: z.number().int(),
  immunity_hours: z.number(),
  prune_bar_alpha_per_day: z.number().nullable(),
  prune_bar_tao_per_day: z.number().nullable(),
  registrations_per_day: z.number(),
  seat_turnover_hours: z.number().nullable(),
  payback_days: z.number().nullable(),
  notes: z.array(z.string()),
  findings: z.array(finding),
}) satisfies z.ZodType<MinerEconomics>;

export interface InsightsApi {
  fleet(network: HostedNetwork, coldkey: string): Promise<ApiResult<FleetReport>>;
  economics(network: HostedNetwork, netuid: number): Promise<ApiResult<MinerEconomics>>;
}

// The hosted API function may run for 60 s, and a cold fleet read of 64 hotkeys uses most of it
const TIMEOUT_MS = 60_000;

export function createInsightsApi({ baseUrl, fetch: fetchImpl = fetch, timeoutMs = TIMEOUT_MS }: HttpApiOptions): InsightsApi {
  const root = baseUrl.replace(/\/+$/, "");

  async function read<T>(path: string, schema: z.ZodType<T>): Promise<ApiResult<T>> {
    let response: Response;
    try {
      response = await fetchImpl(`${root}${path}`, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
    } catch (cause) {
      const timedOut = cause instanceof DOMException && cause.name === "TimeoutError";
      return {
        ok: false,
        error: {
          kind: "network",
          status: null,
          message: timedOut ? `The Preflight API did not answer within ${Math.round(timeoutMs / 1000)} s` : "Could not reach the Preflight API",
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
    const checked = schema.safeParse(body);
    return checked.success
      ? { ok: true, data: checked.data }
      : { ok: false, error: { kind: "server", status: response.status, message: "The API answered with an unexpected shape" } };
  }

  return {
    fleet: (network, coldkey) => read(`/v1/fleet/${network}/${encodeURIComponent(coldkey)}`, fleetReportSchema),
    economics: (network, netuid) => read(`/v1/economics/${network}/${netuid}`, minerEconomicsSchema),
  };
}

const RECORDED_FLEET = fleetReportSchema.parse(fleetSample);
const RECORDED_ECONOMICS = [minerEconomicsSchema.parse(economicsSn51)];

function miss<T>(message: string): ApiResult<T> {
  return { ok: false, error: { kind: "offline_miss", status: null, message } };
}

/** Recorded finney responses for the stage demo; anything else answers `offline_miss` */
export const offlineInsightsApi: InsightsApi = {
  async fleet(_network, coldkey) {
    if (coldkey === RECORDED_FLEET.coldkey) return { ok: true, data: RECORDED_FLEET };
    return miss(`The offline demo recorded one coldkey, ${truncateMiddle(RECORDED_FLEET.coldkey, 6, 4)}. Turn offline mode off for a live read`);
  },
  async economics(_network, netuid) {
    const recorded = RECORDED_ECONOMICS.find((e) => e.netuid === netuid);
    if (recorded) return { ok: true, data: recorded };
    const have = RECORDED_ECONOMICS.map((e) => `SN${e.netuid}`).join(", ");
    return miss(`The offline demo recorded ${have} only. Turn offline mode off for a live read`);
  },
};

async function insightsApi(): Promise<InsightsApi> {
  if (isOffline()) return offlineInsightsApi;
  const configured = process.env.PREFLIGHT_API_URL?.trim();
  return createInsightsApi({ baseUrl: configured || (await sameOrigin()) });
}

// One read per request: generateMetadata and the page share it
export const getFleet = cache(async (network: HostedNetwork, coldkey: string) => (await insightsApi()).fleet(network, coldkey));
export const getEconomics = cache(async (network: HostedNetwork, netuid: number) => (await insightsApi()).economics(network, netuid));
