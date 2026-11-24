"use client";

import { useState } from "react";

import { CopyButton } from "@/components/admin/copy-button";
import { cn } from "@/lib/utils";

export function MessageTemplates({
  templates,
  initialKey,
}: {
  templates: { key: string; title: string; text: string }[];
  initialKey: string;
}) {
  const [active, setActive] = useState(initialKey);
  const current = templates.find((t) => t.key === active) ?? templates[0];

  return (
    <div className="grid gap-3">
      <div role="tablist" aria-label="Message" className="flex flex-wrap gap-1">
        {templates.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === current.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
              t.key === current.key ? "bg-muted font-medium" : "text-muted-foreground",
            )}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="grid gap-2">
        <pre className="rounded-lg border bg-muted/40 p-3 font-sans text-sm whitespace-pre-wrap">{current.text}</pre>
        <div>
          <CopyButton text={current.text} label="Copy message" copiedMessage="Message copied. Paste it into WhatsApp, SMS or email." />
        </div>
      </div>
    </div>
  );
}
