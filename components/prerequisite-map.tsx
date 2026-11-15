"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  GitBranch,
  Layers3,
  TriangleAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge, EmptyState } from "@/components/ui";

type Edge = {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  strength: "required" | "helpful";
  reason: string;
};

type Recommended = {
  position: number;
  id: string;
  name: string;
  completed: boolean;
  subject: string | null;
};

type Priority = {
  id: string;
  name: string;
  completed: boolean;
  unlocks: number;
  blockedBy: { name: string; reason: string }[];
};

type Payload = {
  edges: Edge[];
  recommendedOrder: Recommended[];
  priorities: Priority[];
};

export function PrerequisiteMap() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<Payload>("/api/prerequisites");
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load prerequisites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <section className="card p-5" aria-busy="true">
        <p className="text-sm text-ink-muted">Working out your learning sequence…</p>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="card p-5">
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error} — prerequisite data needs a connected database.
        </p>
      </section>
    );
  }

  const edges = data?.edges ?? [];
  const order = data?.recommendedOrder ?? [];
  const priorities = (data?.priorities ?? []).filter(
    (entry) => !entry.completed && entry.unlocks > 0,
  );

  if (!edges.length) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No prerequisite links yet"
        description="Once you add topics to a subject, Study OS works out which concepts depend on others and builds a learning order for you."
      />
    );
  }

  return (
    <div className="space-y-4">
      <section className="card p-5" aria-labelledby="prereq-order-title">
        <h2 id="prereq-order-title" className="text-base font-semibold tracking-tight">
          Recommended learning sequence
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Topics are ordered so that every required prerequisite is studied before
          the concepts that build on it.
        </p>
        <ol className="mt-4 space-y-2">
          {order.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-50 text-[0.7rem] font-bold text-brand-700">
                {entry.position}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    entry.completed
                      ? "text-sm font-medium text-ink-muted line-through"
                      : "text-sm font-semibold text-ink"
                  }
                >
                  {entry.name}
                </p>
                {entry.subject && (
                  <p className="mt-0.5 text-xs text-ink-muted">{entry.subject}</p>
                )}
              </div>
              {entry.completed && (
                <CircleCheck
                  aria-label="Completed"
                  className="mt-0.5 shrink-0 text-emerald-600"
                  size={16}
                />
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="prereq-links-title">
          <h2 id="prereq-links-title" className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <GitBranch aria-hidden="true" size={17} className="text-brand-600" />
            Concept dependencies
          </h2>
          <ul className="mt-3 space-y-2">
            {edges.map((edge) => (
              <li
                key={`${edge.from}-${edge.to}`}
                className="rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-ink">{edge.fromName}</span>
                  <ArrowRight aria-hidden="true" size={13} className="text-slate-400" />
                  <span className="font-semibold text-ink">{edge.toName}</span>
                  <Badge
                    className={
                      edge.strength === "required"
                        ? "border-brand-200 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-slate-50 text-ink-muted"
                    }
                  >
                    {edge.strength}
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-ink-muted">{edge.reason}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5" aria-labelledby="prereq-priority-title">
          <h2 id="prereq-priority-title" className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <TriangleAlert aria-hidden="true" size={17} className="text-amber-600" />
            Unlocks the most learning
          </h2>
          {priorities.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              Nothing is currently holding back another topic. Keep the streak going
              with spaced repetition.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {priorities.slice(0, 8).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{entry.name}</span>
                    <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                      <Layers3 aria-hidden="true" size={11} />
                      Unlocks {entry.unlocks}
                    </Badge>
                  </div>
                  {entry.blockedBy.length > 0 && (
                    <p className="mt-1 text-xs leading-5 text-ink-muted">
                      Still needs: {entry.blockedBy.map((b) => b.name).join(", ")}.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Link href="/planner" className="btn-secondary mt-4">
            Put these in your planner
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </section>
      </div>
    </div>
  );
}
