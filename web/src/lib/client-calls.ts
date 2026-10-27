import { explainErrorAction, historyAction, recheckDoctor, simulateAction } from "@/app/actions";
import type { ApiResult } from "./api";
import { browserApi, localApi } from "./browser-api";
import type { NeuronHistory } from "./schemas";
import type { NetworkId } from "./networks";
import type { DoctorReport, SimRequest, SimResult } from "./types";

/**
 * Interactive calls from client components. Hosted networks go through Server Functions so
 * offline mode and the server API URL apply; a local chain is called from the browser directly.
 */
export function simulate(network: NetworkId, request: SimRequest): Promise<ApiResult<SimResult>> {
  return network === "local" ? browserApi("local").simulate("local", request) : simulateAction(network, request);
}

export function recheck(network: NetworkId, hotkey: string, netuid: number | null): Promise<ApiResult<DoctorReport>> {
  return network === "local" ? browserApi("local").doctor("local", hotkey, { netuid }) : recheckDoctor(network, hotkey, netuid);
}

export function history(network: NetworkId, hotkey: string, netuid: number): Promise<ApiResult<NeuronHistory>> {
  return network === "local" ? browserApi("local").history("local", hotkey, netuid) : historyAction(network, hotkey, netuid);
}

/** Re-runs a predicted simulation on the user's own `preflight serve`, which can fork the chain */
export function simulateOnLocalFork(network: NetworkId, request: SimRequest): Promise<ApiResult<SimResult>> {
  return localApi().simulate(network, request);
}

export { explainErrorAction as explainError };
export { joinHouseAction as joinHouse, shareReportAction as shareReport } from "@/app/actions";
