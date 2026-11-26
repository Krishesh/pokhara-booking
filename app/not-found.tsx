import Link from "next/link";
import { ArrowLeft, Mountain } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-5 px-5 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Mountain className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-balance text-2xl font-bold tracking-tight">
          Activity not found
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The activity you&apos;re looking for doesn&apos;t exist or isn&apos;t
          available right now.
        </p>
      </div>
      <Button
        nativeButton={false}
        render={<Link href="/" />}
        className="h-11 px-5"
      >
        <ArrowLeft aria-hidden="true" />
        All activities
      </Button>
    </div>
  );
}
