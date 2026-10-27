export const NETWORKS = ["finney", "test", "local"] as const;
export type NetworkId = (typeof NETWORKS)[number];

export const NETWORK_LABEL: Record<NetworkId, string> = {
  finney: "Finney",
  test: "Testnet",
  local: "Local",
};

export const LOCAL_API_URL = "http://127.0.0.1:7979";

export function isNetwork(value: unknown): value is NetworkId {
  return typeof value === "string" && (NETWORKS as readonly string[]).includes(value);
}

export function parseNetwork(value: string | string[] | undefined, fallback: NetworkId = "finney"): NetworkId {
  const first = Array.isArray(value) ? value[0] : value;
  return isNetwork(first) ? first : fallback;
}

/** Taostats deep links. Local chains have no explorer */
export function taostatsAccount(network: string, ss58: string): string | null {
  if (network === "finney") return `https://taostats.io/account/${ss58}`;
  if (network === "test") return `https://test.taostats.io/account/${ss58}`;
  return null;
}

export function taostatsExtrinsic(network: string, block: number, index: number): string | null {
  const ref = `${block}-${String(index).padStart(4, "0")}`;
  if (network === "finney") return `https://taostats.io/extrinsic/${ref}`;
  if (network === "test") return `https://test.taostats.io/extrinsic/${ref}`;
  return null;
}

export function taostatsSubnet(network: string, netuid: number): string | null {
  if (network === "finney") return `https://taostats.io/subnets/${netuid}`;
  return null;
}
