import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PageTitle({
  back,
  backLabel,
  title,
  description,
  viewHref,
}: {
  back: string;
  backLabel: string;
  title: string;
  description?: string;
  viewHref?: string;
}) {
  return (
    <div className="space-y-2">
      <Link href={back} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {viewHref && (
          <Button variant="outline" nativeButton={false} render={<Link href={viewHref} target="_blank" />}>
            View on website
            <ExternalLink aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
