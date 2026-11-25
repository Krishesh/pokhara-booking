import { Container } from "@/components/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container aria-busy="true" aria-label="Loading" className="space-y-6 pt-2">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <Skeleton className="aspect-[16/9] max-h-[480px] w-full rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-7">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-48 rounded-2xl lg:col-span-4 lg:col-start-9" />
      </div>
    </Container>
  );
}
