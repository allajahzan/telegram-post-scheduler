import * as React from "react";
import { Check } from "lucide-react";

export function StatusBadge({ status }: { status: "pending" | "done" }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider shrink-0 text-amber-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
        Scheduled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider shrink-0 text-emerald-400">
      <Check size={10} strokeWidth={3} />
      Published
    </span>
  );
}

export function AppBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider shrink-0 text-primary ${className}`}
    >
      {children}
    </span>
  );
}
