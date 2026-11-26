import type { Metadata } from "next"
import { Inter, Sora } from "next/font/google"
import { Suspense } from "react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://pokhara-booking.vercel.app"),
  title: {
    default: "Pokhara Booking",
    template: "%s · Pokhara Booking",
  },
  description: "Compare and request adventure activities in Pokhara, Nepal.",
  applicationName: "Pokhara Booking",
  openGraph: {
    title: "Pokhara Booking",
    description:
      "Compare paragliding, boating, ziplines and hikes from local companies in Pokhara, Nepal.",
    siteName: "Pokhara Booking",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokhara Booking",
    description:
      "Compare paragliding, boating, ziplines and hikes from local companies in Pokhara, Nepal.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", inter.variable, sora.variable)}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Suspense fallback={<div className="h-16 bg-ink" />}>
          <SiteHeader />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
