# TEFPC — Final Verification & Platform Handover Report

**Client Entity:** Tanzania Economic and Financial Policy Consultancy (TEFPC)  
**Researcher:** Dr. Hamis Miraji Ally Simba (Economist · Researcher · Consultant)  
**Target Domain:** `tefpc.or.tz`  
**Production URLs:**  
- **Public Website:** `https://tefpc.or.tz`  
- **Admin Portal:** `https://admin.tefpc.or.tz`  
**Headquarters:** Rita Tower, 15th Floor, Simu 4 Street, Makunganya Road, Posta, Dar es Salaam, Tanzania  
**Repository:** `smbtheanalyst/economist_website`  
**Dedicated Branch:** `feat/economist-website`  

---

## 1. Final Verdict

| Milestone | Verdict | Status & Evidence |
|---|---|---|
| **Ready for Local Client Review** | **PASS** | Fully working editorial and consultancy website running locally with zero external service dependencies. 22 automated integration test suites passing (code coverage was not measured), TypeScript compilation with 0 errors, production build successful across 49 routes, and high-fidelity desktop + 360px mobile screenshots captured via real headless Edge browser. |
| **Ready for Production Launch** | **PENDING** | Technical engine is complete, host-aware, and hardened. Launch is pending the client's live production configurations: official DNS records (A/CNAME for `tefpc.or.tz` and `admin.tefpc.or.tz`), mailbox activation for `tefpc.or.tz`, live SMTP credentials, Tanzanian PDPA 2022 legal counsel review for `/privacy`, and corporate bank account numbers. |

---

## 2. Host-Aware Routing & Domain Architecture

