import Image from "next/image";
import { Mountain } from "lucide-react";

import { cn } from "@/lib/utils";

type ActivityImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** 16:9 activity image, or a muted placeholder with a mountain icon when there is no image. */
export function ActivityImage({ src, alt, className, priority }: ActivityImageProps) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-muted", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${alt} (no photo available)`}
          className="flex size-full items-center justify-center text-muted-foreground"
        >
          <Mountain className="size-10" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
