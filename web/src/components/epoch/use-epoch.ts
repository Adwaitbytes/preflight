"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiError, ApiResult } from "@/lib/api";
import type { NetworkId } from "@/lib/networks";
import type { EpochCheck, EpochPreview, EpochWhatIf } from "@/lib/types";

export type Loaded<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "failed"; error: ApiError };

/** The one subnet recorded for offline mode */
export const OFFLINE_NETUID = 64;

const OFFLINE_MISS: ApiError = {
  kind: "offline_miss",
  status: null,
  message: `Offline mode has a recording of SN${OFFLINE_NETUID} only. Turn offline mode off to compute any subnet live`,
};

async function recorded(netuid: number): Promise<ApiResult<{ preview: EpochPreview; check: EpochCheck }>> {
  if (netuid !== OFFLINE_NETUID) return { ok: false, error: OFFLINE_MISS };
  const [{ epochPreviewSchema, epochCheckSchema }, sample] = await Promise.all([import("@/lib/schemas"), import("@/data/samples/epoch-sn64.json")]);
  const preview = epochPreviewSchema.safeParse(sample.default.preview);
  const check = epochCheckSchema.safeParse(sample.default.check);
  return preview.success && check.success
    ? { ok: true, data: { preview: preview.data, check: check.data } }
    : { ok: false, error: { kind: "offline_miss", status: null, message: "The recorded epoch is unreadable" } };
}

/** Keyed request state: whatever was shown for another key reads as loading, with no reset in the effect */
function useKeyed<T>(key: string | null, load: (signal: AbortSignal) => Promise<ApiResult<T>>): Loaded<T> & { retry: () => void } {
  const [settled, setSettled] = useState<{ key: string; state: Loaded<T> } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const full = key === null ? null : `${key}:${attempt}`;

  useEffect(() => {
    if (full === null) return;
    const controller = new AbortController();
    load(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setSettled({ key: full, state: result.ok ? { status: "ready", data: result.data } : { status: "failed", error: result.error } });
    });
    return () => controller.abort();
    // `load` is rebuilt every render; `full` already names everything it depends on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  const state: Loaded<T> = full !== null && settled?.key === full ? settled.state : { status: "loading" };
  return { ...state, retry };
}

/** The next epoch for a subnet, with `whatif` applied when one is given */
export function useEpochPreview(network: NetworkId, netuid: number, hotkey: string | null, whatif: EpochWhatIf | null, offline: boolean, enabled = true) {
  const key = enabled ? `${network}:${netuid}:${hotkey ?? ""}:${offline}:${whatif ? JSON.stringify(whatif) : ""}` : null;
  return useKeyed<EpochPreview>(key, async (signal) => {
    if (offline) {
      const result = await recorded(netuid);
      return result.ok ? { ok: true, data: result.data.preview } : result;
    }
    const api = (await import("@/lib/browser-api")).browserApi(network);
    return api.epoch(network, netuid, { hotkey: hotkey ?? undefined, whatif: whatif ?? undefined, signal });
  });
}

/** How exactly the last epoch was reproduced: read after the preview, never blocking it */
export function useEpochCheck(network: NetworkId, netuid: number, offline: boolean, enabled: boolean) {
  const key = enabled ? `${network}:${netuid}:${offline}` : null;
  return useKeyed<EpochCheck>(key, async (signal) => {
    if (offline) {
      const result = await recorded(netuid);
      return result.ok ? { ok: true, data: result.data.check } : result;
    }
    const api = (await import("@/lib/browser-api")).browserApi(network);
    return api.epochCheck(network, netuid, signal);
  });
}
