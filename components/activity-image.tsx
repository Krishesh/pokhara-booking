import Image from "next/image";
import { Mountain } from "lucide-react";

import { cn } from "@/lib/utils";

interface ActivityImageProps {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ActivityImage({
  src,
  alt,
  className,
  priority = false,
}: ActivityImageProps) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-muted",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-muted-foreground"
          role="img"
          aria-label={alt}
        >
          <Mountain className="size-10" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
