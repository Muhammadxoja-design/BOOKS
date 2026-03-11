import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Surface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)]/90 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.7)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
