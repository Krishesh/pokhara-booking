"use client";

import Image from "next/image";
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

  const link =
    "rounded-sm hover:text-white focus-visible:ring-3 focus-visible:ring-mist/50 focus-visible:outline-none";

  return (
    <footer className="mt-20 overflow-hidden bg-ink text-mist sm:mt-28">
      <Container className="grid gap-8 py-12 text-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.4fr]">
        <div className="space-y-3">
          <Image src="/brand/logo-light.png" alt="Pokhara Booking" width={644} height={144} className="h-9 w-auto" />
          <p className="max-w-[40ch] text-mist/75">
            Compare adventure activities in Pokhara and send a booking request. Nothing is charged online.
          </p>
        </div>
        <nav aria-label="Footer" className="space-y-2">
          <h2 className="font-semibold text-white">Explore</h2>
          <ul className="space-y-1.5 text-mist/75">
            <li>
              <Link href="/" className={link}>
                Activities
              </Link>
            </li>
            <li>
              <Link href="/outings" className={link}>
                Group outings
              </Link>
            </li>
          </ul>
        </nav>
        <div className="space-y-2">
          <h2 className="font-semibold text-white">About this demo</h2>
          <p className="max-w-[44ch] text-mist/75">
            Companies, prices and outings are fictional. Photos from Wikimedia Commons, credited under each image;
            home photo by Jean-Marie Hullot (CC BY 2.0), outings photo by Prasan Shrestha (CC BY-SA 4.0).
          </p>
        </div>
      </Container>

      <Container className="pt-4 pb-8 sm:pt-10">
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
      </Container>
    </footer>
  );
}
