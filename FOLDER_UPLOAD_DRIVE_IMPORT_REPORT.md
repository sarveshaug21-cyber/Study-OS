# Study OS (copy) — Folder upload & recursive Google Drive import

**Date:** 2026-11-11 · **Copy:** `/home/sarvesh/study-os-copy` (original untouched; nothing committed)
**Server:** `npx next start -H 127.0.0.1 -p 3100` — healthy (`/api/health` 200)

## 1. What was built

### A. Local folder upload (`components/cloud-files.tsx` + `app/api/drive/upload*/route.ts`)
- New **Upload Folder** button — hidden `<input type="file" webkitdirectory multiple>`; collects `webkitRelativePath` so nested hierarchy is preserved exactly.
- **Upload Files** (multiple, flat) kept alongside.
- Server-side: `relativePath` accepted by `/api/drive/upload`, `/api/drive/upload/init`, `/api/drive/upload/complete`; new `lib/drive-route.ts` sanitises paths (rejects `..`, absolute paths, NULs, overlong segments/depth, strips filesystem-hostile chars); `ensureFolderPath()` find-or-creates the destination hierarchy inside the user's Study OS root (destination root is **never** client-controlled).
- Per-file flow: ≤4 MB inline multipart, otherwise resumable upload (`init` → PUT to Google → `complete`). Client runs with concurrency 3 and renders progress: total, processed, ✓ imported / ⏭ duplicates / ⊘ skipped / ✗ failed. Duplicate detection (name + md5/size) before upload — duplicates are not re-uploaded.
- Supported types (validated client *and* server side): PDF, DOCX, PPTX, XLSX, TXT, MD, DOC, PPT, JPG/JPEG/PNG. Others → `skipped-unsupported` with reason.
- Limits: 50 MB/file (upload), 4 MB inline, 500 MB cap for Drive copies, 10 MB for Google exports, 500 files per import, path depth ≤ 10.

### B. Google Drive folder import (Picker → enumerate → per-file copy)
- `Import Google Drive Folder` button opens a **folder-select Picker** (same scoped `view.setSelectFolderEnabled(true)`; no scope change).
- `POST /api/drive/import/enumerate` — recursive enumeration using page tokens (`nextPageToken`, pageSize 1000); yields a manifest `{ files[], skipped[], issues[], emptyFolders[], truncated[] }`; inaccessible sub-folders are recorded and skipped, not fatal; 500-file cap with `truncated` flag; Google Forms and oversized exports reported as skipped.
- `POST /api/drive/import/file` — imports one file: server fetches its metadata itself (never trusts client), classifies by server-side MIME (`drive-shared.classifyImportFile`): binaries → `files.copy` (server-to-server, bytes never through the app); Google Docs/Slides/Sheets/Drawings → `files.export` to `.docx/.pptx/.xlsx/.pdf` (10 MB export cap enforced); destination hierarchy preserved via `ensureFolderPath`; duplicate detection (name + md5 for binaries, name-only for exports); 403/404 → `inaccessible` (drive.file scope) surfaced per-file, never fatal; import is **idempotent** — safe to retry.
- UI shows an import preview (N ready, M skipped, inaccessible folders, empty folders, truncation notice) with **Import N files** / **Cancel**, live progress bar, and a final summary with counters, an inaccessible-files section, and **Retry failed** (per-file retry).

### C. Bound hooks & security
- `middleware.ts` (copy): per-IP rate limits — 20/min strict (AI/auth/Drive-token), **600/min for `/api/drive/import/*`** (one call per imported file), 120/min other API. 429 + Retry-After. Page-auth unchanged.
- All Drive routes `withUser` + `requireDriveAccess` (ownership, encrypted refresh tokens); no token ever reaches the client; destination folder always the user's own; folder IDs validated as base64url `[A-Za-z0-9_-]{10,}`.
- Storage (`google-drive-storage.ts`): `DriveFileMeta` extended — `folderPath`, `source` (`upload`|`drive-import`), `sourceFolder`, `status` (`imported`|`duplicate`), `sourceFileId`. Backward compatible.
- Path traversal impossible by construction (sanitiser + server-side joins inside root).
- No new Google scopes; no Cloud config change required — **no additional permission is requested or should be granted**; `drive.file` remains the only scope. Files the app cannot see report as `inaccessible` (see §4).

