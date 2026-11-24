"use client";

import { usePathname, useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Option } from "@/lib/admin/data";

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

  const update = (key: "activity" | "status", value: string) => {
    const params = new URLSearchParams();
    const next = { activity: activityId, status, [key]: value };
    if (next.activity) params.set("activity", next.activity);
    if (next.status) params.set("status", next.status);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="filter-activity">Activity</Label>
        <NativeSelect id="filter-activity" value={activityId} onChange={(e) => update("activity", e.target.value)}>
          <NativeSelectOption value="">All activities</NativeSelectOption>
          {activities.map((a) => (
            <NativeSelectOption key={a.id} value={a.id}>
              {a.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="filter-status">Status</Label>
        <NativeSelect id="filter-status" value={status} onChange={(e) => update("status", e.target.value)}>
          <NativeSelectOption value="">All statuses</NativeSelectOption>
          <NativeSelectOption value="verified">Verified</NativeSelectOption>
          <NativeSelectOption value="unverified">Unverified</NativeSelectOption>
          <NativeSelectOption value="outdated">Outdated</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  );
}
