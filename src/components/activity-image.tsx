import Image from "next/image";
import { Mountain } from "lucide-react";

import { cn } from "@/lib/utils";

type ActivityImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** "video" keeps a 16:9 box; "none" lets className set the size. */
  aspect?: "video" | "none";
};

/**
 * Activity or outing photo, lazy-loaded unless `priority` is set (use it for images in the first screen).
 * Shows a quiet placeholder with a mountain icon when there is no photo.
 */
export function ActivityImage({
  src,
  alt,
  className,
  priority,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  aspect = "video",
}: ActivityImageProps) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-muted", aspect === "video" && "aspect-video", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          loading={priority ? undefined : "lazy"}
          decoding="async"
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${alt} (no photo available)`}
          className="flex size-full items-center justify-center bg-teal-soft text-primary/60"
        >
          <Mountain className="size-10" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
