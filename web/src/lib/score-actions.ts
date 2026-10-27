"use server";

import { z } from "zod";
import { hasScores, type ApiResult } from "./api";
import { NETWORKS } from "./networks";
import { getApi } from "./server-api";
import type { HealthScores } from "./types";

// Server Functions are public endpoints: validate the network before it reaches the API
const hostedNetwork = z.enum(NETWORKS).exclude(["local"]);

/** Every subnet's health score, through the server so offline mode and the server API URL apply */
export async function scoresAction(rawNetwork: unknown): Promise<ApiResult<HealthScores>> {
  const network = hostedNetwork.safeParse(rawNetwork);
  if (!network.success) return { ok: false, error: { kind: "invalid_input", status: 400, message: "Unknown network" } };
  const api = await getApi();
  if (!hasScores(api)) {
    return { ok: false, error: { kind: "offline_miss", status: null, message: "The offline demo already carries a health score on every subnet" } };
  }
  return api.scores(network.data);
}
