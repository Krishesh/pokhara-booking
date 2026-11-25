import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full py-1.5 pr-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
      {label}
    </Link>
  );
}
