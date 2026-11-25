"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Couldn&apos;t load this admin page</h1>
        <p className="text-muted-foreground">
          Check your connection and try again. If it keeps failing, check that SUPABASE_SERVICE_ROLE_KEY and
          ADMIN_PASSWORD are set.
        </p>
      </div>
      <Button onClick={() => retry()}>Try again</Button>
    </div>
  );
}
