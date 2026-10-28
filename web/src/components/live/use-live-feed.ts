"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { ApiResult } from "@/lib/api";
import type { ApiError } from "@/lib/api-errors";
import { BLOCK_SECONDS, backoffMs, FEED_LIMIT, isStaleFeed, mergeBlocks, POLL_MS, replayBlock, replayOpening } from "@/lib/live";
import type { NetworkId } from "@/lib/networks";
import type { LiveBlock, LiveFeed } from "@/lib/types";

export interface FeedState {
  /** Newest first */
  blocks: LiveBlock[];
  status: "connecting" | "live" | "failing";
  error: ApiError | null;
  /** When the next attempt runs after a failure, ms since epoch */
  retryAt: number | null;
}

type Action = { type: "received"; blocks: readonly LiveBlock[] } | { type: "failed"; error: ApiError; retryAt: number } | { type: "retrying" };

const QUICK_RETRY_MS = 1_500;
const MAX_QUICK_RETRIES = 3;

const INITIAL: FeedState = { blocks: [], status: "connecting", error: null, retryAt: null };

function reduce(state: FeedState, action: Action): FeedState {
  switch (action.type) {
    case "received":
      return { blocks: action.blocks.length ? mergeBlocks(state.blocks, action.blocks) : state.blocks, status: "live", error: null, retryAt: null };
    case "failed":
      return { ...state, status: "failing", error: action.error, retryAt: action.retryAt };
    case "retrying":
      return { ...state, retryAt: null };
  }
}

/**
 * Polls the live feed for one network, asking only for blocks newer than the last one held.
 * Stops while the tab is hidden and backs off while the chain or API is down. Offline mode
 * replays a recorded feed at the chain's own pace instead.
 */
export function useLiveFeed(network: NetworkId, offline: boolean): FeedState & { retry: () => void } {
  const [state, dispatch] = useReducer(reduce, INITIAL);
  const kick = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (offline) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inflight: AbortController | null = null;
    let last: number | null = null;
    let failures = 0;
    let quickRetries = 0;
    // The client and its response schema load with the first poll, not with the page
    const api = import("@/lib/browser-api").then((m) => m.browserApi(network));

    async function poll(signal: AbortSignal): Promise<ApiResult<LiveFeed>> {
      try {
        return await (await api).live(network, last, FEED_LIMIT, signal);
      } catch {
        // Only the chunk import can throw here: the client itself resolves every failure to a result
        return { ok: false, error: { kind: "network", status: null, message: "Could not load the live client. Check your connection" } };
      }
    }

    function halt() {
      clearTimeout(timer);
      inflight?.abort();
      inflight = null;
    }

    async function tick() {
      halt();
      if (stopped || document.visibilityState === "hidden") return;
      const own = new AbortController();
      inflight = own;
      const result = await poll(own.signal);
      if (stopped || own.signal.aborted) return;
      inflight = null;
      if (result.ok) {
        failures = 0;
        const asked = last;
        const newest = result.data.blocks.at(-1)?.number;
        if (newest != null) last = Math.max(last ?? newest, newest);
        dispatch({ type: "received", blocks: result.data.blocks });
        // A stale CDN copy: keep what it held, then ask the same URL again once the cache has refreshed
        if (isStaleFeed(result.data, Date.now()) && quickRetries < MAX_QUICK_RETRIES) {
          quickRetries += 1;
          last = asked;
          timer = setTimeout(tick, QUICK_RETRY_MS);
          return;
        }
        quickRetries = 0;
        timer = setTimeout(tick, POLL_MS);
        return;
      }
      failures += 1;
      const { error } = result;
      const wait = error.kind === "rate_limited" && error.retryAfter ? error.retryAfter * 1000 : backoffMs(failures);
      dispatch({ type: "failed", error, retryAt: Date.now() + wait });
      timer = setTimeout(tick, wait);
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") halt();
      else void tick();
    }
    const onOnline = () => void tick();

    kick.current = () => {
      dispatch({ type: "retrying" });
      void tick();
    };
    void tick();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    return () => {
      stopped = true;
      halt();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, [network, offline]);

  useEffect(() => {
    if (!offline) return;
    let stopped = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    // The recording loads only in offline mode, and is checked like any API answer
    Promise.all([import("@/data/samples/live.json"), import("@/lib/schemas")]).then(
      ([recording, schemas]) => {
        if (stopped) return;
        const parsed = schemas.liveFeedSchema.safeParse(recording.default);
        if (!parsed.success) {
          dispatch({ type: "failed", error: { kind: "offline_miss", status: null, message: "The recorded live feed is unreadable" }, retryAt: Date.now() });
          return;
        }
        const feed: LiveFeed = parsed.data;
        const opening = Math.min(FEED_LIMIT, feed.blocks.length);
        let step = opening;
        dispatch({ type: "received", blocks: replayOpening(feed, opening, Date.now()) });
        timer = setInterval(() => {
          const next = replayBlock(feed, step, Date.now());
          step += 1;
          if (next) dispatch({ type: "received", blocks: [next] });
        }, BLOCK_SECONDS * 1000);
      },
      () => {
        if (!stopped) dispatch({ type: "failed", error: { kind: "offline_miss", status: null, message: "The recorded live feed did not load" }, retryAt: Date.now() });
      },
    );
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [offline]);

  const retry = useCallback(() => kick.current(), []);
  return { ...state, retry };
}
