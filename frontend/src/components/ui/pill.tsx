import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Pill({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}
