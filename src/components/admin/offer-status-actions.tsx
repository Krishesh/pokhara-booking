"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { setOfferStatus } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { VerificationStatus } from "@/lib/types";

export function OfferStatusActions({
  id,
  label,
  status,
}: {
  id: string;
  label: string;
  status: VerificationStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (next: VerificationStatus) =>
    startTransition(async () => {
      const result = await setOfferStatus(id, next);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });

  return (
    <div className="flex gap-1">
      {pending && <Loader2 className="size-4 animate-spin self-center text-muted-foreground" aria-label="Saving" />}
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => run("verified")}
        aria-label={`Mark ${label} verified`}
        title={status === "verified" ? "Price re-confirmed today: updates the price-checked date" : "Price confirmed with the vendor today"}
      >
        <BadgeCheck aria-hidden="true" />
        <span className="hidden lg:inline">{status === "verified" ? "Re-check" : "Verify"}</span>
      </Button>
      {status !== "outdated" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => run("outdated")}
          aria-label={`Mark ${label} outdated`}
          title="Hide this offer from the website"
        >
          <Archive aria-hidden="true" />
          <span className="hidden lg:inline">Outdated</span>
        </Button>
      )}
    </div>
  );
}
