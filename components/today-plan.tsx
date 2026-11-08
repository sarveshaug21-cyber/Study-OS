"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Clock3 } from "lucide-react";
import { plannerTasks } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui";

const todayTasks = plannerTasks.filter((task) => task.day === "Sun");

export function TodayPlan() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(todayTasks.map((task) => [task.id, task.completed])),
  );

  const completedCount = todayTasks.filter((task) => completed[task.id]).length;
  const progress = Math.round((completedCount / todayTasks.length) * 100);

  return (
    <section className="card flex h-full flex-col p-5" aria-labelledby="today-plan-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="today-plan-title" className="text-base font-semibold tracking-tight">
            Today&apos;s plan
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">Sunday, 8 November</p>
        </div>
        <Link
          href="/planner"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          Planner
          <ArrowUpRight aria-hidden="true" size={13} />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={progress} label={`${completedCount} of ${todayTasks.length} tasks complete`} />
        <span className="shrink-0 text-xs font-semibold text-ink-muted">
          {completedCount}/{todayTasks.length}
        </span>
      </div>

      <ul className="mt-4 space-y-1.5" aria-label="Today's study tasks">
        {todayTasks.map((task) => {
          const isDone = completed[task.id];

          return (
            <li key={task.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition",
                  isDone
                    ? "border-slate-100 bg-slate-50/70"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60",
                )}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() =>
                    setCompleted((current) => ({
                      ...current,
                      [task.id]: !current[task.id],
                    }))
                  }
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2",
                    isDone
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 bg-white text-transparent",
                  )}
                  aria-hidden="true"
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-medium leading-5",
                      isDone ? "text-ink-muted line-through" : "text-ink",
                    )}
                  >
                    {task.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: task.accent }}
                      aria-hidden="true"
                    />
                    <span>{task.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 aria-hidden="true" size={11} />
                      {task.time} · {task.duration}m
                    </span>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4">
        <Link href="/planner" className="btn-secondary w-full">
          Open full week
        </Link>
      </div>
    </section>
  );
}