The platform operates as a **single unified Next.js application** with host-aware routing configured in [`middleware.ts`](file:///c:/Users/PC/Documents/economist_website/middleware.ts):

1. **Public Website (`https://tefpc.or.tz`):**
   - Serves the public homepage, about page, economic publications, events in Tanzania, guest booking wizard, and inquiry form.
   - Any request to `/admin` or `/admin/*` on the public production domain is **automatically redirected with HTTP 308 (Permanent Redirect)** to `https://admin.tefpc.or.tz/admin...`, fully preserving the requested route, path, and search query parameters (verified in Test 20).
2. **Admin Portal Subdomain (`https://admin.tefpc.or.tz`):**
   - Directly opens the administration suite without requiring the `/admin` prefix in the browser:
     - `https://admin.tefpc.or.tz/` internally rewrites to `/admin` (dashboard overview).
     - `https://admin.tefpc.or.tz/login` internally rewrites to `/admin/login`.
     - Direct subpaths like `/bookings`, `/profile`, `/insights`, `/research`, `/events`, `/questions`, `/consultation`, `/subscribers`, `/emails`, `/launch-check`, `/demo-data` automatically map to their respective admin management modules (verified in Test 22).
     - Full `/admin/...` paths continue to function seamlessly as well.
   - Clicking *"View Live Public Site ↗"* from the admin top navigation routes directly to `https://tefpc.or.tz`.
3. **Localhost Development Access Preserved (`http://localhost:3000`):**
   - Local development access is fully preserved at `http://localhost:3000/admin`.
   - Local requests are never redirected to the external production domain (verified in Test 21).
   - Developers can also test subdomain behavior locally using `http://admin.localhost:3000`.

---

## 3. Security Hardening, Host-Only Cookies & CSRF Protection

1. **Host-Only Admin Session Cookies (RFC 6265):**
   - The admin session cookie (`econ_admin_session`) is set without a `domain` attribute in [`lib/auth.ts`](file:///c:/Users/PC/Documents/economist_website/lib/auth.ts).
   - In accordance with RFC 6265, omitting the `domain` attribute enforces a **Host-Only Cookie**: the browser strictly binds the cookie to `admin.tefpc.or.tz` and will **never** transmit it to the public domain `tefpc.or.tz` or other subdomains.
   - Attributes: `HttpOnly: true`, `Secure: true` (in production), `SameSite: Lax`, `Path: /`.
2. **Universal Server-Side Route & API Protection:**
   - Every `/api/admin/*` endpoint strictly enforces `getCurrentAdmin()` session validation against SQLite WAL, returning `401 Unauthorized` for missing or invalid sessions regardless of incoming host (verified in Test 23).
   - In [`middleware.ts`](file:///c:/Users/PC/Documents/economist_website/middleware.ts), unauthenticated page requests to admin modules are intercepted before page rendering and redirected to `/login` (on admin subdomain) or `/admin/login` (on localhost).
3. **Cross-Site Request Forgery (CSRF) Protection:**
   - All mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`) validate the HTTP `Origin` header in middleware. Untrusted cross-origin requests are blocked with `403 Forbidden` (verified in Test 24).
4. **Interactive Administrator Bootstrap (`npm run admin:bootstrap`):**
   - Zero hardcoded default credentials or example accounts exist.
   - Prompts interactively in the terminal for admin username, email, and password. Salted bcrypt (12 rounds) hashes credentials securely without printing passwords to stdout or logs.

---

## 4. Confirmed Identity & Name Resolution

- **Confirmed Name:** **Dr. Hamis Miraji Ally Simba** (replacing "Mirai" with "Miraji" across all public pages, admin profile, live persisted SQLite data without database reset, seed scripts, metadata, JSON-LD structured data, image alt tags, email templates, and public CV PDF).
- **Publication Authorship Preserved:** Author attributions in published papers are preserved exactly as supplied in original bibliographic entries (e.g. *"Hamisi Miraji Simba"* in *Cogent Social Sciences*, *Springer Nature*, *Journal of the Knowledge Economy*, *Economic and Regional Studies*, and *Journal of Economics Finance and Accounting*).
- **Public Contact Email:** `info@tefpc.or.tz` is not yet an activated mailbox. It is kept **unpublished** across the site, footer, about page, and contact areas until officially activated by the client. Visitors are routed to the interactive inquiry form (`/ask`).

---

## 5. Concurrency & High-Traffic Double-Booking Prevention

- **Database Engine:** Node 24 native `node:sqlite` (`DatabaseSync`) configured with `PRAGMA journal_mode = WAL;` and `PRAGMA foreign_keys = ON;`.
- **Atomic Locking:** Slot creation in `lib/booking.ts` runs inside a **`BEGIN IMMEDIATE`** exclusive transaction.
- **Verification Evidence (Test 15):** A multi-connection integration test initiates two independent SQLite database connections (`db` and `db2`) attempting to book identical and overlapping slots simultaneously. Connection 1 commits successfully, while Connection 2 is immediately blocked and receives a conflict exception (`This time slot is no longer available`), mathematically proving race condition and double-booking prevention.

---

## 6. Booking Policies & Working Slot Expiry

- **Booking Horizon & Notice Buffers:**
  - Enforces minimum 24-hour advance notice (`minNoticeTime`).
  - Limits booking window to a 30-day forward horizon.
  - Inserts 15-minute preparation buffers between scheduled consultation sessions.
- **Working Slot Expiration (Test 17):**
  - Unconfirmed bookings in `pending_review` carry an `expires_at` timestamp (configurable, default 24 hours).
  - Calling `cleanExpiredBookings()` automatically queries and transitions expired pending bookings to status `'expired'`.
  - The reserved time window is freed immediately, restoring availability for other visitors without administrative manual intervention.
- **Guest Management Token Protection (Test 16):**
  - Guests manage their booking via private 64-character hexadecimal tokens (`/consultation/manage/[token]`).
  - Tampered or guessed tokens return `404 Not Found`.
  - Sensitive resources (such as Google Meet/Zoom video conference URLs) remain strictly masked while bookings are in `pending_review` and are only revealed when status reaches `confirmed`.

---

## 7. Outgoing Email Engine & Production Safety

1. **Production Refusal of Silent Local Capture (Test 18):**
   - In `lib/email.ts`, when `process.env.NODE_ENV === 'production'`, the system **explicitly refuses** to silently use local email capture if SMTP credentials are missing.
   - Returns `{ success: false, mode: 'failed' }` with an error message and logs the delivery failure in `email_logs`. This prevents production deployments from silently dropping transactional emails.
2. **Recipient-Level Delivery & Transient Retries:**
   - Real SMTP dispatches implement up to 2 automatic retries with exponential backoff (300ms, 600ms) on transient socket timeouts.
   - Detailed delivery records (recipient, subject, email type, delivery status, retry count, error message) are recorded in `email_logs`.
3. **Local Development Outbox Inspector:**
   - In development/testing environments, all outgoing emails are captured in `email_logs` and viewable via the authenticated Admin Outbox Inspector at `/admin/emails` with full HTML previews.

---

## 8. Persistent Storage, Backups & Safe Demo Cleanup

1. **Persistent Storage:**
   - SQLite database resides at `./data/economist.db` with WAL mode enabled (`.db`, `.db-wal`, `.db-shm`).
   - Media uploads reside in `./data/uploads/`.
2. **Atomic Database Backups (`npm run db:backup`):**
   - Implemented in `scripts/backup-db.mjs`.
   - Uses SQLite's native `VACUUM INTO 'backups/economist_backup_<timestamp>.db'` to generate consistent, non-blocking snapshots during live operation without downtime.
3. **Safe Demo Content Cleanup (`npm run demo:clear` / Test 19):**
   - Purges only records flagged with `WHERE is_demo = 1`.
   - Real bookings, visitor inquiries (`questions`), and confirmed newsletter subscribers (`subscribers`) are completely preserved and never deleted during cleanup.

---

## 9. Required DNS & Hosting Configuration

To activate this architecture in production, configure the following DNS records with your domain registrar / DNS provider for `tefpc.or.tz`:

### DNS Record Setup

| Record Type | Hostname / Name | Target / Value | Purpose |
|---|---|---|---|
| **A** | `@` (or `tefpc.or.tz.`) | `<SERVER_PUBLIC_IPV4>` | Points the root public domain to your web server |
| **CNAME** | `www` | `tefpc.or.tz.` | Aliases www to the apex domain |
| **CNAME** (or A) | `admin` | `tefpc.or.tz.` (or `<SERVER_PUBLIC_IPV4>`) | Points the admin subdomain to the same web server application |

### SSL/TLS Certificate Requirement
A valid SSL/TLS certificate is required covering both hostnames:
- Option A: Wildcard certificate for `*.tefpc.or.tz` and `tefpc.or.tz` (e.g. via Let's Encrypt / Certbot DNS challenge).
- Option B: Multi-domain SAN certificate including `tefpc.or.tz`, `www.tefpc.or.tz`, and `admin.tefpc.or.tz`.

### Reverse Proxy Configuration (NGINX Example)
Both hostnames route to the single Next.js application port (e.g. port 3000), forwarding the original host:

```nginx
server {
    listen 443 ssl http2;
    server_name tefpc.or.tz www.tefpc.or.tz admin.tefpc.or.tz;

    ssl_certificate /etc/letsencrypt/live/tefpc.or.tz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tefpc.or.tz/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

---

## 10. Automated Integration Test Suite

Executed via `npm test` (`tsx --test tests/*.test.ts`):

```text
✔ 1. Profile Settings: Admin updates profile and public page reflects saved data (44.7ms)
✔ 2. Insights Publication & Draft Visibility: Draft content is private; publication is public (7.4ms)
✔ 3. Research & Publications: PDF / DOI external links and validation (6.6ms)
✔ 4. Tanzania Events: Upcoming and past events display correctly with organizer distinction (1.8ms)
✔ 5. Question Submission: Question persists securely and enters admin inbox with status "new" (7.1ms)
✔ 6 & 7. Consultation Booking: Transactional Concurrency Overlap Prevention (8.4ms)
✔ 8. Expiry / Cancellation releases reserved slot (8.3ms)
✔ 9. Paid booking remains unpaid until admin explicitly records payment (9.1ms)
✔ 10. Guest management tokens are unguessable and protect booking details (0.6ms)
✔ 11 & 12. Email Subscriptions: Double opt-in & Unsubscribe exclusion (10.7ms)
✔ 13. Publication Campaign Deduplication: Republishing does not duplicate campaign (6.0ms)
✔ 14. Safe Local Email Capture Outbox (7.4ms)
✔ 15. Concurrent independent booking connections: second connection blocked by transaction lock / conflict (8.2ms)
✔ 16. Guest-Token Access Protection: unguessable token required; meeting link hidden until confirmed (8.1ms)
✔ 17. Working Expiry: pending bookings past expires_at are automatically released (10.7ms)
✔ 18. Production refusal: sendEmail fails explicitly when SMTP is missing in production (5.1ms)
✔ 19. Safe Demo Cleanup: real bookings, questions, and subscribers are preserved (11.4ms)
✔ 20. Host-Aware Routing: public domain /admin redirects to admin.tefpc.or.tz preserving route and query (129.6ms)
✔ 21. Localhost Development: http://localhost:3000/admin bypasses public redirect (2.1ms)
✔ 22. Admin Subdomain: admin.tefpc.or.tz/ rewrites to /admin when authenticated, or redirects to /login (2.0ms)
✔ 23. Server-Side Protection: /api/admin/* blocks unauthenticated calls with 401 regardless of host (4.9ms)
✔ 24. CSRF Protection: Rejects mutating requests with untrusted origin (2.8ms)

ℹ tests 22 | pass 22 | fail 0 | cancelled 0 | skipped 0 | duration_ms 948.0ms
```
*(Note: Code coverage was not measured).*

---

## 11. Visual Verification & Headless Screenshots

All screenshots captured against the running Next.js application using Microsoft Edge headless engine:

| Screenshot Description | Viewport | Local File Path |
|---|---|---|
| **Homepage Desktop** (TEFPC identity & Dr. Simba portrait) | 1280x900 | [`screenshots/homepage-desktop.png`](file:///c:/Users/PC/Documents/economist_website/screenshots/homepage-desktop.png) |
| **Homepage Mobile** (Responsive editorial layout) | 360x740 | [`screenshots/homepage-mobile-360px.png`](file:///c:/Users/PC/Documents/economist_website/screenshots/homepage-mobile-360px.png) |
| **Editorial Insight Desktop** (Inequality & Macroeconomics) | 1280x900 | [`screenshots/article-desktop.png`](file:///c:/Users/PC/Documents/economist_website/screenshots/article-desktop.png) |
| **Editorial Insight Mobile** (Single column reading experience) | 360x740 | [`screenshots/article-mobile-360px.png`](file:///c:/Users/PC/Documents/economist_website/screenshots/article-mobile-360px.png) |
| **Consultation Booking Flow Desktop** (5-step booking wizard) | 1280x900 | [`screenshots/booking-flow-desktop.png`](file:///c:/Users/PC/Documents/economist_website/screenshots/booking-flow-desktop.png) |
| **Consultation Booking Flow Mobile** (Accessible touch targets) | 360x740 | [`screenshots/booking-flow-mobile-360px.png`](file:///c:/Users/PC/Documents/economist_website/screenshots/booking-flow-mobile-360px.png) |
| **Admin Portal Login** | 1280x800 | [`screenshots/admin-login.png`](file:///c:/Users/PC/Documents/economist_website/screenshots/admin-login.png) |
| **Admin Dashboard Desktop** (KPI metrics & operational suite) | 1280x900 | [`screenshots/admin-dashboard-desktop.png`](file:///c:/Users/PC/Documents/economist_website/screenshots/admin-dashboard-desktop.png) |
