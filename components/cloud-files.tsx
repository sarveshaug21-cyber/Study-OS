"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { buildTree, fileExtension, MAX_FILE_BYTES, SUPPORTED_EXTENSIONS, type TreeNode } from "@/lib/drive-shared";

// Minimal typings for the Google Picker / gapi globals loaded at runtime.
type Gapi = { load(moduleName: string, callback: () => void): void };
interface PickerDoc { id: string; name: string; }
interface PickerCallbackData { action: string; docs?: PickerDoc[]; }
interface PickerDocsView { setSelectFolderEnabled(enabled: boolean): PickerDocsView; }
interface PickerBuilderInstance {
  addView(view: PickerDocsView): PickerBuilderInstance;
  setOAuthToken(token: string): PickerBuilderInstance;
  setDeveloperKey(key: string): PickerBuilderInstance;
  setCallback(callback: (data: PickerCallbackData) => void | Promise<void>): PickerBuilderInstance;
  build(): { setVisible(visible: boolean): void };
}
interface GooglePickerNamespace {
  DocsView: new (viewId: string) => PickerDocsView;
  ViewId: { FOLDERS: string };
  PickerBuilder: new () => PickerBuilderInstance;
  Action: { PICKED: string };
}
declare global {
  interface Window {
    gapi?: Gapi;
    google?: { picker: GooglePickerNamespace };
  }
}

interface DriveFile { id: string; name: string; mimeType: string; size?: string; modifiedTime?: string; }
interface DriveFileMetaEntry {
  id: string; name: string; mimeType: string; size?: string; folderPath?: string;
  source?: "upload" | "drive-import"; sourceFolder?: string; status?: "imported" | "duplicate"; importedAt?: string;
}
type ItemStatus = "imported" | "skipped-duplicate" | "skipped-unsupported" | "skipped-too-large" | "inaccessible" | "failed";
interface BatchItem { id: string; name: string; path: string; size?: number; file?: File }
interface ItemResult extends BatchItem { status: ItemStatus; reason?: string }
interface ProgressState {
  kind: "upload" | "import";
  phase: string;
  total: number;
  done: number;
  results: ItemResult[];
}
interface Manifest {
  sourceFolderId: string;
  sourceFolder?: string;
  files: Array<{ id: string; name: string; relativePath: string; action: "copy" | "export" }>;
  skipped: Array<{ name: string; path: string; reason: string }>;
  issues: Array<{ path: string; reason: string }>;
  emptyFolders: string[];
  truncated: boolean;
  total: number;
}

const MAX_UPLOAD_BYTES = MAX_FILE_BYTES;

function sizeKb(size?: string | number): string {
  if (size === undefined) return "";
  const kb = Number(size) / 1024;
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
}

function isSupportedLocal(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(fileExtension(fileName) as (typeof SUPPORTED_EXTENSIONS)[number]);
}

async function runBatch(
  items: BatchItem[],
  worker: (item: BatchItem) => Promise<ItemResult>,
  onResult: (r: ItemResult) => void,
  concurrency = 3,
): Promise<void> {
  const queue = [...items];
  const lanes = Array.from({ length: Math.min(concurrency, Math.max(1, queue.length)) }, async () => {
    for (;;) {
      const item = queue.shift();
      if (!item) return;
      try { onResult(await worker(item)); } catch (e) { onResult({ ...item, status: "failed", reason: e instanceof Error ? e.message : "failed" }); }
    }
  });
  await Promise.all(lanes);
}

