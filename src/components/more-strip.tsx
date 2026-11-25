import Link from "next/link";

import { ActivityImage } from "@/components/activity-image";
import { Reveal } from "@/components/reveal";

export type StripItem = { href: string; title: string; detail: string; image_url: string | null };

/** A row of up to three photo links to related activities or outings. */
export function MoreStrip({ heading, items }: { heading: string; items: StripItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="more-heading" className="pt-24 sm:pt-32">
      <h2 id="more-heading" className="pb-8 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {heading}
      </h2>
      <ul className="grid gap-6 sm:grid-cols-3">
        {items.slice(0, 3).map((item, i) => (
          <Reveal as="li" key={item.href} delay={i as 0 | 1 | 2}>
            <Link
              href={item.href}
              className="group block space-y-3 rounded-3xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <ActivityImage
                src={item.image_url}
                alt={item.title}
                sizes="(min-width: 640px) 33vw, 100vw"
                className="aspect-[4/3] rounded-3xl [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-[1.04]"
                aspect="none"
              />
              <div className="px-1">
                <h3 className="text-xl font-bold tracking-tight group-hover:text-primary">{item.title}</h3>
                <p className="text-base text-muted-foreground">{item.detail}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
