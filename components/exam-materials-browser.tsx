"use client";

import { useEffect, useState } from "react";
import { Archive, ChevronRight, Download, FileText, Folder, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { formatBytes, hfFileHref, HF_ROOT } from "@/lib/hf-shared";

interface HfEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
}

export function ExamMaterialsBrowser() {
  const [path, setPath] = useState<string>(HF_ROOT);
  const [entries, setEntries] = useState<HfEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api<{ entries: HfEntry[] }>(`/api/hf/list?path=${encodeURIComponent(path)}`)
      .then((d) => { if (!cancelled) setEntries(d.entries); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to list folder"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [path]);

  const crumbs = path.split("/").filter(Boolean);

  const navigateInto = (entry: HfEntry) => { if (entry.type === "directory") setPath(entry.path); };
  const navigateTo = (idx: number) => { setPath(crumbs.slice(0, idx + 1).join("/")); };

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
        <button className="flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-brand-700 hover:bg-slate-50" onClick={() => setPath(HF_ROOT)}>
          <Archive aria-hidden="true" size={14} /> exam-materials
        </button>
        {crumbs.slice(1).map((seg, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" size={14} className="text-slate-300" />
            <button className="max-w-[16rem] truncate rounded-lg px-2 py-1 font-medium text-ink-soft hover:bg-slate-50 hover:text-ink" onClick={() => navigateTo(idx + 1)}>
              {seg.replace(/-/g, " ")}
            </button>
          </span>
        ))}
      </nav>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          <AlertTriangle aria-hidden="true" size={16} className="shrink-0" /> {error}
        </p>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-ink-muted"><Loader2 aria-hidden="true" size={16} className="animate-spin" /> Loading folder…</p>
      )}

      {entries && !loading && (
        <>
          {entries.length === 0 && <p className="text-sm text-ink-muted">This folder is empty.</p>}
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
            {entries.map((entry) => (
              <li key={entry.path} className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-slate-50">
                {entry.type === "directory" ? (
                  <>
                    <Folder aria-hidden="true" size={18} className="shrink-0 text-amber-500" />
                    <button className="flex-1 truncate text-left text-sm font-medium text-ink-soft hover:text-ink" onClick={() => navigateInto(entry)}>
                      {entry.name}
                    </button>
                  </>
                ) : (
                  <>
                    <FileText aria-hidden="true" size={18} className="shrink-0 text-brand-500" />
                    <a className="flex-1 truncate text-sm font-medium text-ink-soft hover:text-ink" href={hfFileHref(entry.path)} target="_blank" rel="noreferrer">
                      {entry.name}
                    </a>
                    <span className="w-20 text-right text-xs text-ink-muted">{formatBytes(entry.size)}</span>
                    <a className="btn-secondary px-2 py-1 text-xs" href={hfFileHref(entry.path, true)} download>
                      <Download aria-hidden="true" size={13} className="mr-1 inline-block" /> Save
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
