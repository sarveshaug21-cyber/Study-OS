# Study OS (copy) — Google Drive API integration report

**Date:** 2026-11-11
**Copy location:** `/home/sarvesh/study-os-copy` (fresh `git clone --no-local` of the original repository at HEAD `353b882`; original `/home/sarvesh/study-portal/study-os` and the HP deployment **not modified**)
**Runtime used for tests:** this machine, port **3100** (original deployment owns 127.0.0.1:3000)
**Status:** code complete + tested · **Google Cloud console steps pending on you** (browser sign-in blocked here — see §5)

---

## 1. APIs enabled

**Pending user action (Step 2 of `GOOGLE_CLOUD_SETUP.md`):**
- Google Drive API — **to enable**
- Google Picker API — **to enable**

(I could not reach Cloud Console: the attached browser is signed out of Google and this environment has no other route to it — it's your step, deliberately.)

## 2. OAuth configuration

**Pending user action (Steps 3–5 of `GOOGLE_CLOUD_SETUP.md`):**
- Consent screen: Branding (app name "Study OS Copy"), Audience = External, Publishing status = Testing, test users = your Google account(s), scope exactly `drive.file`.
- OAuth 2.0 **Web application** client `Study OS Copy Web`:
  - JavaScript origins: `http://localhost:3100`, `http://127.0.0.1:3100`, `http://192.168.1.191:3100`
  - Redirect URIs: `http://localhost:3100/api/drive/callback`, `http://127.0.0.1:3100/api/drive/callback`, `http://192.168.1.191:3100/api/drive/callback`
- API key restricted to: HTTP referrers above + **Google Picker API only**.

## 3. Required redirect URI (already written to the copy's `.env.local`)

```
http://192.168.1.191:3100/api/drive/callback
```
Note: register the same three URIs in the console (§2); whichever origin you test from will work.

## 4. Environment variables still needed

`.env.local` (gitignored, mode 600) currently contains:
- Reused per your instruction: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPEN_NOTEBOOK_URL`, `OPEN_NOTEBOOK_API_URL`
- Freshly generated: `GOOGLE_TOKEN_ENCRYPTION_KEY` (64 hex chars, new — **not** the original's)
- Deliberately blanked: `OPENROUTER_API_KEY` (copy falls back to demo canned AI replies)
- **Needed from your Cloud setup** (load via `node scripts/set-google-env.mjs <downloaded.json>`, asked interactively, hidden):
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_API_KEY` and `NEXT_PUBLIC_GOOGLE_API_KEY` (same restricted Picker key)
- `GOOGLE_REDIRECT_URI` = `http://192.168.1.191:3100/api/drive/callback` (set)

Nothing is committed; `scripts/set-google-env.mjs` never prints values (prints lengths/suffix only).

## 5. What I completed vs what needs you

**Completed and verified here:**
- Fresh clone; `npm ci`, lint (errors fixed — see §6), typecheck ✔, **29/29 tests pass** ✔, production build ✔.
- Copy boots (`npx next start -p 3100`): `/api/health` → 200; `/` → 307 → `/auth/login`; `/api/subjects` → 401; `/api/drive/connect` → 401 unauthenticated; `/api/drive/callback` → 307 → `/cloud-files?error=state`; `/cloud-files` → 307 → login.
- Google Picker code hardened (typed gapi/Picker globals instead of `any`, escaped JSX entities) — the only file changed (`components/cloud-files.tsx`), purely lint/type hygiene; **no logic or behaviour change**.
- `scripts/set-google-env.mjs` written (JSON + hidden key prompt → `.env.local`; prints no secrets).
- `GOOGLE_CLOUD_SETUP.md` runbook written and previewed for you.

**Blocked on you (Google account steps — I will not/cannot do these):**
1. Sign into Cloud Console and complete `GOOGLE_CLOUD_SETUP.md` Steps 1–5.
2. Run the credential ingestion script (Step 6) — needs the downloaded JSON + your Picker key pasted into the hidden prompt.
3. Restart the copy: `cd /home/sarvesh/study-os-copy && npx next start -p 3100`.
4. Full flow test (Step 7): login → Cloud Files → Connect Google Drive → consent → Picker → select/create "Study OS" folder → upload/rename/delete a test file.
5. Report any error text (it contains no secrets).

## 6. Features implemented and tested (smoke evidence)

Implemented (pre-existing in HEAD, verified compiling/running here):
- Drive OAuth connect/callback/disconnect (`/api/drive/connect|callback|disconnect`) with state-cookie CSRF check, `drive.file` scope only, offline access.
- Refresh-token storage AES-256-GCM encrypted at rest in the user's settings blob (`lib/google-drive-storage.ts` + new per-copy `GOOGLE_TOKEN_ENCRYPTION_KEY`).
- Picker flow (`?pick=1`) for selecting/creating the "Study OS" folder (drive.file scope grants no folder enumeration — Picker is the intended path).
- File list/search/quota/upload (small inline + resumable >5 MB)/rename/delete/download routes under `/api/drive/*`.
- Token broker for the Picker (`/api/drive/token`) — short-lived access token, authenticated only.
- Google Docs/Picker referrer + API restrictions (to verify after you create the key).

Tested: lint ✔ (0 errors), typecheck ✔, 29 tests ✔ (incl. google-drive crypto/key tests), production build ✔, boot + route smoke tests ✔ (above). **End-to-end Drive round-trip is NOT yet tested — needs §5's Google sign-in steps.**

## 7. Lint history / fixes made to the copy

`components/cloud-files.tsx` — 9 pre-existing ESLint errors fixed (6× `no-explicit-any` → typed `Gapi`/`GooglePickerNamespace` declarations + narrowed optional Picker docs; 3× `react/no-unescaped-entities` → `&apos;`/`&lsquo;…&rsquo;`). No behaviour change. HEAD's lint gate now passes (0 errors; only unrelated warnings remain in unused-import files).

## 8. Remaining manual steps (summary)

1. Create Cloud project `study-os-copy`; enable Drive API + Picker API.
2. OAuth consent screen: branding, audience External, test users (you), scope `drive.file` only, status Testing.
3. OAuth Web client `Study OS Copy Web` with the 3 origins + 3 redirect URIs; download JSON.
4. Restricted API key: referrers above, Picker API only.
5. `node scripts/set-google-env.mjs <downloaded.json>`; restart on 3100.
6. Consent + Picker round-trip test; report outcome.
7. (Optional hardening) Bind the copy to localhost only when you stop testing, and kill it (`npx next start` runs until stopped).

## 9. Notes & caveats

- **Shared Supabase project** (your choice): the copy reads/writes the *same* database as the original. Data you create/modify in the copy lands in the original's tables. The copy's **new** encryption key means Drive tokens saved by the copy are unreadable by the original; today the original has **no** Google Drive credentials configured, so nothing is broken — avoid connecting the same Drive account there later without planning for that asymmetry.
- **Copy shares the Open Notebook LAN endpoint** (192.168.1.191:5055) with processing on the original host.
- Copy's login page is reachable on LAN:3100 while it runs; it is not public (no router forwarding, no Funnel changes — per your standing instruction, the public deployment was left exactly as I stopped it: Serve tailnet-only, Funnel not enabled).
- `.env.local` of the copy is independent; original `.env.local` untouched; no commits or pushes made; git status = `M components/cloud-files.tsx`, `?? GOOGLE_CLOUD_SETUP.md`, `?? scripts/set-google-env.mjs` (all uncommitted).
- WIP in the original tree (`app/subjects/page.tsx` etc.) was not copied (fresh clone of HEAD). If you want the copy to track the WIP, ask and I'll layer it on deliberately.

---

## UPDATE 2026-11-11 — Funnel live, credentials complete, verified publicly

- Copy is exposed publicly at **https://hp-pavillion.tail7ec2e2.ts.net:8443** (Funnel HTTPS :8443 → 127.0.0.1:3100). Port-443 original serve config (tailnet-only → 127.0.0.1:3000) untouched and verified.
- TLS valid: Let's Encrypt, CN=hp-pavillion.tail7ec2e2.ts.net, expires 2027-02-08, TLS1.3.
- Copy binds **127.0.0.1:3100 only** (LAN 192.168.1.191 no longer serves it).
- `.env.local` complete: GOOGLE_CLIENT_ID (72), GOOGLE_CLIENT_SECRET (35), GOOGLE_REDIRECT_URI = Funnel callback (62), NEW GOOGLE_TOKEN_ENCRYPTION_KEY (64 hex), restricted Picker key in GOOGLE_API_KEY + NEXT_PUBLIC_GOOGLE_API_KEY (67). Only lengths were ever printed.
- OAuth client JSON validated: type web, project_id study-os-copy, redirect URI = Funnel callback, origin = Funnel origin.
- Middleware now rebuilds redirects from x-forwarded-host/x-forwarded-proto (falls back to Host, then nextUrl) — public redirect verified: `/` → `https://hp-pavillion.tail7ec2e2.ts.net:8443/auth/login?next=%2F` (was http://localhost:3100 before the fix).
- Verified live: local health 200, Funnel health 200, Funnel root 307 to public login, `/api/drive/connect` 401 when logged out (OAuth starts only after Supabase login — correct).
- Folder upload + Drive import feature (this thread): see FOLDER_UPLOAD_DRIVE_IMPORT_REPORT.md.

### Remaining for the owner
1. Log in at https://hp-pavillion.tail7ec2e2.ts.net:8443 — verify only your data is visible.
2. Cloud Files → Connect Google Drive → consent (Testing mode) → create/select the "Study OS" folder via Picker.
3. Test Upload Folder, nested import, duplicates, unsupported types, a second (inaccessible) user's folder → expect "inaccessible" rows.
4. Everything works or report exact error text.
