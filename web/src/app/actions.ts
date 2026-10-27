"use server";

import { z } from "zod";
import type { ApiResult } from "@/lib/api";
import { NETWORKS } from "@/lib/networks";
import { getApi } from "@/lib/server-api";
import { doctorReportSchema, simResultSchema, txReportSchema, type HouseStats, type NeuronHistory, type SharedReport } from "@/lib/schemas";
import type { DoctorReport, ErrorExplanation, SimResult } from "@/lib/types";

// Server Functions are public endpoints: validate everything before it reaches the API
const network = z.enum(NETWORKS).exclude(["local"]);
const ss58 = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{46,48}$/, "Not an ss58 address");
const netuid = z.number().int().min(0).max(65535);

const simRequest = z.object({
  action: z.enum(["burned_register", "add_stake", "remove_stake", "set_weights", "serve_axon", "register_network", "start_call"]),
  coldkey: ss58.nullish(),
  hotkey: ss58.nullish(),
  netuid: netuid.nullish(),
  amount: z.number().nonnegative().finite().nullish(),
  uids: z.array(z.number().int().min(0).max(65535)).max(4096).optional(),
  weights: z.array(z.number().int().min(0).max(65535)).max(4096).optional(),
  ip: z.string().max(64).nullish(),
  port: z.number().int().min(0).max(65535).nullish(),
  version_key: z.number().int().nonnegative().optional(),
  balance_override_tao: z.number().nonnegative().finite().nullish(),
});

function invalid<T>(message: string): ApiResult<T> {
  return { ok: false, error: { kind: "invalid_input", status: 400, message } };
}

export async function simulateAction(rawNetwork: unknown, rawRequest: unknown): Promise<ApiResult<SimResult>> {
  const net = network.safeParse(rawNetwork);
  const request = simRequest.safeParse(rawRequest);
  if (!net.success) return invalid("Unknown network");
  if (!request.success) return invalid(request.error.issues[0]?.message ?? "Invalid simulation request");
  return (await getApi()).simulate(net.data, request.data);
}

export async function recheckDoctor(rawNetwork: unknown, rawHotkey: unknown, rawNetuid: unknown): Promise<ApiResult<DoctorReport>> {
  const net = network.safeParse(rawNetwork);
  const hotkey = ss58.safeParse(rawHotkey);
  const uid = netuid.nullable().safeParse(rawNetuid);
  if (!net.success || !hotkey.success || !uid.success) return invalid("Invalid network, hotkey or netuid");
  return (await getApi()).doctor(net.data, hotkey.data, { netuid: uid.data });
}

export async function explainErrorAction(rawText: unknown): Promise<ApiResult<ErrorExplanation>> {
  const text = z.string().trim().min(1).max(20_000).safeParse(rawText);
  if (!text.success) return invalid("Paste the error text first");
  return (await getApi()).explainError(text.data);
}

const shareRequest = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("doctor"), payload: doctorReportSchema }),
  z.object({ kind: z.literal("tx"), payload: txReportSchema }),
  z.object({ kind: z.literal("sim"), payload: simResultSchema }),
]);

export async function shareReportAction(rawKind: unknown, rawPayload: unknown): Promise<ApiResult<SharedReport>> {
  const request = shareRequest.safeParse({ kind: rawKind, payload: rawPayload });
  if (!request.success) return invalid("That report cannot be shared");
  return (await getApi()).share(request.data.kind, request.data.payload);
}

export async function joinHouseAction(rawId: unknown): Promise<ApiResult<HouseStats>> {
  const id = z.string().regex(/^[A-Za-z0-9_-]{8,64}$/).safeParse(rawId);
  if (!id.success) return invalid("Invalid builder id");
  return (await getApi()).joinHouse(id.data);
}

export async function historyAction(rawNetwork: unknown, rawHotkey: unknown, rawNetuid: unknown): Promise<ApiResult<NeuronHistory>> {
  const net = network.safeParse(rawNetwork);
  const hotkey = ss58.safeParse(rawHotkey);
  const uid = netuid.safeParse(rawNetuid);
  if (!net.success || !hotkey.success || !uid.success) return invalid("Invalid network, hotkey or netuid");
  return (await getApi()).history(net.data, hotkey.data, uid.data);
}
