import { explainErrorAction, historyAction, recheckDoctor, simulateAction } from "@/app/actions";
import type { ApiResult, HttpApi } from "./api";
import type { NeuronHistory } from "./schemas";
import type { NetworkId } from "./networks";
import { scoresAction } from "./score-actions";
import type { DoctorReport, HealthScores, SimRequest, SimResult } from "./types";

/**
 * Interactive calls from client components. Hosted networks go through Server Functions so
 * offline mode and the server API URL apply; a local chain is called from the browser directly.
 */

// The browser client validates responses with zod, so it loads on the first local call instead of with every page
function local(): Promise<HttpApi> {
  return import("./browser-api").then((m) => m.localApi());
}

export function simulate(network: NetworkId, request: SimRequest): Promise<ApiResult<SimResult>> {
  return network === "local" ? local().then((api) => api.simulate("local", request)) : simulateAction(network, request);
}

export function recheck(network: NetworkId, hotkey: string, netuid: number | null): Promise<ApiResult<DoctorReport>> {
  return network === "local" ? local().then((api) => api.doctor("local", hotkey, { netuid })) : recheckDoctor(network, hotkey, netuid);
}

export function history(network: NetworkId, hotkey: string, netuid: number): Promise<ApiResult<NeuronHistory>> {
  return network === "local" ? local().then((api) => api.history("local", hotkey, netuid)) : historyAction(network, hotkey, netuid);
}

/** Every subnet's health score. Takes about 40 s when the API's cache is cold */
export function scores(network: NetworkId): Promise<ApiResult<HealthScores>> {
  return network === "local" ? local().then((api) => api.scores("local")) : scoresAction(network);
}

/** Re-runs a predicted simulation on the user's own `preflight serve`, which can fork the chain */
export function simulateOnLocalFork(network: NetworkId, request: SimRequest): Promise<ApiResult<SimResult>> {
  return local().then((api) => api.simulate(network, request));
}

export { explainErrorAction as explainError };
export { joinHouseAction as joinHouse, shareReportAction as shareReport } from "@/app/actions";
