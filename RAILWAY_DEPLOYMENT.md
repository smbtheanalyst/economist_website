# Railway Production Deployment Guide

**Client:** Tanzania Economic and Financial Policy Consultancy (TEFPC)  
**Researcher:** Dr. Hamis Miraji Ally Simba (Economist · Researcher · Consultant)  
**Repository:** `smbtheanalyst/economist_website`  
**Branch:** `feat/economist-website`  
**Architecture:** Single Unified Next.js 15 Application + SQLite WAL + Persistent Volume  

---

## 1. Core Architectural Requirements on Railway

1. **Single Container Instance (Zero Horizontal Autoscaling):**
   - SQLite relies on local POSIX file locking (`node:sqlite` in WAL mode).
   - In `railway.json`, `numReplicas` is locked to **`1`**.
   - **DO NOT** enable horizontal autoscaling or configure multiple replicas, as concurrent processes across separate containers cannot share an SQLite WAL file.
2. **Persistent Volume (`/data`):**
   - Attach exactly **one persistent volume** mounted at mount path: **`/data`**.
   - SQLite database resides at: `/data/economist.db`.
   - Uploaded assets reside at: `/data/uploads`.
   - Data on the volume persists across container restarts, crash recoveries, and deployments.
3. **No Build-Time Demo Data Seeding:**
   - Deployment scripts do **not** run demo seed or create default passwords.
   - The database schema is initialized dynamically at runtime if not present (`CREATE TABLE IF NOT EXISTS`), preserving existing client records.

---

## 2. Step-by-Step Railway Deployment Guide

