import { Badge } from "@/components/ui/badge";
import type { OutingState } from "@/lib/outings";

export function OutingStateBadge({ state }: { state: OutingState }) {
  if (state === "cancelled") return <Badge variant="destructive">Cancelled</Badge>;
  if (state === "past") return <Badge variant="secondary">Took place</Badge>;
  if (state === "draft") return <Badge variant="outline">Draft</Badge>;
  return null;
}
