"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
interface DriveFile { id: string; name: string; mimeType: string; size?: string; modifiedTime?: string; }
export function CloudFiles() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [crumbs, setCrumbs] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [quota, setQuota] = useState<{ limit?: string; usage?: string } | null>(null);

  async function load(folder?: string) {
    setBusy(true); setError(null);
    try {
      const d = await api<{ files: DriveFile[]; rootFolderId: string; parentId: string }>("/api/drive/files" + (folder ? `?folderId=${encodeURIComponent(folder)}` : ""));
      setFiles(d.files); setFolderId(d.rootFolderId); setParentId(d.parentId);
      if (!folder) setCrumbs([{ id: d.rootFolderId, name: "Study OS" }]);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }
  async function loadQuota() {
    try { const d = await api<{ quota: { limit?: string; usage?: string } }>("/api/drive/quota"); setQuota(d.quota); } catch {}
  }
  useEffect(() => { load(); loadQuota(); }, []);

  async function connect() { window.location.href = "/api/drive/connect"; }
  async function disconnect() { try { await api("/api/drive/disconnect", { method: "POST" }); setFiles([]); setConnected(false); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true); setError(null);
    try {
      const fd = new FormData(); fd.append("file", f); fd.append("parentId", parentId || folderId || "");
      await fetch("/api/drive/upload", { method: "POST", body: fd });
      await load(parentId || folderId || undefined);
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); }
    finally { setBusy(false); e.target.value = ""; }
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
  function openFolder(id: string, name: string) {
    setCrumbs((c) => [...c, { id, name }]); load(id);
  }
  function goCrumb(i: number) {
    const c = crumbs[i]; setCrumbs(crumbs.slice(0, i + 1)); load(c.id === crumbs[0].id ? undefined : c.id);
  }

  // Detect connection state via first load error
  useEffect(() => { if (error && /not connected|not configured/i.test(error)) setConnected(false); else if (files.length >= 0 && !error) setConnected(true); }, [error, files]);

  if (connected === false) {
    return (
      <section className="card p-6 space-y-3">
        <p className="text-sm text-ink-muted">Google Drive is not connected. Connect your alternative Google account (with the existing 'Study OS' folder) to enable cloud file storage.</p>
        <button className="btn-primary" onClick={connect}>Connect Google Drive</button>
        <p className="text-xs text-ink-muted">Setup: create OAuth credentials in Google Cloud Console, enable Drive API, set redirect URI to your server's /api/drive/callback, and add GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI/GOOGLE_TOKEN_ENCRYPTION_KEY to .env.local.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-secondary" onClick={newFolder} disabled={busy}>New folder</button>
        <label className="btn-primary cursor-pointer">Upload<input type="file" className="hidden" onChange={upload} disabled={busy} /></label>
        <button className="btn-secondary" onClick={disconnect} disabled={busy}>Disconnect</button>
        <div className="ml-auto flex gap-2">
          <input className="input w-48" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" />
          <button className="btn-secondary" onClick={search} disabled={busy}>Search</button>
        </div>
      </div>
      {quota && <p className="text-xs text-ink-muted">Storage: {quota.usage ?? "?"} / {quota.limit ?? "?"} bytes used.</p>}
      <nav aria-label="Breadcrumb" className="flex gap-1 text-sm">
        {crumbs.map((c, i) => (<button key={c.id} className="text-brand-700 hover:underline" onClick={() => goCrumb(i)}>{c.name}{i < crumbs.length - 1 ? " /" : ""}</button>))}
      </nav>
      {busy && <p className="text-sm text-ink-muted">Loading…</p>}
      {files.length === 0 && !busy && <p className="text-sm text-ink-muted">No files in this folder.</p>}
      <ul className="divide-y divide-slate-100 card overflow-hidden">
        {files.map((f) => (
          <li key={f.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1 truncate text-sm">{f.name}</span>
            <span className="text-xs text-ink-muted">{f.size ? `${Math.round(Number(f.size)/1024)} KB` : ""}</span>
            <button className="btn-secondary px-2 py-1 text-xs" onClick={() => rename(f.id, f.name)}>Rename</button>
            <a className="btn-secondary px-2 py-1 text-xs" href={`/api/drive/download?fileId=${encodeURIComponent(f.id)}`}>Download</a>
            <button className="btn-secondary px-2 py-1 text-xs text-rose-700" onClick={() => remove(f.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