### Step 1: Create a Railway Project & Link GitHub Repository
1. Log in to [Railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `smbtheanalyst/economist_website`.
4. Choose branch: **`feat/economist-website`** (or `main` after merging).

### Step 2: Configure Build & Deploy Settings
The repository includes `railway.json` and `nixpacks.toml` pre-configured:
- **Builder:** `NIXPACKS` (Node.js 24 with lockfile enforcement via `npm ci`).
- **Build Command:** `npm run build`
- **Start Command:** `npm start` (Runs `next start -H 0.0.0.0` which binds to `0.0.0.0` and listens on Railway's `$PORT`).
- **Healthcheck Path:** `/api/health` (Exposes no sensitive data; returns HTTP 200 when alive and database connectivity is verified).
- **Restart Policy:** `ON_FAILURE` (max 10 retries).

### Step 3: Attach Persistent Volume
1. In the Railway project canvas, click on your service.
2. Navigate to **Data** / **Volumes** tab.
3. Click **Add Volume**.
4. Set **Mount Path** to:
   ```text
   /data
   ```
5. Click **Add**.

### Step 4: Configure Production Environment Variables
In your Railway Service → **Variables** tab, add the following variables:

| Variable Name | Recommended Value | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations, secure cookies, and strict SMTP validation |
| `SITE_URL` | `https://tefpc.or.tz` | Canonical public website URL |
| `ADMIN_ORIGIN` | `https://admin.tefpc.or.tz` | Origin URL for the administrator subdomain |
| `ADMIN_HOST` | `admin.tefpc.or.tz` | Hostname matched by host-aware routing middleware |
| `DATABASE_PATH` | `/data/economist.db` | Points SQLite to the persistent Railway volume |
| `UPLOAD_DIR` | `/data/uploads` | Points file uploads to the persistent Railway volume |
| `ADMIN_SESSION_SECRET` | *(64-char random string)* | Cryptographic salt/key for session validation |
| `SITE_TIMEZONE` | `Africa/Dar_es_Salaam` | Consultation and event timezone (EAT, UTC+3) |
| `PENDING_BOOKING_EXPIRY_HOURS` | `24` | Auto-release window for unconfirmed pending bookings |
| `SMTP_HOST` | *(client SMTP host)* | e.g. `smtp.mailgun.org` or client private mail server |
| `SMTP_PORT` | `587` | Standard TLS submission port |
| `SMTP_SECURE` | `false` | `false` for port 587 (STARTTLS), `true` for port 465 (SSL) |
| `SMTP_USER` | *(client SMTP username)* | SMTP authentication user |
| `SMTP_PASS` | *(client SMTP password)* | SMTP authentication password |
| `SMTP_FROM` | `"TEFPC Communications <noreply@tefpc.or.tz>"` | Verified sender header (Do NOT use info@tefpc.or.tz until active) |

> [!WARNING]
> **SMTP Production Limitation:** If SMTP credentials remain unconfigured in production (`NODE_ENV=production`), the application **explicitly refuses** to silently use local capture. Dispatches will fail loudly and log to `email_logs`.

---

## 3. Custom Domain & DNS Configuration

Railway uses a dynamic edge proxy network and **does not provide fixed public IPv4 addresses**. Do **not** attempt to configure generic A records pointing to arbitrary static IPs.

### Step 1: Add Custom Domains in Railway Dashboard
1. Go to your Service → **Settings** → **Domains**.
2. Click **Custom Domain** and enter:
   ```text
   tefpc.or.tz
   ```
3. Click **Custom Domain** again and enter:
   ```text
   admin.tefpc.or.tz
   ```
4. Railway will display the exact DNS targets for each domain (typically `<service>.up.railway.app` or an assigned DNS verification target).

### Step 2: Configure Records with Your DNS Registrar

#### For the Admin Subdomain (`admin.tefpc.or.tz`):
Standard DNS allows CNAME records on all subdomains.
- **Type:** `CNAME`
- **Host / Name:** `admin`
- **Target / Value:** *(Exact target supplied by Railway)*
- **TTL:** 300 (or Automatic)

#### For the Apex Domain (`tefpc.or.tz`):
Standard RFC DNS specifications do not permit a CNAME on the zone apex (`@`).

1. **If your DNS provider supports CNAME Flattening / ALIAS / ANAME:**  
   *(e.g., Cloudflare, Route 53, Namecheap ALIAS, DNSimple)*
   - **Type:** `ALIAS` / `ANAME` (or `CNAME` with flattening enabled)
   - **Host / Name:** `@` (or `tefpc.or.tz.`)
   - **Target / Value:** *(Exact target supplied by Railway)*
2. **If your DNS provider does NOT support apex CNAME flattening:**  
   *(e.g., traditional cPanel, legacy registrars)*
   - **Recommended Alternative:** Delegate DNS nameservers to **Cloudflare** (free tier). Cloudflare automatically flattens apex CNAMEs to point to Railway's proxy seamlessly.
   - **Alternative B:** Add `www.tefpc.or.tz` as the custom domain in Railway (using standard CNAME), and configure an HTTP 301 Forwarding rule at your registrar redirecting `http://tefpc.or.tz/*` to `https://www.tefpc.or.tz/*`.

---

## 4. Host-Aware Routing & Cookie Security Verification

The platform's [`middleware.ts`](file:///c:/Users/PC/Documents/economist_website/middleware.ts) handles domain splitting automatically behind Railway's reverse proxy:

1. **Host Detection:** Reads `x-forwarded-host` forwarded by Railway.
2. **Public Route (`tefpc.or.tz`):** Visiting `/admin` or `/admin/*` permanently redirects (HTTP 308) to `https://admin.tefpc.or.tz/admin...`, preserving path and query string.
3. **Admin Route (`admin.tefpc.or.tz`):** Visiting `/` internally rewrites to `/admin`. Direct subpaths (`/bookings`, `/profile`, `/insights`, etc.) map to their administrative screens.
4. **Host-Only Cookies (RFC 6265):** The admin session cookie (`econ_admin_session`) is set with `Path=/` and **no Domain attribute**. The browser strictly restricts the cookie to `admin.tefpc.or.tz`; it is never sent to the apex domain `tefpc.or.tz`.
5. **CSRF Origin Protection:** Mutating requests validate the HTTP `Origin` header, allowing only `https://admin.tefpc.or.tz` and `https://tefpc.or.tz`.

---

## 5. Post-Deployment Administration & Bootstrap

### Bootstrapping the Admin Account on Railway
Never hardcode or commit administrator credentials to Git. Use one of two secure options:

#### Option A: One-Off Execution via Railway CLI
From your local terminal:
```bash
railway run npm run admin:bootstrap
```
The command will interactively prompt for username, email, and password, hashing credentials directly in the persistent `/data/economist.db`.

#### Option B: Environment Variable Bootstrap
1. In Railway Variables, temporarily set:
   ```env
   ADMIN_BOOTSTRAP_USER=simba_admin
   ADMIN_BOOTSTRAP_EMAIL=admin@tefpc.or.tz
   ADMIN_BOOTSTRAP_PASSWORD=YourStrongTemporarySecretPassword123!
   ```
2. In Railway Service → Deployments → Click **...** → **Run Command**:
   ```bash
   npm run admin:bootstrap
   ```
3. Once created, **immediately delete** `ADMIN_BOOTSTRAP_PASSWORD` from Railway Variables.

---

## 6. Backup, Restore & Maintenance Procedures

### Atomic Online Database Backup
To create a live atomic snapshot without stopping the application:
```bash
railway run npm run db:backup
```
- Creates an online snapshot of `/data/economist.db` using SQLite's native `VACUUM INTO`.
- Copies all uploaded files from `/data/uploads` into a timestamped directory beneath `/backups`.

### Restoring from Backup
```bash
railway run npm run db:restore /path/to/backup_folder
```
- Validates backup integrity.
- Safely replaces the database and cleans up stale WAL/SHM locks.
- Restores files into `/data/uploads`.

### Pending Email Dispatch & Retry Mechanism
When real SMTP is configured, transient network failures during dispatch are caught and retried automatically (up to 2 retries with exponential backoff). All failed dispatches are recorded in `email_logs`.

To process and resend failed emails:
```bash
railway run npm run email:retry
```
This queries all records with `delivery_status = 'failed'` and attempts immediate resend.

---

## 7. Remaining Production Launch Checklist

Before sharing the live site with public visitors:

1. [ ] **Persistent Volume Verification:** Confirm Railway volume is mounted to `/data`.
2. [ ] **DNS Record Propagation:** Verify `admin.tefpc.or.tz` and `tefpc.or.tz` resolve to Railway's edge network.
3. [ ] **Official Mailbox Setup:** Activate `info@tefpc.or.tz` with client mail provider. Once verified, configure it in `/admin/profile`.
4. [ ] **Live SMTP Relay:** Supply verified production SMTP credentials in Railway Variables.
5. [ ] **Bank & Payment Remittance:** Enter official CRDB / NMB corporate bank details and M-Pesa Till number via `/admin/profile`.
6. [ ] **Legal Review:** Conduct local legal review of `/privacy` under the Tanzania Personal Data Protection Act (PDPA 2022).
