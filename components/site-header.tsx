"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Mountain } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Activities", mobileLabel: "Activities" },
  { href: "/outings", label: "Group outings", mobileLabel: "Outings" },
]

export function SiteHeader() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/activities")
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 rounded-lg focus-visible:ring-3 focus-visible:ring-mist/50 focus-visible:outline-none"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Mountain className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block font-heading text-base font-semibold tracking-tight text-mist">
              Pokhara
            </span>
            <span className="mt-1 block text-[10px] font-semibold tracking-[0.22em] text-mist/60">
              BOOKING
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="flex items-center gap-1 text-sm sm:gap-2"
        >
          {LINKS.map((link) => (
            <Button
              key={link.href}
              nativeButton={false}
              render={
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                />
              }
              variant="ghost"
              className={cn(
                "h-9 rounded-lg px-3 font-medium text-mist/70 hover:bg-white/10 hover:text-mist sm:px-4",
                isActive(link.href) && "bg-white/10 text-mist"
              )}
            >
              <span className="sm:hidden">{link.mobileLabel}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Button>
          ))}
        </nav>

        <Button
          nativeButton={false}
          render={<Link href="/outings" />}
          className="hidden h-9 rounded-lg bg-mist px-4 font-semibold text-ink hover:bg-white sm:inline-flex"
        >
          Find an outing
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}
