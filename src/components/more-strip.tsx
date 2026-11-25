import Link from "next/link";

import { ActivityImage } from "@/components/activity-image";

export type StripItem = { href: string; title: string; detail: string; image_url: string | null };

/** A row of up to three photo links to related activities or outings. */
export function MoreStrip({ heading, items }: { heading: string; items: StripItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="more-heading" className="pt-16">
      <h2 id="more-heading" className="pb-4 text-xl font-semibold tracking-tight sm:text-2xl">
        {heading}
      </h2>
      <ul className="grid gap-5 sm:grid-cols-3">
        {items.slice(0, 3).map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group block space-y-2 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <ActivityImage
                src={item.image_url}
                alt={item.title}
                sizes="(min-width: 640px) 33vw, 100vw"
                className="aspect-[16/10] rounded-2xl"
                aspect="none"
              />
              <div className="px-1">
                <h3 className="text-base font-semibold group-hover:text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
