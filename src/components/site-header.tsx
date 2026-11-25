"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { Container } from "@/components/container";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Activities", short: "Activities", match: (p: string) => p === "/" || p.startsWith("/activities") },
  { href: "/outings", label: "Group outings", short: "Outings", match: (p: string) => p.startsWith("/outings") },
];

export function SiteHeader() {
  return <SiteHeaderView pathname={usePathname()} />;
}

/** Header without hooks; the Suspense fallback renders it with an empty pathname. */
export function SiteHeaderView({ pathname }: { pathname: string }) {
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="relative z-20 bg-background">
      <Container className="flex h-16 items-center gap-4">
        <Link
          href={isAdmin ? "/admin" : "/"}
          className="shrink-0 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Image src="/brand/logo.png" alt="Pokhara Booking" width={644} height={144} priority className="h-8 w-auto sm:h-9" />
        </Link>
        {isAdmin && (
          <>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-accent-foreground">Staff admin</span>
            <Link
              href="/"
              target="_blank"
              className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-primary hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="hidden sm:inline">View site</span>
              <span className="sr-only sm:hidden">View site</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
          </>
        )}
        {!isAdmin && (
          <nav aria-label="Main" className="ml-auto flex items-center gap-1 text-sm">
            {LINKS.map(({ href, label, short, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:px-4",
                    active ? "bg-card text-foreground" : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                  )}
                >
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </Container>
    </header>
  );
}
