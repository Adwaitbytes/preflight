"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { detectLocalApi } from "@/lib/detect-local";
import { isNetwork, type NetworkId } from "@/lib/networks";

function shouldProbeLocal(stored: NetworkId | null): boolean {
  const { hostname, search } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1" || stored === "local" || new URLSearchParams(search).has("local");
}

interface AppState {
  offline: boolean;
  network: NetworkId;
  setNetwork: (network: NetworkId) => void;
  /** null while detection runs */
  localAvailable: boolean | null;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const AppStateContext = createContext<AppState | null>(null);
const STORAGE_KEY = "preflight.network";

function readStoredNetwork(): NetworkId | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isNetwork(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function AppStateProvider({ offline, children }: { offline: boolean; children: ReactNode }) {
  const [network, setNetworkState] = useState<NetworkId>("finney");
  const [localAvailable, setLocalAvailable] = useState<boolean | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const stored = readStoredNetwork();
    // A hosted visitor with no local API would get a failed request in the console on every
    // page; probe only on a local origin, after choosing Local before, or with ?local=1.
    const probe = shouldProbeLocal(stored) ? detectLocalApi() : Promise.resolve(false);
    probe.then((available) => {
      if (cancelled) return;
      setLocalAvailable(available);
      if (stored && (stored !== "local" || available)) setNetworkState(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setNetwork = useCallback((next: NetworkId) => {
    setNetworkState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice still holds for this visit
    }
  }, []);

  const value = useMemo(
    () => ({ offline, network, setNetwork, localAvailable, paletteOpen, setPaletteOpen }),
    [offline, network, setNetwork, localAvailable, paletteOpen],
  );
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const state = useContext(AppStateContext);
  if (!state) throw new Error("useAppState must be used inside AppStateProvider");
  return state;
}