function FolderTreeNode({ node, depth, onRemove, onDownload }: { node: TreeNode; depth: number; onRemove: (f: { id: string; name: string }) => void; onDownload: (f: { id: string }) => void }) {
  const childCount = (n: TreeNode): number => n.files.length + [...n.children.values()].reduce((acc, c) => acc + childCount(c), 0);
  return (
    <ul className={depth === 0 ? "space-y-1" : "ml-4 border-l border-slate-100 pl-3 space-y-1"}>
      {[...node.children.values()].sort((a, b) => a.name.localeCompare(b.name)).map((child) => (
        <li key={child.name}>
          <details open={depth < 1}>
            <summary className="cursor-pointer text-sm font-medium text-ink-soft hover:text-ink select-none">
              📁 {child.name} <span className="text-xs text-ink-muted">({childCount(child)})</span>
            </summary>
            <FolderTreeNode node={child} depth={depth + 1} onRemove={onRemove} onDownload={onDownload} />
          </details>
        </li>
      ))}
      {node.files.sort((a, b) => a.name.localeCompare(b.name)).map((f) => (
        <li key={f.id} className="flex items-center gap-2 py-0.5 text-sm">
          <span className="flex-1 truncate text-ink-soft">📄 {f.name}</span>
          <span className="text-xs text-ink-muted">{sizeKb(f.size)}</span>
          <button className="btn-secondary px-2 py-0.5 text-xs" onClick={() => onDownload(f)}>Download</button>
          <button className="btn-secondary px-2 py-0.5 text-xs text-rose-700" onClick={() => onRemove(f)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export function CloudFiles() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [meta, setMeta] = useState<DriveFileMetaEntry[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [crumbs, setCrumbs] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [quota, setQuota] = useState<{ limit?: string; usage?: string } | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [importing, setImporting] = useState(false);

  async function load(folder?: string) {
    setBusy(true); setError(null);
    try {
      const d = await api<{ files: DriveFile[]; meta: DriveFileMetaEntry[]; rootFolderId: string; parentId: string }>("/api/drive/files" + (folder ? `?folderId=${encodeURIComponent(folder)}` : ""));
      setFiles(d.files); setMeta(d.meta ?? []); setFolderId(d.rootFolderId); setParentId(d.parentId);
      if (!folder) setCrumbs([{ id: d.rootFolderId, name: "Study OS" }]);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }
  async function loadQuota() {
    try { const d = await api<{ quota: { limit?: string; usage?: string } }>("/api/drive/quota"); setQuota(d.quota); } catch {}
  }
  useEffect(() => { load(); loadQuota(); }, []);

  // ── Google Picker (connect flow after OAuth, and import-folder flow) ──
  async function openPicker(onPicked: (folder: PickerDoc) => void | Promise<void>) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) { setError("Google Picker API key is not configured (NEXT_PUBLIC_GOOGLE_API_KEY)."); return; }
    const tok = await api<{ accessToken: string }>("/api/drive/token");
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://apis.google.com/js/api.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Google API script"));
      document.head.appendChild(s);
    });
    if (!window.gapi) throw new Error("Picker failed to initialise (gapi missing)");
    await new Promise<void>((resolve) => { window.gapi!.load("picker", () => resolve()); });
    const pickerNs = window.google?.picker;
    if (!pickerNs) throw new Error("Picker failed to initialise (google.picker missing)");
    const view = new pickerNs.DocsView(pickerNs.ViewId.FOLDERS);
    view.setSelectFolderEnabled(true);
    const picker = new pickerNs.PickerBuilder()
      .addView(view)
      .setOAuthToken(tok.accessToken)
      .setDeveloperKey(apiKey)
      .setCallback(async (data: PickerCallbackData) => {
        if (data.action !== pickerNs.Action.PICKED) return;
        const folder = data.docs?.[0];
        if (!folder) { setError("Picker returned no folder"); return; }
        try { await onPicked(folder); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
      })
      .build();
    picker.setVisible(true);
  }

  // After OAuth redirect (?pick=1): select the "Study OS" storage folder.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pick") !== "1") return;
    openPicker(async (folder) => {
      await api("/api/drive/select-folder", { method: "POST", body: JSON.stringify({ folderId: folder.id }) });
      window.history.replaceState({}, "", "/cloud-files");
      await load(folder.id);
    }).catch((e) => setError(e instanceof Error ? e.message : "Picker failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Connection ──
  async function connect() { window.location.href = "/api/drive/connect"; }
  async function disconnect() { try { await api("/api/drive/disconnect", { method: "POST" }); setFiles([]); setMeta([]); setConnected(false); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } }

  // ── Local file upload (single or selected as multiples) ──
  async function uploadLocal(e: React.ChangeEvent<HTMLInputElement>, asFolder: boolean) {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const results: ItemResult[] = [];
    const items: BatchItem[] = [];
    const preSkipped: ItemResult[] = [];
    for (const f of Array.from(list)) {
      const rel = typeof (f as File & { webkitRelativePath?: string }).webkitRelativePath === "string" && asFolder ? (f as File & { webkitRelativePath: string }).webkitRelativePath : f.name;
      if (!isSupportedLocal(f.name)) { preSkipped.push({ id: `pre-${preSkipped.length}`, name: f.name, path: rel, status: "skipped-unsupported", reason: "unsupported file type" }); continue; }
      if (f.size > MAX_UPLOAD_BYTES) { preSkipped.push({ id: `pre-${preSkipped.length}`, name: f.name, path: rel, status: "skipped-too-large", reason: `exceeds ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB limit` }); continue; }
      items.push({ id: `${rel}`, name: f.name, path: rel, size: f.size, file: f });
    }
    const total = items.length + preSkipped.length;
    setProgress({ kind: "upload", phase: `Uploading ${items.length} file(s)…`, total, done: preSkipped.length, results: [...preSkipped] });
    await runBatch(items, async (item) => {
      const f = item.file;
      if (!f) throw new Error("file object missing");
      if (f.size <= 4 * 1024 * 1024) {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("relativePath", item.path);
        const r = await fetch("/api/drive/upload", { method: "POST", body: fd });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error ?? `upload failed (${r.status})`);
        return { ...item, status: d.duplicate ? "skipped-duplicate" : "imported" };
      }
      const init = await api<{ uploadUrl?: string; duplicate?: boolean; error?: string }>("/api/drive/upload/init", { method: "POST", body: JSON.stringify({ name: item.name, mimeType: f.type, size: f.size, relativePath: item.path }) });
      if (init.duplicate) return { ...item, status: "skipped-duplicate" };
      const put = await fetch(init.uploadUrl!, { method: "PUT", headers: { "Content-Type": f.type || "application/octet-stream", "Content-Length": String(f.size) }, body: f });
      if (!put.ok) throw new Error(`resumable upload failed (${put.status})`);
      const metaRes = await put.json().catch(() => ({}));
      await api("/api/drive/upload/complete", { method: "POST", body: JSON.stringify({ fileId: (metaRes as { id?: string }).id, relativePath: item.path }) });
      return { ...item, status: "imported" };
    }, (r) => {
      results.push(r);
      setProgress((p) => p ? { ...p, done: p.done + 1, results: [...p.results, r] } : p);
    }, 3);
    setProgress((p) => p ? { ...p, phase: "Upload complete", results: [...preSkipped, ...results].sort((a, b) => a.path.localeCompare(b.path)) } : p);
    await load(parentId || undefined);
    e.target.value = "";
  }

  // ── Google Drive folder import ──
  async function startImportPicker() {
    setError(null);
    try {
      await openPicker(async (folder) => {
        setBusy(true);
        const d = await api<Manifest>("/api/drive/import/enumerate", { method: "POST", body: JSON.stringify({ sourceFolderId: folder.id }) });
        setManifest({ ...d, sourceFolder: folder.name });
        setBusy(false);
      });
    } catch (e) { setBusy(false); setError(e instanceof Error ? e.message : "Picker failed"); }
  }
  async function runImport() {
    if (!manifest) return;
    setImporting(true); setError(null);
    const items: BatchItem[] = manifest.files.map((f) => ({ id: f.id, name: f.name, path: f.relativePath, size: undefined }));
    const results: ItemResult[] = [];
    setProgress({ kind: "import", phase: `Importing ${items.length} file(s)…`, total: items.length, done: 0, results: [] });
    await runBatch(items, async (item) => {
      const r = await api<{ action: string; reason?: string }>("/api/drive/import/file", { method: "POST", body: JSON.stringify({ sourceId: item.id, relativePath: item.path, sourceFolder: manifest.sourceFolder }) });
      const status: ItemStatus =
        r.action === "imported" ? "imported" :
        r.action === "skipped-duplicate" ? "skipped-duplicate" :
        r.action === "inaccessible" ? "inaccessible" :
        r.action === "skipped" ? "skipped-unsupported" : "failed";
      return { ...item, status, reason: r.reason };
    }, (r) => { results.push(r); setProgress((p) => p ? { ...p, done: p.done + 1, results: [...p.results, r] } : p); }, 3);
    setProgress((p) => p ? { ...p, phase: "Import complete" } : p);
    setImporting(false);
    setManifest(null);
    await load(parentId || undefined);
  }

  // ── Progress summary helpers ──
  const summary = useMemo(() => {
    if (!progress) return null;
    const count = (s: ItemStatus) => progress.results.filter((r) => r.status === s).length;
    const failed = progress.results.filter((r) => r.status === "failed");
    const inaccessible = progress.results.filter((r) => r.status === "inaccessible");
    return { count, failed, inaccessible, ok: count("imported"), duplicates: count("skipped-duplicate"), unsupported: count("skipped-unsupported") + count("skipped-too-large") };
  }, [progress]);

  async function retry(items: ItemResult[], kind: "upload" | "import") {
    if (!progress) return;
    const fixed = items.map((r) => ({ ...r }));
    setProgress({ ...progress, phase: `Retrying ${items.length} file(s)…`, results: progress.results.filter((r) => !items.includes(r)) });
    if (kind === "import") {
      const batch: BatchItem[] = fixed.map((r) => ({ id: r.id, name: r.name, path: r.path, size: r.size }));
      await runBatch(batch, async (item) => {
        const r = await api<{ action: string; reason?: string }>("/api/drive/import/file", { method: "POST", body: JSON.stringify({ sourceId: item.id, relativePath: item.path }) });
        const status: ItemStatus = r.action === "imported" ? "imported" : r.action === "skipped-duplicate" ? "skipped-duplicate" : r.action === "inaccessible" ? "inaccessible" : "failed";
        return { ...item, status, reason: r.reason };
      }, (r) => setProgress((p) => p ? { ...p, done: p.done + 1, results: [...p.results, r] } : p), 3);
    } else {
      // Re-upload the same files is only possible from the input — ask the user to re-select.
      setError("Retry uploads by re-selecting the files with Upload Files/Folder.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this file from Google Drive?")) return;
    setBusy(true);
    try { await api(`/api/drive/file/${id}`, { method: "DELETE" }); await load(parentId || folderId || undefined); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
    finally { setBusy(false); }
  }
  async function rename(id: string, oldName: string) {
    const name = prompt("New name:", oldName); if (!name || name === oldName) return;
    setBusy(true);
    try { await api(`/api/drive/file/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }); await load(parentId || folderId || undefined); }
    catch (e) { setError(e instanceof Error ? e.message : "Rename failed"); }
    finally { setBusy(false); }
  }
  async function search() {
    if (!q.trim()) { await load(parentId || folderId || undefined); return; }
    setBusy(true);
    try { const d = await api<{ files: DriveFile[] }>(`/api/drive/search?q=${encodeURIComponent(q)}`); setFiles(d.files); }
    catch (e) { setError(e instanceof Error ? e.message : "Search failed"); }
    finally { setBusy(false); }
  }
  async function newFolder() {
    const name = prompt("Folder name:"); if (!name) return;
    setBusy(true);
    try { await api("/api/drive/folder", { method: "POST", body: JSON.stringify({ name, parentId: parentId || folderId }) }); await load(parentId || folderId || undefined); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }
  function openFolder(id: string, name: string) { setCrumbs((c) => [...c, { id, name }]); load(id); }
  function goCrumb(i: number) { const c = crumbs[i]; setCrumbs(crumbs.slice(0, i + 1)); load(c.id === crumbs[0].id ? undefined : c.id); }

  const tree = useMemo(() => buildTree(meta), [meta]);

  // Detect connection state via first load error
  useEffect(() => { if (error && /not connected|not configured/i.test(error)) setConnected(false); else if (!error) setConnected(true); }, [error]);

  if (connected === false) {
    return (
      <section className="card p-6 space-y-3">
        <p className="text-sm text-ink-muted">Google Drive is not connected. Connect your Google account to enable cloud file storage.</p>
        <button className="btn-primary" onClick={connect}>Connect Google Drive</button>
        <p className="text-xs text-ink-muted">Setup: create OAuth credentials in Google Cloud Console, enable Drive API, set the redirect URI to this server&apos;s /api/drive/callback, and set GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI/GOOGLE_TOKEN_ENCRYPTION_KEY in .env.local.</p>
      </section>
    );
  }

  const folders = files.filter((f) => f.mimeType === "application/vnd.google-apps.folder");
  const regularFiles = files.filter((f) => f.mimeType !== "application/vnd.google-apps.folder");
  const inProgress = progress !== null && progress.phase !== "Upload complete" && progress.phase !== "Import complete";

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-secondary" onClick={newFolder} disabled={busy || importing}>New folder</button>
        <label className="btn-primary cursor-pointer">Upload Files<input type="file" className="hidden" multiple onChange={(e) => uploadLocal(e, false)} disabled={busy || importing} /></label>
        <label className="btn-secondary cursor-pointer">Upload Folder<input type="file" className="hidden" multiple {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => uploadLocal(e, true)} disabled={busy || importing} /></label>
        <button className="btn-secondary" onClick={startImportPicker} disabled={busy || importing}>Import Google Drive Folder</button>
        <button className="btn-secondary" onClick={disconnect} disabled={busy || importing}>Disconnect</button>
        <div className="ml-auto flex gap-2">
          <input className="input w-48" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" />
          <button className="btn-secondary" onClick={search} disabled={busy || importing}>Search</button>
        </div>
      </div>

      {quota && <p className="text-xs text-ink-muted">Storage: {quota.usage ?? "?"} / {quota.limit ?? "?"} bytes used.</p>}

      {/* Progress + summary panel */}
      {progress && (
        <section className="card p-4 space-y-2" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{progress.phase}</p>
            <p className="text-xs text-ink-muted">{progress.done}/{progress.total} processed</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress.total ? Math.min(100, (progress.done / progress.total) * 100) : 0}%` }} />
          </div>
          {summary && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="chip">✓ {summary.ok} imported</span>
              <span className="chip">⏭ {summary.duplicates} duplicates</span>
              <span className="chip">⊘ {summary.unsupported} skipped</span>
              {summary.inaccessible.length > 0 && <span className="chip">🔒 {summary.inaccessible.length} inaccessible</span>}
              {summary.failed.length > 0 && <span className="chip text-rose-700">✗ {summary.failed.length} failed</span>}
            </div>
          )}
          {summary && summary.failed.length > 0 && !inProgress && (
            <button className="btn-secondary text-xs" onClick={() => retry(summary.failed, progress.kind)}>Retry {summary.failed.length} failed file(s)</button>
          )}
          {summary && summary.inaccessible.length > 0 && (
            <div className="text-xs text-amber-800">
              <p className="font-semibold">Files without access (drive.file scope):</p>
              <ul className="list-disc pl-5">{summary.inaccessible.slice(0, 20).map((f, i) => <li key={i}>{f.path}</li>)}</ul>
              <p>Open the folder/files in Google Drive with an account that can reach them via the Picker, or ask the owner — the app only sees folders you select and files granted to it.</p>
            </div>
          )}
          {summary && summary.unsupported > 0 && (
            <details className="text-xs text-ink-muted"><summary className="cursor-pointer">Skipped files</summary><ul className="list-disc pl-5 mt-1">{progress.results.filter(r => r.status === "skipped-unsupported" || r.status === "skipped-too-large").map((f, i) => <li key={i}>{f.path} — {f.reason}</li>)}</ul></details>
          )}
          {!inProgress && <button className="text-xs text-ink-muted hover:text-ink" onClick={() => setProgress(null)}>Dismiss</button>}
        </section>
      )}

      {/* Import manifest review (before import starts) */}
      {manifest && (
        <section className="card p-4 space-y-2">
          <p className="text-sm font-semibold">Google Drive import preview{manifest.sourceFolder ? `: ${manifest.sourceFolder}` : ""}</p>
          <p className="text-sm text-ink-muted">{manifest.files.length} file(s) ready to import{manifest.truncated ? " (truncated at 500 files)" : ""}.</p>
          {manifest.skipped.length > 0 && <p className="text-xs text-ink-muted">{manifest.skipped.length} file(s) will be skipped (unsupported or too large).</p>}
          {manifest.issues.length > 0 && <p className="text-xs text-amber-800">{manifest.issues.length} folder(s) could not be read and will be skipped.</p>}
          {manifest.emptyFolders.length > 0 && <p className="text-xs text-ink-muted">{manifest.emptyFolders.length} empty folder(s).</p>}
          <div className="flex gap-2">
            <button className="btn-primary" onClick={runImport} disabled={importing || manifest.files.length === 0}>{importing ? "Importing…" : `Import ${manifest.files.length} file(s)`}</button>
            <button className="btn-secondary" onClick={() => setManifest(null)} disabled={importing}>Cancel</button>
          </div>
        </section>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex gap-1 text-sm">
        {crumbs.map((c, i) => (<button key={c.id} className="text-brand-700 hover:underline" onClick={() => goCrumb(i)}>{c.name}{i < crumbs.length - 1 ? " /" : ""}</button>))}
      </nav>

      {/* Browse Drive: folders + files */}
      {busy && <p className="text-sm text-ink-muted">Loading…</p>}
      {regularFiles.length === 0 && folders.length === 0 && !busy && <p className="text-sm text-ink-muted">No files in this folder.</p>}
      <ul className="divide-y divide-slate-100 card overflow-hidden">
        {folders.map((f) => (
          <li key={f.id} className="flex items-center gap-3 px-4 py-3">
            <button className="flex-1 truncate text-left text-sm font-medium hover:text-brand-700" onClick={() => openFolder(f.id, f.name)}>📁 {f.name}</button>
            <button className="btn-secondary px-2 py-1 text-xs" onClick={() => rename(f.id, f.name)}>Rename</button>
            <button className="btn-secondary px-2 py-1 text-xs text-rose-700" onClick={() => remove(f.id)}>Delete</button>
          </li>
        ))}
        {regularFiles.map((f) => (
          <li key={f.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1 truncate text-sm">{f.name}</span>
            <span className="text-xs text-ink-muted">{sizeKb(f.size)}</span>
            <button className="btn-secondary px-2 py-1 text-xs" onClick={() => rename(f.id, f.name)}>Rename</button>
            <a className="btn-secondary px-2 py-1 text-xs" href={`/api/drive/download?fileId=${encodeURIComponent(f.id)}`}>Download</a>
            <button className="btn-secondary px-2 py-1 text-xs text-rose-700" onClick={() => remove(f.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Imported tree */}
      <section className="card p-4 space-y-2">
        <p className="text-sm font-semibold">Imported files (this workspace)</p>
        {meta.length === 0 ? <p className="text-sm text-ink-muted">Nothing imported yet — use Upload Folder or Import Google Drive Folder.</p> : (
          <FolderTreeNode node={tree} depth={0} onRemove={(f) => remove(f.id)} onDownload={(f) => { window.location.href = `/api/drive/download?fileId=${encodeURIComponent(f.id)}`; }} />
        )}
      </section>
    </div>
  );
}
