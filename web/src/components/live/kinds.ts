import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  CircleDot,
  EyeOff,
  FileLock2,
  Hexagon,
  Scale,
  Server,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { ActivityKind } from "@/lib/live";

interface KindMeta {
  /** Chip label for a group of these */
  label: string;
  /** Read before the sentence by screen readers */
  noun: string;
  icon: LucideIcon;
  /** Icon tile: one restrained semantic tint per family of actions */
  tile: string;
  /** Dot beside the filter chip */
  dot: string;
  /** Routine chain upkeep: its sentence recedes so stake, transfers and failures stand out */
  quiet: boolean;
}

const ACCENT = { tile: "bg-accent-soft text-accent-ink", dot: "bg-accent", quiet: false };
const HEALTHY = { tile: "bg-healthy-soft text-healthy", dot: "bg-healthy", quiet: false };
const MEDIUM = { tile: "bg-medium-soft text-medium", dot: "bg-medium", quiet: false };
const HIGH = { tile: "bg-high-soft text-high", dot: "bg-high", quiet: false };
const QUIET = { tile: "bg-surface-2 text-muted-foreground", dot: "bg-faint", quiet: true };

export const KIND_META: Record<ActivityKind, KindMeta> = {
  weights: { label: "Weights", noun: "Weights", icon: Scale, ...QUIET },
  register: { label: "Registrations", noun: "Registration", icon: UserPlus, ...HEALTHY },
  stake: { label: "Stake", noun: "Stake", icon: ArrowDownToLine, ...HEALTHY },
  unstake: { label: "Unstake", noun: "Unstake", icon: ArrowUpFromLine, ...MEDIUM },
  transfer: { label: "Transfers", noun: "Transfer", icon: ArrowLeftRight, ...ACCENT },
  serve: { label: "Serving", noun: "Serve", icon: Server, ...QUIET },
  commitment: { label: "Commitments", noun: "Commitment", icon: FileLock2, ...QUIET },
  subnet: { label: "Subnet ops", noun: "Subnet operation", icon: Boxes, ...HIGH },
  shielded: { label: "Shielded", noun: "Shielded transaction", icon: EyeOff, ...QUIET },
  evm: { label: "EVM", noun: "EVM transaction", icon: Hexagon, ...QUIET },
  other: { label: "Other", noun: "Other call", icon: CircleDot, ...QUIET },
};

export const FAILED_TILE = "bg-critical-soft text-critical";
