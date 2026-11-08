import type { WeeklyStudyPoint } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function WeeklyStudyChart({
  data,
  className,
  large = false,
}: {
  data: WeeklyStudyPoint[];
  className?: string;
  large?: boolean;
}) {
  const max = Math.max(...data.map((point) => point.minutes), 60);

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex items-end gap-2 sm:gap-3",
          large ? "h-56" : "h-36",
        )}
        role="img"
        aria-label={`Study time this week: ${data
          .map((point) => `${point.day} ${Math.floor(point.minutes / 60)} hours ${point.minutes % 60} minutes`)
          .join(", ")}`}
      >
        {data.map((point) => {
          const height = Math.max(6, Math.round((point.minutes / max) * 100));
          const isToday = point.day === "Sun";

          return (
            <div
              key={point.day}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-[0.65rem] font-medium text-ink-muted opacity-0 transition group-hover:opacity-100">
                {point.minutes}m
              </span>
              <div
                className={cn(
                  "w-full rounded-lg transition-all duration-300 group-hover:opacity-90",
                  isToday
                    ? "bg-gradient-to-t from-brand-700 to-brand-400"
                    : "bg-slate-200 group-hover:bg-brand-200",
                )}
                style={{ height: `${height}%` }}
              />
              <span
                className={cn(
                  "text-[0.68rem] font-medium",
                  isToday ? "text-brand-700" : "text-ink-muted",
                )}
              >
                {point.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
