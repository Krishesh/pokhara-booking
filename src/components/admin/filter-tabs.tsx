import Link from "next/link";

import { cn } from "@/lib/utils";

export type FilterTab = { key: string; label: string; count: number; href: string };

/** Pill tabs with counts for admin lists. Links, so the filter lives in the URL and works without JavaScript. */
export function FilterTabs({ label, tabs, active }: { label: string; tabs: FilterTab[]; active: string }) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-mist hover:text-foreground",
            )}
          >
            {t.label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", isActive ? "bg-white/20" : "bg-muted text-muted-foreground")}>
              {t.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
