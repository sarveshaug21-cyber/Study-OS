"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
export function NoteEditor({ noteId, initialTitle, initialContent }: { noteId: string; initialTitle: string; initialContent: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);

  const save = async (t: string, c: string) => {
    if (pending.current) return;
    pending.current = true;
    setStatus("saving");
    try {
      await api(`/api/notes/${noteId}`, { method: "PATCH", body: JSON.stringify({ title: t, content: c }) });
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  };

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void save(title, content); }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  return (
    <section className="card p-5" aria-labelledby="note-editor-title">
      <div className="flex items-center justify-between">
        <h2 id="note-editor-title" className="font-semibold">Edit note (autosave)</h2>
        <span className="text-xs text-ink-muted" role="status">
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
          {status === "error" && "Failed to save"}
          {status === "idle" && ""}
        </span>
      </div>
      <div className="mt-3 space-y-3">
        <div><label className="label" htmlFor="ne-title">Title</label><input id="ne-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><label className="label" htmlFor="ne-content">Content (Markdown)</label><textarea id="ne-content" className="input min-h-40" value={content} onChange={(e) => setContent(e.target.value)} /></div>
      </div>
    </section>
  );
}
