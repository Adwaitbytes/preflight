"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "@/lib/api";
import type { NetworkId } from "@/lib/networks";
import type { Weather } from "@/lib/types";
import { WEATHER_REFRESH_MS } from "@/lib/weather";

export type WeatherState =
  | { status: "loading" }
  | { status: "ready"; weather: Weather }
  | { status: "failed"; error: ApiError };

async function read(network: NetworkId, offline: boolean, signal: AbortSignal): Promise<{ ok: true; data: Weather } | { ok: false; error: ApiError }> {
  if (offline) {
    // Offline mode replays a recorded finney window, checked like any API answer
    const [{ weatherSchema }, recorded] = await Promise.all([import("@/lib/schemas"), import("@/data/samples/weather.json")]);
    const parsed = weatherSchema.safeParse(recorded.default);
    return parsed.success ? { ok: true, data: parsed.data } : { ok: false, error: { kind: "offline_miss", status: null, message: "The recorded weather is unreadable" } };
  }
  const api = (await import("@/lib/browser-api")).browserApi(network);
  return api.weather(network, 60, signal);
}

/** The network's weather, refreshed every minute while the tab is visible */
export function useWeather(network: NetworkId, offline: boolean): WeatherState & { retry: () => void } {
  const [settled, setSettled] = useState<{ key: string; state: WeatherState } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  // A new network or a retry starts from loading without a synchronous reset in the effect
  const key = `${network}:${offline}:${attempt}`;
  const state: WeatherState = settled?.key === key ? settled.state : { status: "loading" };

  useEffect(() => {
    let controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = () => {
      controller.abort();
      controller = new AbortController();
      const signal = controller.signal;
      read(network, offline, signal).then((result) => {
        if (signal.aborted) return;
        setSettled((previous) => {
          if (result.ok) return { key, state: { status: "ready", weather: result.data } };
          // A failed refresh keeps the last good reading on screen
          const last = previous?.key === key ? previous.state : null;
          return { key, state: last?.status === "ready" ? last : { status: "failed", error: result.error } };
        });
        if (!offline) timer = setTimeout(tick, WEATHER_REFRESH_MS);
      });
    };
    const tick = () => {
      if (document.visibilityState === "visible") load();
      else timer = setTimeout(tick, WEATHER_REFRESH_MS);
    };
    load();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [network, offline, key]);

  return { ...state, retry };
}
