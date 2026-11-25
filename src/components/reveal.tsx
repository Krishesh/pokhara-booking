"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DELAYS = ["", "[animation-delay:80ms]", "[animation-delay:160ms]", "[animation-delay:240ms]"];

/**
 * Rises its children into place the first time they scroll into view.
 * Content is visible in the server HTML; it is only hidden after hydration, and only
 * when it starts below the fold, so nothing stays hidden if the script fails.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "li" | "section";
  delay?: 0 | 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"static" | "waiting" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(state === "waiting" && "opacity-0", state === "shown" && ["animate-rise", DELAYS[delay]], className)}
    >
      {children}
    </Tag>
  );
}
