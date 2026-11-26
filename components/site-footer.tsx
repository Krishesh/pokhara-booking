import Link from "next/link"
import { Mountain } from "lucide-react"

const FOOTER_LINKS = [
  { href: "/", label: "Activities" },
  { href: "/outings", label: "Group outings" },
]

const linkClassName =
  "rounded-sm text-mist/70 transition-colors hover:text-mist focus-visible:ring-3 focus-visible:ring-mist/50 focus-visible:outline-none"

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-ink text-mist sm:mt-28">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_0.7fr_1.2fr] lg:gap-12 lg:px-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Mountain className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              Pokhara Booking
            </span>
          </div>
          <p className="max-w-[42ch] text-sm leading-relaxed text-mist/70">
            Compare adventure activities in Pokhara and send a booking request.
            Nothing is charged online.
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Explore
          </h2>
          <ul className="space-y-2 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClassName}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            About this demo
          </h2>
          <p className="max-w-[52ch] text-sm leading-relaxed text-mist/70">
            Companies, prices and outings are fictional. Photos from Wikimedia
            Commons, credited under each image; home photo by Jean-Marie Hullot
            (CC BY 2.0), outings photo by Prasan Shrestha (CC BY-SA 4.0).
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 border-t border-white/10 px-5 py-6 text-xs text-mist/60 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>
          Built as a simple booking demo for Pokhara activities and group
          outings.
        </p>
        <p className="sm:text-right">Pokhara, Nepal</p>
      </div>
    </footer>
  )
}
