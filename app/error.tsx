"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-5 px-5 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h2 className="text-balance text-2xl font-bold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t load the activities right now. Please try again.
        </p>
      </div>
      <Button className="h-11 px-5" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
