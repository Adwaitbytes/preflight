import { explainErrorAction, recheckDoctor, simulateAction } from "@/app/actions";
import type { ApiResult } from "./api";
import { browserApi } from "./browser-api";
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

export { explainErrorAction as explainError };
