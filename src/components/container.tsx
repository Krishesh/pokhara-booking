import { cn } from "@/lib/utils";

/** The page frame: one max width and one pair of outer margins, used on every page. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)} {...props} />;
}
