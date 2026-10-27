"use client";

import { Check, MapPin } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { HouseStats } from "@/lib/api";
import { joinHouse } from "@/lib/client-calls";

const ID_KEY = "preflight.house.id";
const JOINED_KEY = "preflight.house.joined";

function readFlag(): boolean {
  try {
    return window.localStorage.getItem(JOINED_KEY) === "1";
  } catch {
    return false;
  }
}

/** A random id for this browser only. It identifies nothing but "one opted in builder" */
function browserId(): string {
  try {
    const existing = window.localStorage.getItem(ID_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const created = crypto.randomUUID().replaceAll("-", "");
    window.localStorage.setItem(ID_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID().replaceAll("-", "");
  }
}

export function JoinHouse({ onJoined }: { onJoined?: (stats: HouseStats) => void }) {
  const [joined, setJoined] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // localStorage only exists in the browser, so the joined state resolves after hydration
  useEffect(() => {
    const flag = readFlag();
    const frame = requestAnimationFrame(() => setJoined(flag));
    return () => cancelAnimationFrame(frame);
  }, []);

  function join() {
    setError(null);
    startTransition(async () => {
      const result = await joinHouse(browserId());
      if (!result.ok) {
        setError(result.error.kind === "offline_miss" ? "Counting is off in the offline demo" : "Could not reach the counter. Try again in a minute");
        return;
      }
      try {
        window.localStorage.setItem(JOINED_KEY, "1");
      } catch {
        // Without storage the next visit offers the button again; the server dedupes the id
      }
      setJoined(true);
      onJoined?.(result.data);
    });
  }

  if (joined) {
    return (
      <p role="status" className="inline-flex items-center gap-2 text-sm text-healthy">
        <Check className="size-4" aria-hidden />
        You are counted as a builder at the House
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="accent" onClick={join} disabled={pending || joined === null}>
        <MapPin aria-hidden />
        {pending ? "Counting you" : "I am at the Builders House"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-faint">
          {error}
        </p>
      )}
    </div>
  );
}
