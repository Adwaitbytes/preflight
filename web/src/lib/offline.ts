/**
 * Offline demo API: the same `PreflightApi` surface, answered from recorded finney data.
 * Anything not recorded answers `offline_miss`, so the UI never invents a result.
 */

import brokenMiner from "@/data/samples/doctor_broken_miner.json";
import multiSubnet from "@/data/samples/doctor_multi_subnet.json";
import unregistered from "@/data/samples/doctor_unregistered.json";
import validator from "@/data/samples/doctor_validator.json";
import { CHAIN_ERRORS } from "@/data/demo/errors";
import { DEMO_PLAN, DEMO_SUBNET_DETAILS, DEMO_SUBNETS } from "@/data/demo/subnets";
import { DEMO_SIMS, DEMO_TX } from "@/data/demo/tx";
import type { ApiResult, PreflightApi } from "./api";
import { classifyInput } from "./route-input";
import { doctorReportSchema } from "./schemas";
import type { AskAnswer, DoctorReport, ErrorExplanation, SubnetCard } from "./types";

export const SAMPLE_REPORTS: DoctorReport[] = [brokenMiner, multiSubnet, validator, unregistered].map((raw) =>
  doctorReportSchema.parse(raw),
);

function miss<T>(message: string): ApiResult<T> {
  return { ok: false, error: { kind: "offline_miss", status: null, message } };
}

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

const ERROR_NAME = /\b(?:([A-Z][A-Za-z]+)\.)?([A-Z][a-z]+(?:[A-Z][a-z0-9]*){2,})\b/g;

/** Finds the first known runtime error name in pasted text such as a btcli traceback */
export function explainFromCatalog(text: string): ErrorExplanation {
  for (const match of text.matchAll(ERROR_NAME)) {
    const name = match[2];
    if (!name) continue;
    const entry = CHAIN_ERRORS[name];
    if (!entry) continue;
    return {
      error: name,
      pallet: match[1] ?? entry.pallet,
      code: entry.code,
      title: name.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
      explanation: entry.description,
      fix: null,
      trap: null,
      source: entry.source,
      docs: entry.docs,
      found: true,
    };
  }
  return {
    error: text.slice(0, 120),
    pallet: null,
    code: null,
    title: "No known runtime error in that text",
    explanation:
      "Preflight looks for a Subtensor error name such as TooManyRegistrationsThisBlock. Paste the full btcli or SDK output, including the line that names the error",
    fix: null,
    found: false,
  };
}

function matchesQuery(card: SubnetCard, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [card.catalog?.name, card.live?.name, card.catalog?.summary, card.catalog?.operator, ...(card.catalog?.capabilities ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q) || String(card.netuid) === q.replace(/^sn/, "");
}

function ask(query: string): AskAnswer {
  const input = classifyInput(query);
  switch (input.kind) {
    case "hotkey":
      return { query, intent: "doctor", route: `/doctor/finney/${input.hotkey}`, params: { hotkey: input.hotkey }, message: "Diagnose this hotkey" };
    case "extrinsic":
    case "block_index": {
      const ref = input.kind === "extrinsic" ? input.hash : input.ref;
      return { query, intent: "tx", route: `/tx/finney/${ref}`, params: { ref }, message: "Debug this transaction" };
    }
    case "netuid":
      return { query, intent: "subnet", route: `/subnets/${input.netuid}`, params: { netuid: String(input.netuid) }, message: `Open SN${input.netuid}` };
    case "error":
      return { query, intent: "explain_error", route: `/explain?text=${encodeURIComponent(input.text)}`, params: {}, message: "Explain this error" };
    case "subnet_name":
      return { query, intent: "find", route: `/subnets?q=${encodeURIComponent(input.query)}`, params: { q: input.query }, message: "Search subnets" };
    case "empty":
    case "invalid":
      return { query, intent: "unknown", route: null, params: {}, message: "Ask your own Claude with the MCP server" };
  }
}

export const offlineApi: PreflightApi = {
  async doctor(_network, hotkey, options = {}) {
    const report = SAMPLE_REPORTS.find((r) => r.hotkey === hotkey);
    if (!report) return miss("The offline demo has four recorded hotkeys. Pick one from the examples, or turn offline mode off for a live read");
    if (options.netuid == null) return ok(report);
    const diagnoses = report.diagnoses.filter((d) => d.netuid === options.netuid);
    if (!diagnoses.length) return { ok: false, error: { kind: "not_found", status: 404, message: `This hotkey has no recorded diagnosis on SN${options.netuid}` } };
    return ok({ ...report, diagnoses });
  },
  async tx(_network, ref) {
    const needle = ref.toLowerCase();
    const report = DEMO_TX.find((t) => t.ref === needle || t.extrinsic_hash === needle);
    return report ? ok(report) : miss("The offline demo has three recorded extrinsics. Pick one from the examples");
  },
  async account() {
    return miss("The offline demo has no recorded accounts. Turn offline mode off to look up an address");
  },
  async block() {
    return miss("The offline demo has no recorded blocks. Turn offline mode off to open a block");
  },
  async explainError(text) {
    return ok(explainFromCatalog(text));
  },
  async simulate(_network, request) {
    const sim = DEMO_SIMS.find((s) => s.action === request.action);
    return sim ? ok({ ...sim, signer: request.coldkey ?? request.hotkey ?? sim.signer }) : miss("The offline demo recorded burned_register and set_weights. Turn offline mode off to simulate other actions");
  },
  async plan() {
    return ok(DEMO_PLAN);
  },
  async subnets() {
    return ok(DEMO_SUBNETS);
  },
  async subnet(_network, netuid) {
    const detail = DEMO_SUBNET_DETAILS[netuid];
    return detail ? ok(detail) : { ok: false, error: { kind: "not_found", status: 404, message: `SN${netuid} is not in the offline recording` } };
  },
  async find(query) {
    return ok(DEMO_SUBNETS.filter((card) => matchesQuery(card, query)));
  },
  async ask(query) {
    return ok(ask(query));
  },
  async health() {
    return ok({ ok: true, version: "offline", networks: { finney: true, test: false, local: false }, fork: false });
  },
  async house() {
    return miss("Builders House counters are only kept by the live API");
  },
  async joinHouse() {
    return miss("Builders House counters are only kept by the live API");
  },
  async share() {
    return miss("Share links are stored by the live API, so they are off in the offline demo");
  },
  async report() {
    return miss("Shared reports are stored by the live API, so they are off in the offline demo");
  },
  async history() {
    return { ok: false, error: { kind: "not_found", status: 404, message: "No recorded history in the offline demo" } };
  },
};
