import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "h-2 overflow-hidden rounded-full bg-[color:var(--muted)]",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
