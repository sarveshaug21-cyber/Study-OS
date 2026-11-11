# Google Cloud setup for the Study OS copy

**What this is:** the exact, ordered steps to create the Google Cloud project for the copy. The Cloud Console browser in OpenCode could not sign in, so this is done **once, by you, in your own browser**. Everything else is already done and tested here.

Copy's public URL (via Tailscale Funnel, port 8443 → 127.0.0.1:3100):

```
https://hp-pavillion.tail7ec2e2.ts.net:8443
```

The OAuth redirect URI has been set in `.env.local` already:

```
https://hp-pavillion.tail7ec2e2.ts.net:8443/api/drive/callback
```

**Exact values to register in Google Cloud (as you pasted):**

- Authorised JavaScript origin: `https://hp-pavillion.tail7ec2e2.ts.net:8443`
- Authorised redirect URI: `https://hp-pavillion.tail7ec2e2.ts.net:8443/api/drive/callback`

Local-server origins/URIs (optional — copy is bound to 127.0.0.1:3100):

```
http://localhost:3100
http://127.0.0.1:3100
http://localhost:3100/api/drive/callback
http://127.0.0.1:3100/api/drive/callback
```

Note: `http://192.168.1.191:3100` is no longer served (copy now binds localhost only; the old LAN origin won't work — remove it if you added it).

The app only ever requests the scope `https://www.googleapis.com/auth/drive.file` (access only to files/folders granted via the Picker). No other Drive scopes are requested, so no restricted-scope verification is needed while the app is in "Testing".

---

## Step 1 — Create the project

1. Go to **https://console.cloud.google.com/** and sign in with the Google account that should own this project.
2. Top-left project picker → **New project**.
3. Project name: `study-os-copy` (any name is fine). Note the **project ID** it shows (you'll see it in IAM settings; not secret).
4. **Create** and wait for it to finish, then select the new project.

## Step 2 — Enable the APIs

1. **APIs & Services → Library**.
2. Search **Google Drive API** → enable it.
3. Search **Google Picker API** → enable it.

(Cloud Console may call this "APIs & Services → Enabled APIs & services" with an **+ ENABLE APIS AND SERVICES** button — same thing.)

## Step 3 — OAuth consent screen (Google Auth Platform)

1. **Google Auth Platform → Branding** (or **APIs & Services → OAuth consent screen**):
   - App name: **Study OS Copy**
   - User support email: your email
   - Developer contact information: your email
   - **Save**
2. **Audience**: **External** → confirm.
3. **Test users** → **+ Add users** → add the Google account(s) that will use the copy (start with yours). While in Testing, only these accounts can consent. (Up to 100 test users; no Google verification needed at this size.)
4. **Data Access** → **Add or remove scopes** → add exactly one scope:
   `https://www.googleapis.com/auth/drive.file`
   → **Update** → **Save**.
   Do not add any other scope.
5. Leave **Publishing status** as **Testing**.

## Step 4 — OAuth 2.0 Web Application credentials

1. **Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Name: `Study OS Copy Web`.
4. **Authorized JavaScript origins** — add:
   ```
   https://hp-pavillion.tail7ec2e2.ts.net:8443
   ```
   and, if you want on-server testing too: `http://localhost:3100`, `http://127.0.0.1:3100`.
5. **Authorized redirect URIs** — add:
   ```
   https://hp-pavillion.tail7ec2e2.ts.net:8443/api/drive/callback
   ```
   and, optionally, `http://localhost:3100/api/drive/callback`, `http://127.0.0.1:3100/api/drive/callback`.
6. **Create**. In the dialog that appears, click **Download JSON** (`client_secret_*.json`). Keep it safe; do not email it or paste it anywhere.

## Step 5 — Restricted API key (Google Picker only)

Needed only so the browser Picker can load. The Drive calls themselves go through the server with OAuth tokens and never use this key.

1. **Credentials → Create credentials → API key**.
2. Click through to **edit** the key (pencil icon).
3. Name: `Study OS Copy Picker key`.
4. **Application restrictions → Websites** → add HTTP referrers (Funnel URL is required; localhost ones are for on-server testing only):
   ```
   https://hp-pavillion.tail7ec2e2.ts.net:8443/*
   http://localhost:3100/*
   http://127.0.0.1:3100/*
   ```
5. **API restrictions → Restrict key** → select only **Google Picker API**.
6. **Save**. Copy the key (it's shown once).

## Step 6 — Load the credentials into the copy (no secrets ever printed)

On this machine:

```bash
cd /home/sarvesh/study-os-copy
node scripts/set-google-env.mjs /path/to/downloaded/client_secret_*.json
```

It will:
- extract `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the JSON,
- silently prompt you for the Picker **API key** (input hidden — it never appears on screen, in logs or in this chat),
- write `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_API_KEY`, `NEXT_PUBLIC_GOOGLE_API_KEY` into `.env.local` (mode 600),
- print only lengths/suffixes — never values.

Then restart the copy and tell me (or run):

```bash
cd /home/sarvesh/study-os-copy && npx next start -H 127.0.0.1 -p 3100
```

## Step 7 — Test the full flow

1. Open **https://hp-pavillion.tail7ec2e2.ts.net:8443** (reachable from anywhere, including your Mac).
2. Sign in with a Supabase account (the copy shares the original's Supabase project **by your instruction**).
   - Note: before you connect Drive, check whether the original deployment ever had Google Drive credentials — the copy uses a **new** encryption key, so a Drive refresh token written by the copy cannot be decrypted by the original (the original currently has **no** Google credentials configured, so there is nothing to break today; just don't point both at one connection later).
3. Sidebar → **Cloud Files** (or Settings → Cloud Files) → **Connect Google Drive**.
4. Consent screen (Testing mode) → choose the Google account you added as a test user → **Continue** → allow Drive File access.
5. You land back at Cloud Files with the Picker open → create or select the **Study OS** folder (or any folder) → it appears in the file list.
6. Upload a small file; rename it; delete it — all should round-trip to your Drive.

If the Picker or connect flow fails, tell me the exact error text (it contains no secrets) and I'll debug.
