"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleCheck,
  FileQuestion,
  Layers,
  ListTree,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge, EmptyState, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/utils";

export type TopicNode = {
  id: string;
  name: string;
  level: "subject" | "unit" | "chapter" | "topic";
  parentId: string | null;
  sortOrder: number;
  description?: string;
  path: string;
  depth: number;
  completed: boolean;
};

type HierarchyResponse = {
  topics: TopicNode[];
  tree: {
    roots: string[];
    childrenByParent: Record<string, string[]>;
    depthById: Record<string, number>;
  };
  recommendedTopicId: string | null;
};

const LEVEL_LABEL: Record<TopicNode["level"], string> = {
  subject: "Subject",
  unit: "Unit",
  chapter: "Chapter",
  topic: "Topic",
};

const LEVEL_STYLE: Record<TopicNode["level"], string> = {
  subject: "border-brand-200 bg-brand-50 text-brand-700",
  unit: "border-sky-200 bg-sky-50 text-sky-700",
  chapter: "border-violet-200 bg-violet-50 text-violet-700",
  topic: "border-slate-200 bg-slate-50 text-ink-soft",
};

export function TopicTree({ subjectId }: { subjectId: string }) {
  const [data, setData] = useState<HierarchyResponse | null>(null);
  const [completed, setCompleted] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addingUnder, setAddingUnder] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<HierarchyResponse>(
        `/api/topics/hierarchy?subjectId=${encodeURIComponent(subjectId)}`,
      );
      setData(res);
      setCompleted(
        new Map((res.topics ?? []).map((node) => [node.id, node.completed])),
      );
      // Expand the first two levels by default so the structure is visible.
      const defaults: Record<string, boolean> = {};
      for (const node of res.topics ?? []) {
        if (node.depth < 2) defaults[node.id] = true;
      }
      setExpanded(defaults);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load topics");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const byId = useMemo(() => {
    const map = new Map<string, TopicNode>();
    for (const node of data?.topics ?? []) map.set(node.id, node);
    return map;
  }, [data]);

  const toggleComplete = async (id: string) => {
    setError(null);
    try {
      const res = await api<{ completed: boolean }>(
        `/api/topics/${id}/progress`,
        { method: "PUT" },
      );
      const next = res.completed;
      // Optimistically refresh the local map so the checkbox reflects the new
      // state immediately without a full reload.
      setCompleted((prev) => new Map(prev).set(id, next));
      if (data) {
        setData({
          ...data,
          topics: data.topics.map((node) =>
            node.id === id ? { ...node, completed: next } : node,
          ),
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update topic");
    }
  };

  const addTopic = async (parentId: string | null) => {
    const name = newTopicName.trim();
    if (!name) return;
    setSaving(true);
    setError(null);
    try {
      await api("/api/topics", {
        method: "POST",
        body: JSON.stringify({
          subjectId,
          ...(parentId ? { parentTopicId: parentId } : {}),
          name,
          level: parentId ? "topic" : "unit",
        }),
      });
      setNewTopicName("");
      setAddingUnder(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add topic");
    } finally {
      setSaving(false);
    }
  };

  const total = data?.topics.length ?? 0;
  const done = (data?.topics ?? []).filter(
    (node) => node.level === "topic" && (completed.get(node.id) ?? false),
  ).length;

  const recommended = data
    ? data.topics.find((node) => node.id === data.recommendedTopicId)
    : undefined;

  const renderNode = (node: TopicNode): React.ReactNode => {
    const children = data?.tree.childrenByParent[node.id] ?? [];
    const isOpen = expanded[node.id];
    const hasChildren = children.length > 0;
    const isDone = completed.get(node.id) ?? false;

    return (
      <li key={node.id}>
        <div
          className={cn(
            "group flex items-start gap-2 rounded-xl border px-3 py-2.5 transition",
            isDone
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-slate-200 bg-white hover:border-slate-300",
          )}
          style={{ marginLeft: `${node.depth * 14}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [node.id]: !prev[node.id] }))
              }
              aria-expanded={isOpen}
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-slate-100"
              aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.name}`}
            >
              <ChevronRight
                aria-hidden="true"
                size={14}
                className={cn("transition-transform", isOpen && "rotate-90")}
              />
            </button>
          ) : (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
          )}

          <input
            type="checkbox"
            checked={isDone}
            onChange={() => toggleComplete(node.id)}
            className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
            aria-label={`Mark ${node.name} complete`}
            id={`topic-done-${node.id}`}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor={`topic-done-${node.id}`}
                className="cursor-pointer text-sm font-medium text-ink"
              >
                {node.name}
              </label>
              <Badge className={LEVEL_STYLE[node.level]}>{LEVEL_LABEL[node.level]}</Badge>
            </div>
            {node.description && (
              <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                {node.description}
              </p>
            )}
            {node.level === "topic" && (
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={`/notes?topic=${encodeURIComponent(node.name)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[0.7rem] font-semibold text-ink-soft transition hover:bg-slate-50"
                >
                  <BookOpen aria-hidden="true" size={12} />
                  Notes
                </Link>
                <Link
                  href={`/practice?topic=${encodeURIComponent(node.name)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[0.7rem] font-semibold text-ink-soft transition hover:bg-slate-50"
                >
                  <FileQuestion aria-hidden="true" size={12} />
                  Practice
                </Link>
                <Link
                  href={`/flashcards?topic=${encodeURIComponent(node.name)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[0.7rem] font-semibold text-ink-soft transition hover:bg-slate-50"
                >
                  <Layers aria-hidden="true" size={12} />
                  Cards
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setAddingUnder(addingUnder === node.id ? null : node.id);
                    setNewTopicName("");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2 py-1 text-[0.7rem] font-semibold text-ink-muted transition hover:border-slate-400 hover:text-ink"
                >
                  <Plus aria-hidden="true" size={12} />
                  Sub-topic
                </button>
              </div>
            )}
          </div>
        </div>

        {addingUnder === node.id && (
          <form
            className="mt-2 flex gap-2"
            style={{ marginLeft: `${(node.depth + 1) * 14}px` }}
            onSubmit={(event) => {
              event.preventDefault();
              void addTopic(node.id);
            }}
          >
            <label htmlFor={`new-topic-${node.id}`} className="sr-only">
              New sub-topic under {node.name}
            </label>
            <input
              id={`new-topic-${node.id}`}
              className="input"
              value={newTopicName}
              onChange={(event) => setNewTopicName(event.target.value)}
              placeholder={`New sub-topic of ${node.name}`}
              autoFocus
            />
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Add"}
            </button>
          </form>
        )}

        {hasChildren && isOpen && (
          <ul className="mt-2 space-y-2">{children.map((id) => {
            const child = byId.get(id);
            return child ? renderNode(child) : null;
          })}</ul>
        )}
      </li>
    );
  };

  if (loading) {
    return (
      <div className="card p-5" aria-busy="true">
        <p className="text-sm text-ink-muted">Loading your topic tree…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card p-5">
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error} — you may be in demo mode (Supabase not configured).
        </p>
      </div>
    );
  }

  if (!total) {
    return (
      <EmptyState
        icon={ListTree}
        title="No topics mapped yet"
        description="Official specification topics should be imported from the exam board source. Personal topics you add are labelled as unverified so they are never mistaken for official syllabus content."
      />
    );
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Topic hierarchy</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            {total} nodes · {done} topics complete
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAddingUnder(addingUnder === "root" ? null : "root");
            setNewTopicName("");
          }}
          className="btn-secondary"
        >
          <Plus aria-hidden="true" size={15} />
          Add topic
        </button>
      </div>

      <div className="mt-3">
        <ProgressBar
          value={total ? (done / total) * 100 : 0}
          label="Topic completion"
        />
      </div>

      {recommended && (
        <section
          className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4"
          aria-label="Next recommended topic"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white shrink-0">
              <ArrowRight size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-brand-700">
                Next recommended topic
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink">{recommended.name}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {recommended.path} · {recommended.level}
              </p>
              <div className="mt-2.5 flex gap-2">
                <Link
                  href={`/notes?topic=${encodeURIComponent(recommended.name)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2 py-1 text-[0.7rem] font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  <BookOpen aria-hidden="true" size={12} />
                  Notes
                </Link>
                <Link
                  href={`/practice?topic=${encodeURIComponent(recommended.name)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2 py-1 text-[0.7rem] font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  <FileQuestion aria-hidden="true" size={12} />
                  Practice
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {addingUnder === "root" && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void addTopic(null);
          }}
        >
          <label htmlFor="new-root-topic" className="sr-only">
            New topic
          </label>
          <input
            id="new-root-topic"
            className="input"
            value={newTopicName}
            onChange={(event) => setNewTopicName(event.target.value)}
            placeholder="Topic name"
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Add"}
          </button>
        </form>
      )}

      <ul className="mt-4 space-y-2">
        {(data?.tree.roots ?? []).map((rootId) => {
          const root = byId.get(rootId);
          return root ? renderNode(root) : null;
        })}
      </ul>

      {done > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700">
          <CircleCheck aria-hidden="true" size={13} />
          {done} topic{done === 1 ? "" : "s"} ticked off — progress is saved to your account.
        </p>
      )}
    </div>
  );
}
