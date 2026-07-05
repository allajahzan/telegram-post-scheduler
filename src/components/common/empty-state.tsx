import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  children: ReactNode;
  className?: string;
}

export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "col-span-full rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">{children}</p>
    </div>
  );
}
