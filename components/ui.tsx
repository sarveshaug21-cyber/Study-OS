import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamBoard } from "@/lib/demo-data";

export function Badge({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold leading-none",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function BoardBadge({
  board,
  level,
  className,
}: {
  board: ExamBoard;
  level: string;
  className?: string;
}) {
  return (
    <Badge
      className={cn("border-slate-200 bg-slate-50 text-ink-soft", className)}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
      {board} · {level}
    </Badge>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "bg-brand-50 text-brand-600",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            accent,
          )}
        >
          <Icon aria-hidden="true" size={19} />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-ink-muted">{detail}</p>
    </div>
  );
}

export function ProgressBar({
  value,
  accent = "#7A55F2",
  label,
  className,
}: {
  value: number;
  accent?: string;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clamped}% complete`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${clamped}%`, backgroundColor: accent }}
      />
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-ink-muted">
        <Icon aria-hidden="true" size={20} />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
    </div>
  );
}

export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-rose-300 text-xs font-bold text-amber-950",
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
