import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Label + control + optional hint + error. The control should use `fieldA11y(id, error, hint)`. */
export function FormField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria attributes linking a control to its error or hint text. */
export function fieldA11y(id: string, error?: string, hint?: boolean) {
  if (error) return { "aria-invalid": true as const, "aria-describedby": `${id}-error` };
  if (hint) return { "aria-describedby": `${id}-hint` };
  return {};
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-4 rounded-2xl bg-card p-5 border border-border sm:p-7">
      <legend className="px-1 text-base font-semibold">{title}</legend>
      {description && <p className="-mt-2 text-sm text-muted-foreground">{description}</p>}
      {children}
    </fieldset>
  );
}
