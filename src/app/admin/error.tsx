"use client";

import { useEffect } from "react";
import { CloudOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <CloudOff className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Couldn&apos;t load this admin page</h1>
          <p className="text-sm text-muted-foreground">
            Check your connection and try again. If it keeps failing, check that SUPABASE_SERVICE_ROLE_KEY and
            ADMIN_PASSWORD are set in .env.local.
          </p>
        </div>
      </div>
      <Button onClick={() => retry()} className="shrink-0">
        Try again
      </Button>
    </div>
  );
}
