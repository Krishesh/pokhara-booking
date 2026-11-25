"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";

export function SiteFooter() {
  return <SiteFooterView admin={usePathname().startsWith("/admin")} />;
}

/** Footer without hooks; the Suspense fallback renders the public version. */
export function SiteFooterView({ admin }: { admin: boolean }) {
  if (admin) {
    return (
      <footer className="mt-16 bg-card">
        <Container className="flex flex-wrap justify-between gap-2 py-5 text-sm text-muted-foreground">
          <p>Pokhara Booking staff admin</p>
          <p>Demo data: companies, prices and outings are fictional.</p>
        </Container>
      </footer>
    );
  }

  return (
    <footer className="mt-24 overflow-hidden bg-ink text-mist sm:mt-40">
      <Container className="grid gap-10 pt-14 sm:grid-cols-2 sm:pt-20 lg:grid-cols-4">
        <div className="space-y-2">
          <h2 className="text-[15px] font-semibold text-white">Explore</h2>
          <ul className="space-y-1.5 text-[15px] text-mist/80">
            <li>
              <Link href="/" className="rounded-sm hover:text-white focus-visible:ring-3 focus-visible:ring-mist/50 focus-visible:outline-none">
                Activities, A to Z
              </Link>
            </li>
            <li>
              <Link href="/outings" className="rounded-sm hover:text-white focus-visible:ring-3 focus-visible:ring-mist/50 focus-visible:outline-none">
                Group outings
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="text-[15px] font-semibold text-white">How booking works</h2>
          <p className="max-w-[34ch] text-[15px] text-mist/80">
            You send a request, we check it with the company and contact you. Nothing is charged online.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-[15px] font-semibold text-white">About this demo</h2>
          <p className="max-w-[34ch] text-[15px] text-mist/80">
            The companies, prices and group outings shown are fictional.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-[15px] font-semibold text-white">Photographs</h2>
          <p className="max-w-[34ch] text-[15px] text-mist/80">
            From Wikimedia Commons, credited under each image. Phewa Lake by Jean-Marie Hullot, CC BY 2.0. Pokhara at
            dawn by Prasan Shrestha, CC BY-SA 4.0.
          </p>
        </div>
      </Container>

      <Container className="pt-16 sm:pt-28">
        <svg viewBox="0 0 1000 205" className="block w-full fill-white" role="img" aria-label="Pokhara">
          <text
            x="0"
            y="180"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            className="font-sans text-[230px] font-extrabold tracking-tighter"
          >
            Pokhara
          </text>
        </svg>
        <p className="pt-4 pb-8 text-[13px] text-mist/70">
          Pokhara Booking is a demo marketplace for adventure companies in Pokhara, Nepal.
        </p>
      </Container>
    </footer>
  );
}
