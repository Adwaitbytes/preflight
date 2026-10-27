import { summarizeDoctor, summarizeSim, summarizeTx, type Summary } from "./report-summary";
import type { SharedReport } from "./schemas";

export function summarizeShared(shared: SharedReport): Summary {
  switch (shared.kind) {
    case "doctor":
      return summarizeDoctor(shared.payload);
    case "tx":
      return summarizeTx(shared.payload);
    case "sim":
      return summarizeSim(shared.payload);
  }
}
