import "server-only";
import { HF_REPO, HF_ROOT, formatBytes, sanitizeHfPath, splitHfPath } from "@/lib/hf-shared";

const TREE_API = "https://huggingface.co/api/datasets";
const FILE_RESOLVE = "https://huggingface.co/datasets";
const LIST_CACHE_MS = 60_000;
const listCache = new Map<string, { at: number; entries: HfEntry[] }>();

export interface HfEntry { name: string; path: string; type: "file" | "directory"; size?: number }

export function hfConfigured(): boolean {
  return Boolean(process.env.HF_TOKEN);
}

function hfToken(): string {
  const t = process.env.HF_TOKEN;
  if (!t) throw new Error("HF_TOKEN is not configured (server-only).");
  return t;
}

function encodePath(clean: string): string {
  return clean.split("/").map(encodeURIComponent).join("/");
}

export async function listHfFolder(raw: string | null | undefined): Promise<{ path: string; entries: HfEntry[] }> {
  const path = sanitizeHfPath(raw);
  if (!path) throw new Error("Invalid path.");
  const cached = listCache.get(path);
  if (cached && Date.now() - cached.at < LIST_CACHE_MS) return { path, entries: cached.entries };
  const res = await fetch(`${TREE_API}/${HF_REPO}/tree/main/${encodePath(path)}`, {
    headers: { Authorization: `Bearer ${hfToken()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("Hugging Face token rejected (check HF_TOKEN).");
    throw new Error(`Hugging Face listing failed (${res.status}).`);
  }
  const raw2 = (await res.json()) as Array<{ path: string; type: string; size?: number }>;
  const entries = raw2
    .map((e) => ({ name: splitHfPath(e.path).pop() ?? e.path, path: e.path, type: (e.type === "directory" ? "directory" : "file") as "file" | "directory", size: typeof e.size === "number" ? e.size : undefined }))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1));
  listCache.set(path, { at: Date.now(), entries });
  return { path, entries };
}

export { formatBytes };

export async function fetchHfFile(raw: string): Promise<{ upstream: Response; fileName: string }> {
  const path = sanitizeHfPath(raw);
  if (!path || path === HF_ROOT) throw new Error("Invalid file path.");
  const fileName = splitHfPath(path).pop() ?? "file.pdf";
  const res = await fetch(`${FILE_RESOLVE}/${HF_REPO}/resolve/main/${encodePath(path)}`, {
    headers: { Authorization: `Bearer ${hfToken()}` },
    cache: "no-store",
  });
  if (!res.ok || !res.body) throw new Error(`Hugging Face fetch failed (${res.status}).`);
  return { upstream: res, fileName };
}