## 2. Verification results (this machine)
- `npx tsc --noEmit` ✔ · `next lint` ✔ (0 errors) · `next test` ✔ **53/53 pass** (24 new: `tests/drive-shared.test.ts` — path sanitiser, classifier, dedupe, tree builder, export mapping) · production build ✔ · server healthy on 3100 ✔.
- Rate limit: 125 consecutive unauthenticated POSTs to `/api/drive/import/enumerate` → 125×401, **zero 429s** (import bucket not tripping early); prior audit already confirmed 429+Retry-After at the 20/min strict limit.
- Routes exist and are guarded: POST `/api/drive/import/enumerate` → 401 unauth; POST `/api/drive/import/file` → 401 unauth; upload routes keep auth; `/` → 307 login.
- Browser (this machine): `/cloud-files` reachable, correct login redirect renders.
- **NOT end-to-end tested** — requires your Google consent: see §3.

## 3. What you must do to finish testing
1. Cloud Console: set up the copy's OAuth client as in `GOOGLE_CLOUD_SETUP.md` using the **Funnel redirect URI** you intend to use (`https://hp-pavillion.tail7ec2e2.ts.net:8443/api/drive/callback` or the localhost one).
2. Run `node scripts/set-google-env.mjs <downloaded.json>` (hidden input; prints no secrets).
3. Restart: `cd /home/sarvesh/study-os-copy && npx next start -H 127.0.0.1 -p 3100`.
4. Test matrix: create a test folder (nested: e.g. `Physics/Topic 5/`) with a PDF, a DOCX, a Google Doc, an unsupported `.exe`, and an empty subfolder → **Import Google Drive Folder** → check preview → import → verify hierarchy in Drive + in the "Imported files" tree; upload the same folder from disk → confirm duplicates are skipped; cross-user check: a second Supabase account cannot see either user's files (meta is per-user; Drive is per-token).
5. Report failures; they will be `inaccessible` (folder not granted via Picker) or tooling issues — both fixable without scope changes.

## 4. Google Cloud / permission notes
- **No new scopes requested.** The integration stays at `drive.file`. If some files import as `inaccessible`, that is the scope working as intended — the fix is to select the folder (or those files) through the Picker or open them once with the app. **Do not** grant `drive.readonly`/`drive` without a explicit decision and my explanation of the trade-off.
- Picker needs the **restricted API key** (Picker-only, HTTP-referrer limited) — set as `NEXT_PUBLIC_GOOGLE_API_KEY` (see `GOOGLE_CLOUD_SETUP.md` step 5/6).
- The resumable-upload URL (`init` response) is created for the caller's account and used directly by your browser; it is never exposed to other users.

## 5. Known limitations / follow-ups
- Metadata blob (`user_settings.notificationsJson`) read-modify-write is not concurrency-safe across instances; fine for one-instance demo, flagged for a dedicated table migration later (comment in `google-drive-storage.ts`).
- Local upload is retried by re-selecting files (browser file handles can't be replayed); import has true per-file retry.
- Import progress is client-aggregated (per-file POSTs) — no server task queue; a closed browser aborts an import mid-way but per-file state is idempotent, so re-import is safe.
- `webkitdirectory` is Chromium/Firefox/Edge; Safari 15+ supports it.
- Large folders > 500 files → start with a subfolder or raise `MAX_IMPORT_FILES`.
- The public deployment (original tree + Funnel) was not touched; no git commits made; `.env.local` files untouched except the redirect URI change recorded in the previous task.
