import type { Diagnosis, DoctorReport } from "./types";

/** PF101 not_registered: the hotkey holds no UID on the subnet */
export const NOT_REGISTERED_RULE = "PF101";

/** No UID on this subnet and nothing else wrong: a starting point, not a broken neuron */
export function isUnregisteredOnly(diagnosis: Diagnosis): boolean {
  return diagnosis.role === "unregistered" && diagnosis.findings.every((f) => f.id === NOT_REGISTERED_RULE);
}

/** True when every diagnosis is only "not registered", including when no subnet was diagnosed at all */
export function isOnlyUnregistered(report: DoctorReport): boolean {
  return report.diagnoses.every(isUnregisteredOnly);
}
