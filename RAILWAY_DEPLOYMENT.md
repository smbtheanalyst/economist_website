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
3. **Startup Schema Initialization Without Demo Seeding:**
   - On container startup, Next.js calls `getDb()` which executes `initSchema(db)`.
   - `initSchema(db)` consists **strictly of `CREATE TABLE IF NOT EXISTS` statements** for all 14 tables.
   - It contains **zero `INSERT` statements**.
   - A newly deployed container boots with an empty, clean production schema without automatically creating demo articles, mock bookings, fake subscribers, or default accounts.

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

## 5. Production Content Initialization & Admin Bootstrap

> [!IMPORTANT]
> **Why `railway run` must NOT be used for database commands:**  
> The `railway run <cmd>` command executes on your **local machine** while injecting remote environment variables. Because `/data/economist.db` and `/data/uploads` live on a physical persistent volume mounted **only inside the remote Linux container**, local commands cannot reach `/data`.  
> All administrative scripts targeting `/data` must be executed **inside the running container** via the **Railway Dashboard Web Terminal** or **`railway ssh`**.

### Step 5.1: Initializing Verified TEFPC Content into Production

On a fresh deployment, the database schema is automatically created empty. To populate verified TEFPC content without copying test data or overwriting future administrative edits:

1. Open the container terminal:
   - **Via Railway Dashboard (Recommended):**  
     Navigate to Railway Dashboard → Project → Service → Deployments → Click the active deployment → Click the **Terminal** tab.
   - **Via Railway CLI:**  
     Run `railway ssh` in your local project terminal.
2. Run the production content initialization command:
   ```bash
   npm run prod:init-content
   ```
3. **Strict Content Integrity & Safeguards:**
   - **Site Settings:** Sets Dr. Hamis Miraji Ally Simba's confirmed profile, bio, affiliations, qualifications, research interests, and Rita Tower office address. Bank details, payment instructions, and `contact_email` are kept empty until officially supplied and activated. If site settings already exist, re-running initialization leaves them untouched.
   - **Academic Research (7 Publications):** Imports bibliographic citations from the CV with verbatim author attributions (*Hamisi Miraji Simba* / *Hamisi Miraji Ally Simba*). Because abstracts and DOI links are not supplied in the CV, they are initialized with empty fields and saved in **`draft` (unpublished)** status for admin review.
   - **Editorial Insights:** Initialized in **`draft` (unpublished)** status. No draft articles appear on the public site.
   - **Events:** **Zero** events are published.
   - **Consultation Services & Availability:** The 3 consultation services are imported with **`is_active = 0` (provisional)**. Public bookings remain disabled until the client approves the schedule and pricing in `/admin/consultation`.
   - **Admin Edit Protection:** All record inserts use `ON CONFLICT(slug) DO NOTHING`. Re-running the script will **never** overwrite later admin edits, approved prices, or published articles.
   - **Zero Visitor/User Leaks:** Does not copy or touch `admin_users`, `admin_sessions`, `bookings`, `questions`, `subscribers`, or `email_logs`.

### Step 5.2: How Associated Assets Reach Production

- **Portraits and Public CV PDF:**  
  The web derivatives (`/portrait-dr-hamis-simba-card.jpg`, `/portrait-dr-hamis-simba-card.webp`, `/portrait-dr-hamis-simba.jpg`, `/portrait-dr-hamis-simba.webp`) and public CV document (`/dr-hamis-simba-cv-public.pdf`) are tracked directly in Git under [`public/`](file:///c:/Users/PC/Documents/economist_website/public).  
  During deployment, Nixpacks compiles and bundles these files into the container image build. Next.js serves them statically and cache-efficiently without requiring any manual asset upload.
- **Future Admin Uploads:**  
  Any files uploaded via `/admin` in the future are saved to `/data/uploads` on the persistent volume and served dynamically via [`app/uploads/[...file]/route.ts`](file:///c:/Users/PC/Documents/economist_website/app/uploads/[...file]/route.ts).

### Step 5.3: Interactive Admin Account Bootstrap

Never pass passwords in shell arguments or commit credentials to Git. Use the interactive terminal prompt:

1. In the Railway Dashboard → Service → Active Deployment → **Terminal** tab (or via `railway ssh`):
   ```bash
   npm run admin:bootstrap
   ```
2. The command will securely prompt:
   - Admin username (e.g. `simba_admin`)
   - Admin notification email (e.g. `admin@tefpc.or.tz`)
   - Secure admin password (minimum 10 characters)
3. The password is hashed using bcrypt (cost factor 12) and inserted into `/data/economist.db`. Credentials are never echoed in logs or saved to shell command history.

---

## 6. Backup, Restore & Maintenance Procedures

All maintenance commands that interact with the database and uploaded assets must be executed inside the container environment where `/data` is attached.

### Atomic Online Database Backup
Inside the Railway container terminal (or via `railway ssh`):
```bash
npm run db:backup
```
- Creates an online atomic snapshot of `/data/economist.db` using SQLite's native `VACUUM INTO`.
- Copies all uploaded files from `/data/uploads` into a timestamped directory beneath `/backups`.

### Restoring from Backup
Inside the Railway container terminal (or via `railway ssh`):
```bash
npm run db:restore /path/to/backup_folder
```
- Validates backup integrity.
- Safely replaces the database and cleans up stale WAL/SHM locks.
- Restores files into `/data/uploads`.

### Pending Email Dispatch & Retry Mechanism
When real SMTP is configured, transient network failures during dispatch are caught and retried automatically (up to 2 retries with exponential backoff). All failed dispatches are recorded in `email_logs`.

To process and resend failed emails inside the container:
```bash
npm run email:retry
```
This queries all records with `delivery_status = 'failed'` and attempts immediate resend.

---

## 7. Remaining Production Launch Checklist

Before sharing the live site with public visitors:

1. [ ] **Persistent Volume Verification:** Confirm Railway volume is mounted to `/data`.
2. [ ] **Fresh Startup Verification:** Verify the service starts and `/api/health` returns HTTP 200 with an empty, initialized schema.
3. [ ] **Run Content Initialization:** Run `npm run prod:init-content` in the Railway Web Terminal.
4. [ ] **Bootstrap Admin Account:** Run `npm run admin:bootstrap` in the Railway Web Terminal and provide your chosen password interactively.
5. [ ] **DNS Record Propagation:** Verify `admin.tefpc.or.tz` and `tefpc.or.tz` resolve to Railway's edge network.
6. [ ] **Official Mailbox Setup:** Activate `info@tefpc.or.tz` with client mail provider. Once verified, configure it in `/admin/profile`.
7. [ ] **Live SMTP Relay:** Supply verified production SMTP credentials in Railway Variables.
8. [ ] **Payment Instructions & Booking Approval:** Enter official bank remittance details and review/activate consultation services via `/admin/consultation` when ready.
9. [ ] **Legal Review:** Conduct local legal review of `/privacy` under the Tanzania Personal Data Protection Act (PDPA 2022).
