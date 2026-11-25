"use client";

import { useEffect } from "react";
import { CloudOff } from "lucide-react";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <div role="alert" className="flex flex-col items-center gap-5 rounded-[2rem] bg-card px-6 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <CloudOff className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">This page didn&apos;t load</h1>
          <p className="max-w-[44ch] text-[17px] text-muted-foreground">
            We couldn&apos;t reach the activity list. Check your connection and try again.
          </p>
        </div>
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </Container>
  );
}
