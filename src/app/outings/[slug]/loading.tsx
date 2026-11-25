import { Container } from "@/components/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container aria-busy="true" aria-label="Loading outing" className="space-y-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-[58svh] max-h-[680px] min-h-[400px] w-full rounded-[2rem]" />
      <Skeleton className="h-24 w-full rounded-3xl" />
      <div className="grid gap-10 pt-8 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-7">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>
        <Skeleton className="h-96 rounded-3xl lg:col-span-4 lg:col-start-9" />
      </div>
    </Container>
  );
}
