import { STATUS_LABELS, type RequestStatus } from "@/lib/admin/requests";
import { cn } from "@/lib/utils";

const STYLE: Record<RequestStatus, { className: string; dot: string }> = {
  pending: { className: "bg-sunrise-soft text-sunrise", dot: "bg-sunrise" },
  confirmed: { className: "bg-accent text-accent-foreground", dot: "bg-primary" },
  rejected: { className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  cancelled: { className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

export function RequestStatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STYLE[status].className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", STYLE[status].dot)} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
