import { Pickaxe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** From a subnet page to its mining economics, keeping a non default network */
export function MineLink({ netuid, network, className }: { netuid: number; network: string; className?: string }) {
  const href = `/subnets/${netuid}/mine${network === "finney" ? "" : `?network=${encodeURIComponent(network)}`}`;
  return (
    <Button asChild variant="secondary" size="sm" className={className}>
      <Link href={href}>
        <Pickaxe className="size-3.5" aria-hidden />
        Should I mine here?
      </Link>
    </Button>
  );
}
