import Link from "next/link";
import { Compass } from "lucide-react";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container>
      <div className="flex flex-col items-center gap-5 rounded-[2rem] bg-card px-6 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-teal-soft text-primary">
          <Compass className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">We couldn&apos;t find that page</h1>
          <p className="max-w-[44ch] text-[17px] text-muted-foreground">
            The activity or outing may have been unpublished, or the link is mistyped.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/" />}>
            See all activities
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/outings" />}>
            Group outings
          </Button>
        </div>
      </div>
    </Container>
  );
}
