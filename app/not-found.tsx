import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Activity not found
        </h1>
        <p className="text-sm text-muted-foreground">
          The activity you&apos;re looking for doesn&apos;t exist or isn&apos;t
          available right now.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/" />}>
        ← All activities
      </Button>
    </div>
  );
}
