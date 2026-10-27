import type { SimAction } from "./api";
import { isNetwork, type NetworkId } from "./networks";

export const SIM_FIELDS = ["coldkey", "hotkey", "netuid", "amount", "uids", "weights", "version_key", "ip", "port", "balance_override_tao"] as const;
export type SimField = (typeof SIM_FIELDS)[number];

const ACTIONS: Record<SimAction, true> = {
  burned_register: true,
  add_stake: true,
  remove_stake: true,
  set_weights: true,
  serve_axon: true,
  register_network: true,
  start_call: true,
};

function isSimAction(value: string): value is SimAction {
  return Object.hasOwn(ACTIONS, value);
}

// Long enough for any field the form takes, short enough that a crafted link cannot stuff the form
const MAX_VALUE_LENGTH = 256;

export interface SimPrefill {
  action: SimAction;
  network: NetworkId | null;
  values: Partial<Record<SimField, string>>;
}

/**
 * Reads a link such as `/sim?action=burned_register&hotkey=5...&netuid=64`. Values only fill the
 * form as text; the form's own validation still checks every one before anything is sent.
 */
export function parseSimPrefill(params: { get(name: string): string | null }): SimPrefill | null {
  const action = params.get("action");
  if (!action || !isSimAction(action)) return null;
  const values: Partial<Record<SimField, string>> = {};
  for (const field of SIM_FIELDS) {
    const raw = params.get(field)?.trim();
    if (raw && raw.length <= MAX_VALUE_LENGTH) values[field] = raw;
  }
  const network = params.get("network");
  return { action, network: isNetwork(network) ? network : null, values };
}

/** The link the Doctor offers an unregistered hotkey */
export function simulateRegistrationHref(network: NetworkId, hotkey: string, netuid: number | null): string {
  const query = new URLSearchParams({ action: "burned_register", hotkey });
  if (netuid != null) query.set("netuid", String(netuid));
  if (network !== "finney") query.set("network", network);
  return `/sim?${query}`;
}
