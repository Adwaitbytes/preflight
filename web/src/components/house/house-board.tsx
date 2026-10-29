"use client";

import { useState } from "react";
import type { HouseStats } from "@/lib/api";
import { formatInt } from "@/lib/format";
import { JoinHouse } from "./join-house";

function formatSince(since: string): string {
  const date = new Date(`${since}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? since : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function HouseBoard({ initial }: { initial: HouseStats }) {
  const [stats, setStats] = useState(initial);
  const items = [
    { label: "Diagnoses run", value: stats.diagnoses, note: "Doctor reads of a hotkey" },
    { label: "Errors explained", value: stats.errors, note: "Failed extrinsics and pasted errors" },
    { label: "Simulations", value: stats.simulations, note: "Transactions tried before paying" },
    { label: "Builders helped", value: stats.builders, note: "Opted in from this page" },
  ];
  return (
    <div className="flex flex-col gap-8">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line shadow-[0_0_0_1px_var(--line)] lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="bg-surface px-5 py-7 sm:px-6">
            <dt className="text-[13px] text-muted-foreground">{item.label}</dt>
            <dd className="mt-3 text-5xl font-light tracking-[-0.05em] text-foreground tabular-nums sm:text-6xl">{formatInt(item.value)}</dd>
            <dd className="mt-2 text-xs text-faint">{item.note}</dd>
          </div>
        ))}
      </dl>
      <div className="panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="max-w-[56ch]">
          <h2 className="text-[15px] font-semibold">At the Builders House today</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Press once to be counted. Preflight stores a random id made in this browser and nothing else: no name, no wallet, no keys, no hotkeys
          </p>
        </div>
        <JoinHouse onJoined={setStats} />
      </div>
      <p className="text-xs text-faint">Counting since {formatSince(stats.since)}</p>
    </div>
  );
}
