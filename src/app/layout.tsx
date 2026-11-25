import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { SiteFooter, SiteFooterView } from "@/components/site-footer";
import { SiteHeader, SiteHeaderView } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pokhara Booking",
    template: "%s · Pokhara Booking",
  },
  description: "Compare and request adventure activities in Pokhara, Nepal.",
  applicationName: "Pokhara Booking",
  openGraph: {
    type: "website",
    siteName: "Pokhara Booking",
    title: "Pokhara Booking",
    description: "Compare paragliding, boating, ziplines and hikes from local companies in Pokhara, Nepal.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a5640",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Suspense fallback={<SiteHeaderView pathname="" />}>
          <SiteHeader />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <Suspense fallback={<SiteFooterView admin={false} />}>
          <SiteFooter />
        </Suspense>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
