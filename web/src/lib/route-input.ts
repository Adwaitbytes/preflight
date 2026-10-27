/**
 * The landing input accepts anything. This decides what the user pasted and where it goes.
 * Pure and synchronous so it runs on every keystroke and is trivially testable.
 */

import type { NetworkId } from "./networks";

export type InputKind =
  | { kind: "empty" }
  | { kind: "hotkey"; hotkey: string }
  | { kind: "extrinsic"; hash: string }
  | { kind: "block_index"; block: number; index: number; ref: string }
  | { kind: "netuid"; netuid: number }
  | { kind: "error"; text: string }
  | { kind: "subnet_name"; query: string };

// ss58 is base58 (no 0, O, I, l). Bittensor uses format 42, which renders 47 or 48 characters
const SS58 = /^[1-9A-HJ-NP-Za-km-z]{46,48}$/;
const SS58_ANYWHERE = /\b5[1-9A-HJ-NP-Za-km-z]{46,47}\b/;
const EXTRINSIC_HASH = /^0x[0-9a-fA-F]{64}$/;
const BLOCK_INDEX = /^#?(\d{1,10})\s*[-:/]\s*(\d{1,6})$/;
const NETUID = /^(?:sn|netuid|subnet)?\s*#?\s*(\d{1,4})$/i;
const MAX_NETUID = 4096;

// Things that only show up in pasted errors: dotted pallet errors, tracebacks, RPC failures
const ERROR_MARKERS = [
  /\b[A-Z][A-Za-z]+\.[A-Z][A-Za-z]{3,}\b/,
  /traceback/i,
  /\b(error|exception|failed|failure|invalid|rejected|denied)\b/i,
  /\{\s*['"]?(module|index|error)['"]?\s*:/i,
];
// A bare runtime error name such as TooManyRegistrationsThisBlock: three or more humps, no spaces
const BARE_ERROR_NAME = /^[A-Z][a-z]+(?:[A-Z][a-z0-9]*){2,}$/;

export function classifyInput(raw: string): InputKind {
  const text = raw.trim();
  if (!text) return { kind: "empty" };

  if (SS58.test(text)) return { kind: "hotkey", hotkey: text };
  if (EXTRINSIC_HASH.test(text)) return { kind: "extrinsic", hash: text.toLowerCase() };

  const blockIndex = BLOCK_INDEX.exec(text);
  if (blockIndex?.[1] && blockIndex[2]) {
    const block = Number(blockIndex[1]);
    const index = Number(blockIndex[2]);
    return { kind: "block_index", block, index, ref: `${block}-${String(index).padStart(4, "0")}` };
  }

  const netuid = NETUID.exec(text);
  if (netuid?.[1]) {
    const value = Number(netuid[1]);
    if (value < MAX_NETUID) return { kind: "netuid", netuid: value };
  }

  if (BARE_ERROR_NAME.test(text) || ERROR_MARKERS.some((pattern) => pattern.test(text))) {
    return { kind: "error", text };
  }

  // "why is 5F... earning zero" still means the doctor
  const embedded = SS58_ANYWHERE.exec(text);
  if (embedded) return { kind: "hotkey", hotkey: embedded[0] };

  if (text.length <= 48 && !text.includes("\n")) return { kind: "subnet_name", query: text };
  return { kind: "error", text };
}

export function hrefForInput(input: InputKind, network: NetworkId): string | null {
  switch (input.kind) {
    case "empty":
      return null;
    case "hotkey":
      return `/doctor/${network}/${input.hotkey}`;
    case "extrinsic":
      return `/tx/${network}/${input.hash}`;
    case "block_index":
      return `/tx/${network}/${input.ref}`;
    case "netuid":
      return `/subnets/${input.netuid}?network=${network}`;
    case "error":
      return `/explain?text=${encodeURIComponent(input.text)}`;
    case "subnet_name":
      return `/subnets?q=${encodeURIComponent(input.query)}&network=${network}`;
  }
}

export function describeInput(input: InputKind): string {
  switch (input.kind) {
    case "empty":
      return "Paste a hotkey, extrinsic, error or netuid";
    case "hotkey":
      return "Hotkey: run the Doctor";
    case "extrinsic":
      return "Extrinsic hash: debug the transaction";
    case "block_index":
      return `Block ${input.block}, extrinsic ${input.index}: debug the transaction`;
    case "netuid":
      return `Netuid ${input.netuid}: open the subnet`;
    case "error":
      return "Error text: explain it";
    case "subnet_name":
      return "Search subnets by name or capability";
  }
}
