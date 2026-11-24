import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pokhara Booking",
    template: "%s · Pokhara Booking",
  },
  description: "Compare and request adventure activities in Pokhara, Nepal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Pokhara Booking
            </Link>
            <nav aria-label="Main" className="ml-auto flex items-center gap-1 text-sm">
              <Link href="/" className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                Activities
              </Link>
              <Link
                href="/outings"
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Group outings
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t">
          <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground">
            Demo site: the companies, prices and group outings shown are fictional. Photos from Wikimedia Commons, credited
            under each image.
          </p>
        </footer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
