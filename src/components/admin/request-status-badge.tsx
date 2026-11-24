import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type RequestStatus } from "@/lib/admin/requests";

const VARIANT: Record<RequestStatus, "default" | "outline" | "secondary" | "destructive"> = {
  pending: "outline",
  confirmed: "default",
  rejected: "destructive",
  cancelled: "secondary",
};

export function RequestStatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <Badge variant={VARIANT[status]} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
