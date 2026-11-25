"use client";

import { usePathname, useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Option } from "@/lib/admin/data";

/** Activity picker for the offers list; keeps the status filter in the URL. */
export function OfferFilters({
  activities,
  activityId,
  status,
}: {
  activities: Option[];
  activityId: string;
  status: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const update = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("activity", value);
    if (status) params.set("status", status);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="filter-activity" className="shrink-0 text-sm text-muted-foreground">
        Activity
      </Label>
      <NativeSelect id="filter-activity" value={activityId} onChange={(e) => update(e.target.value)} className="w-full sm:w-64">
        <NativeSelectOption value="">All activities</NativeSelectOption>
        {activities.map((a) => (
          <NativeSelectOption key={a.id} value={a.id}>
            {a.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
