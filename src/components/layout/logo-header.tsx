import { cn } from "@/lib/utils";
import { LinkedInIcon } from "../common/linkedin-icon";

interface Props {
  iconClassName?: string;
}

export function LogoHeader({ iconClassName }: Props) {
  return (
    <div className="flex items-end gap-2">
      <div
        className={cn(
          "flex items-center justify-center size-9 rounded-md bg-primary shadow-md shadow-primary/20",
          iconClassName,
        )}
      >
        <LinkedInIcon className="size-5 shadow-lg" />
      </div>

      <div className="text-start">
        <h1 className="text-lg font-semibold tracking-tight text-foreground leading-none">
          Post Scheduler
        </h1>
        <p className="text-[10px] sm:text-[11px] font-medium tracking-widest text-muted-foreground">
          LinkedIn Automation
        </p>
      </div>
    </div>
  );
}
