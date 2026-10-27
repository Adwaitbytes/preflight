import { SAMPLE_REPORTS } from "@/lib/offline";
import type { Diagnosis, Finding } from "@/lib/types";

/** A diagnosis from the recorded finney samples. Throws at build time if a sample changes shape */
export function sampleDiagnosis(hotkey: string, netuid: number): Diagnosis {
  const report = SAMPLE_REPORTS.find((r) => r.hotkey === hotkey);
  const diagnosis = report?.diagnoses.find((d) => d.netuid === netuid);
  if (!diagnosis) throw new Error(`No recorded diagnosis for ${hotkey} on SN${netuid}`);
  return diagnosis;
}

export function sampleFindings(hotkey: string, netuid: number, ids: string[]): { findings: Finding[]; block: number } {
  const diagnosis = sampleDiagnosis(hotkey, netuid);
  const findings = ids.map((id) => {
    const found = diagnosis.findings.find((f) => f.id === id);
    if (!found) throw new Error(`No recorded ${id} for ${hotkey} on SN${netuid}`);
    return found;
  });
  return { findings, block: diagnosis.chain.block };
}

export const HOTKEYS = {
  /** UID 0 on SN64, earning nothing */
  brokenMiner: "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq",
  /** Registered on SN26, SN54, SN51 and SN64 */
  multiSubnet: "5CSa1rZAzh8Nf9nT9wMBghE6DPzTFoEdWZaRXD6mdVBkVJhw",
  /** UID 1 on SN64, a healthy validator */
  validator: "5DU1dvXbvjVRs5omKrbZzLNB6ZL9uNnzQrS1H8MFcSdFS7ww",
  /** Not registered on SN64 */
  unregistered: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
} as const;
