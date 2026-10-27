"use client";

import { useCallback, useEffect, useState } from "react";
import { DoctorSkeleton } from "@/components/doctor/doctor-skeleton";
import { DoctorView } from "@/components/doctor/doctor-view";
import { PlanView } from "@/components/plan/plan-view";
import { Directory } from "@/components/subnets/directory";
import { SubnetDetailView } from "@/components/subnets/subnet-detail-view";
import { TxView } from "@/components/tx/tx-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/ui/state";
import type { ApiResult } from "@/lib/api";
import { browserApi } from "@/lib/browser-api";
import type { DoctorReport, LaunchPlan, SubnetCard, SubnetDetail, TxReport } from "@/lib/types";
import { REFETCH_EVENT } from "./refresh-button";

export type LocalRequest =
  | { kind: "doctor"; hotkey: string; netuid: number | null }
  | { kind: "tx"; ref: string }
  | { kind: "subnets"; query: string }
  | { kind: "subnet"; netuid: number }
  | { kind: "plan" };

type LocalData =
  | { kind: "doctor"; data: DoctorReport }
  | { kind: "tx"; data: TxReport }
  | { kind: "subnets"; data: SubnetCard[] }
  | { kind: "subnet"; data: SubnetDetail }
  | { kind: "plan"; data: LaunchPlan };

async function load(request: LocalRequest): Promise<ApiResult<LocalData>> {
  const api = browserApi("local");
  switch (request.kind) {
    case "doctor": {
      const r = await api.doctor("local", request.hotkey, { netuid: request.netuid });
      return r.ok ? { ok: true, data: { kind: "doctor", data: r.data } } : r;
    }
    case "tx": {
      const r = await api.tx("local", request.ref);
      return r.ok ? { ok: true, data: { kind: "tx", data: r.data } } : r;
    }
    case "subnets": {
      const r = await api.subnets("local");
      return r.ok ? { ok: true, data: { kind: "subnets", data: r.data } } : r;
    }
    case "subnet": {
      const r = await api.subnet("local", request.netuid);
      return r.ok ? { ok: true, data: { kind: "subnet", data: r.data } } : r;
    }
    case "plan": {
      const r = await api.plan("local");
      return r.ok ? { ok: true, data: { kind: "plan", data: r.data } } : r;
    }
  }
}

/**
 * Views for the Local network. The hosted server cannot see the user's machine, so the
 * browser calls `preflight serve` on 127.0.0.1 directly and renders the same views.
 */
export function LocalView({ request }: { request: LocalRequest }) {
  const key = JSON.stringify(request);
  const [nonce, setNonce] = useState(0);
  const tag = `${key}#${nonce}`;
  // The result remembers which request produced it, so a new request shows the skeleton
  const [loaded, setLoaded] = useState<{ tag: string; result: ApiResult<LocalData> } | null>(null);
  const result = loaded?.tag === tag ? loaded.result : null;
  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    load(JSON.parse(key) as LocalRequest).then((next) => {
      if (!cancelled) setLoaded({ tag: `${key}#${nonce}`, result: next });
    });
    return () => {
      cancelled = true;
    };
  }, [key, nonce]);

  useEffect(() => {
    window.addEventListener(REFETCH_EVENT, refetch);
    return () => window.removeEventListener(REFETCH_EVENT, refetch);
  }, [refetch]);

  if (!result) {
    return request.kind === "doctor" ? <DoctorSkeleton /> : <Skeleton className="mt-10 h-96 rounded-xl" />;
  }
  if (!result.ok) {
    return (
      <div className="py-14">
        <ApiErrorState
          error={result.error}
          action={
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }
  const view = result.data;
  switch (view.kind) {
    case "doctor":
      return <DoctorView report={view.data} network="local" />;
    case "tx":
      return <TxView report={view.data} network="local" />;
    case "subnets":
      return <Directory cards={view.data} network="local" initialQuery={request.kind === "subnets" ? request.query : ""} />;
    case "subnet":
      return <SubnetDetailView detail={view.data} network="local" />;
    case "plan":
      return <PlanView plan={view.data} />;
  }
}
