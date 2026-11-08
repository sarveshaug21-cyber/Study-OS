import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl focus-visible:ring-offset-night",
        className,
      )}
      aria-label="Study OS dashboard"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-900/30">
        <GraduationCap aria-hidden="true" size={19} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="text-[1.05rem] font-semibold tracking-tight text-white">
          Study<span className="text-brand-300">OS</span>
        </span>
      )}
    </Link>
  );
}
