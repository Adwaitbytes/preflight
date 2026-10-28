"use client";

import { CircleAlert, Hash, Wallet, X } from "lucide-react";
import { useId } from "react";
import { formatInt } from "@/lib/format";
import { ACTIVITY_KINDS, type ActivityKind } from "@/lib/live";
import { cn } from "@/lib/utils";
import { KIND_META } from "./kinds";

const CHIP =
  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-150";
const CHIP_OFF = "text-muted-foreground shadow-[0_0_0_1px_var(--line)] hover:bg-surface-2 hover:text-foreground";
const CHIP_ON = "bg-surface-2 text-foreground shadow-[0_0_0_1px_var(--line-strong)]";

const FIELD =
  "flex h-9 items-center gap-2 rounded-lg bg-surface px-2.5 shadow-[0_0_0_1px_var(--line)] transition-shadow focus-within:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_oklab,var(--ring)_22%,transparent)]";

export interface FilterControls {
  kinds: readonly ActivityKind[];
  onToggleKind: (kind: ActivityKind) => void;
  kindCounts: Record<ActivityKind, number>;
  subnetText: string;
  onSubnetText: (text: string) => void;
  subnetInvalid: boolean;
  addressText: string;
  onAddressText: (text: string) => void;
  addressInvalid: boolean;
  failuresOnly: boolean;
  onToggleFailures: () => void;
  failedCount: number;
  active: boolean;
  onClear: () => void;
}

export function LiveFilters(props: FilterControls) {
  const subnetId = useId();
  const addressId = useId();
  const addressHint = useId();

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Filter by kind" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,#000_6px,#000_calc(100%-24px),transparent)] sm:flex-wrap sm:[mask-image:none]">
        {/* Every kind stays put, even at zero, so counts changing never reflows the stream below */}
        {ACTIVITY_KINDS.map((kind) => {
          const meta = KIND_META[kind];
          const on = props.kinds.includes(kind);
          return (
            <button
              key={kind}
              type="button"
              aria-pressed={on}
              onClick={() => props.onToggleKind(kind)}
              className={cn(CHIP, on ? CHIP_ON : CHIP_OFF)}
            >
              <span aria-hidden className={cn("size-1.5 rounded-full", meta.dot)} />
              {meta.label}
              <span className="inline-block min-w-[3ch] text-left font-mono text-xs text-faint tnum">{formatInt(props.kindCounts[kind])}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-start gap-2">
        <div className="w-[7.5rem] shrink-0">
          <label htmlFor={subnetId} className="sr-only">
            Subnet
          </label>
          <div className={cn(FIELD, props.subnetInvalid && "shadow-[0_0_0_1px_var(--critical)]")}>
            <Hash className="size-3.5 shrink-0 text-faint" aria-hidden />
            <input
              id={subnetId}
              value={props.subnetText}
              onChange={(e) => props.onSubnetText(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              placeholder="Subnet"
              aria-invalid={props.subnetInvalid || undefined}
              className="w-full min-w-0 bg-transparent font-mono text-[13px] text-foreground outline-none placeholder:font-sans placeholder:text-faint"
            />
            {props.subnetText && (
              <button
                type="button"
                onClick={() => props.onSubnetText("")}
                aria-label="Clear subnet"
                className="-mr-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-faint hover:bg-surface-2 hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-[1_1_16rem]">
          <label htmlFor={addressId} className="sr-only">
            Follow a wallet
          </label>
          <div className={cn(FIELD, props.addressInvalid && "shadow-[0_0_0_1px_var(--critical)]")}>
            <Wallet className="size-3.5 shrink-0 text-faint" aria-hidden />
            <input
              id={addressId}
              value={props.addressText}
              onChange={(e) => props.onAddressText(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Follow a wallet, paste an ss58 address"
              aria-invalid={props.addressInvalid || undefined}
              aria-describedby={props.addressInvalid ? addressHint : undefined}
              className="w-full min-w-0 bg-transparent font-mono text-[13px] text-foreground outline-none placeholder:font-sans placeholder:text-faint"
            />
            {props.addressText && (
              <button
                type="button"
                onClick={() => props.onAddressText("")}
                aria-label="Stop following this wallet"
                className="-mr-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-faint hover:bg-surface-2 hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
          {props.addressInvalid && (
            <p id={addressHint} className="mt-1.5 px-1 text-xs text-critical">
              Paste the full 48 character address, starting with 5
            </p>
          )}
        </div>

        <button
          type="button"
          aria-pressed={props.failuresOnly}
          onClick={props.onToggleFailures}
          className={cn(
            CHIP,
            "h-9",
            props.failuresOnly ? "bg-critical-soft text-critical shadow-[0_0_0_1px_color-mix(in_oklab,var(--critical)_30%,transparent)]" : CHIP_OFF,
          )}
        >
          <CircleAlert className="size-3.5" aria-hidden />
          Failures only
          <span className={cn("inline-block min-w-[3ch] text-left font-mono text-xs tnum", props.failuresOnly ? "text-critical/80" : "text-faint")}>{formatInt(props.failedCount)}</span>
        </button>

        {props.active && (
          <button type="button" onClick={props.onClear} className={cn(CHIP, "h-9 text-muted-foreground hover:bg-surface-2 hover:text-foreground")}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
