"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyButton({
  text,
  label = "Copy",
  copiedMessage = "Copied",
  variant = "outline",
  size = "sm",
}: {
  text: string;
  label?: string;
  copiedMessage?: string;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "icon-sm";
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={size === "icon-sm" ? label : undefined}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success(copiedMessage);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Couldn't copy. Select the text and copy it manually.");
        }
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {size !== "icon-sm" && (copied ? "Copied" : label)}
    </Button>
  );
}
