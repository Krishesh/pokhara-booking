"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setActivityPublished } from "@/app/admin/actions";
import { Switch } from "@/components/ui/switch";

export function PublishSwitch({ id, name, published }: { id: string; name: string; published: boolean }) {
  const [checked, setChecked] = useState(published);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch
        checked={checked}
        disabled={pending}
        aria-label={`Published: ${name}`}
        onCheckedChange={(next) => {
          setChecked(next);
          startTransition(async () => {
            const result = await setActivityPublished(id, next);
            if (result.ok) {
              toast.success(result.message);
              router.refresh();
            } else {
              setChecked(!next);
              toast.error(result.message);
            }
          });
        }}
      />
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>{checked ? "Live" : "Hidden"}</span>
    </label>
  );
}
