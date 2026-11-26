import Link from "next/link"
import { Mountain } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card/60 sm:mt-28">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 text-sm sm:grid-cols-3 sm:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Mountain className="size-4" aria-hidden="true" />
            </span>
            <span className="font-heading font-bold tracking-tight">
              Pokhara Booking
            </span>
          </div>
          <p className="max-w-[40ch] text-muted-foreground">
            Compare adventure activities in Pokhara and send a booking request.
            Nothing is charged online.
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-2">
          <h2 className="font-semibold">Explore</h2>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>
              <Link
                href="/"
                className="rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Activities
              </Link>
            </li>
            <li>
              <Link
                href="/outings"
                className="rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Group outings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-2">
          <h2 className="font-semibold">About this demo</h2>
          <p className="max-w-[46ch] text-muted-foreground">
            Companies, prices and outings are fictional. Photos from Wikimedia
            Commons, credited under each image; home photo by Jean-Marie Hullot
            (CC BY 2.0), outings photo by Prasan Shrestha (CC BY-SA 4.0).
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl border-t border-border px-5 py-5 text-xs text-muted-foreground sm:px-8">
        Built as a simple booking demo for Pokhara activities and group outings.
      </div>
    </footer>
  )
}
