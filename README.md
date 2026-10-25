# TEFPC — Dr. Hamis Miraji Ally Simba Website Platform

A premium, English-only academic editorial and consultancy website built for the **Tanzania Economic and Financial Policy Consultancy (TEFPC)** and **Dr. Hamis Miraji Ally Simba** (Economist · Researcher · Consultant), based at Rita Tower in Posta, Dar es Salaam, Tanzania.

Built to present his professional identity, publish economic ideas & empirical research, track economics events in Tanzania, accept visitor inquiries, manage consultation bookings (free mentorship and paid advisory), and manage double opt-in email subscriptions.

---

## 1. System Architecture & Engineering Decisions

### Tech Stack
- **Framework:** Next.js 15 (App Router, Server-Side Rendering, Server Actions, Route Handlers, React 19).
- **Styling & Editorial Design:** Tailwind CSS with the approved editorial palette:
  - Warm cream background: `#F7F5EF`
  - Deep green primary: `#285748`
  - Dark ink text: `#192B2A`
  - Secondary text: `#52605A`
  - Subtle rules: `#D9DCD2`
  - Supporting pale surfaces: `#E9EDE4` and `#DCE3D7`
  - Typography: Elegant serif headings (`Newsreader` / `Playfair Display` / `Georgia`) paired with clean sans-serif body text (`Inter`).
- **Persistence:** Node.js 24 native `node:sqlite` (`DatabaseSync`) in Write-Ahead Logging (WAL) mode with foreign keys enabled. Zero native C++ compilation needed on Windows or Linux, zero external database daemon dependencies.
- **Transactional Protection:** `BEGIN IMMEDIATE` exclusive database transactions for consultation booking slots to mathematically prevent concurrent double-booking and race conditions.
- **Authentication:** Salted bcrypt password hashing (`bcryptjs`) with secure HTTP-only cookies and cryptographically secure random session tokens in the database. No public self-signup.
- **Email Dispatch & Outbox:** Nodemailer for live SMTP relay when configured, with automated safe local capture in `email_logs` table and a live Admin Outbox Inspector for development/testing without real SMTP credentials.

---

## 2. Prerequisites & Local Setup

### Prerequisites
- Node.js version 20+ (Node v24.20.0 recommended)
- npm version 10+
- OS: Windows 10/11, macOS, or Linux

### Quick Start (Windows PowerShell / CMD / Bash)

1. **Clone and enter repository:**
   ```powershell
   cd C:\Users\PC\Documents\economist_website
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   *(Default `.env` is pre-configured for local development with zero external credentials required).*

4. **Initialize Database & Demonstration Data:**
   ```powershell
   npm run seed
   ```
   *Creates the SQLite database at `./data/economist.db`, establishes all tables, and seeds demonstration economic insights, research papers, Tanzania conferences, consultation services, and sample subscribers.*

5. **Bootstrap Administrator Account Interactively:**
   ```powershell
   npm run admin:bootstrap
   ```
   *Prompts interactively for your admin username, email, and password in the terminal. No credentials are committed to Git or printed to logs. Can also be automated via environment variables `ADMIN_BOOTSTRAP_USER`, `ADMIN_BOOTSTRAP_EMAIL`, and `ADMIN_BOOTSTRAP_PASSWORD` during deployment.*

6. **Start Local Development Server:**
   ```powershell
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 3. Operational CLI Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Starts local development server on `http://localhost:3000` |
| `npm run build` | Compiles optimized production bundle and pre-renders static routes |
| `npm start` | Runs the compiled production build |
| `npm run typecheck` | Validates TypeScript types across the entire project |
| `npm test` | Executes automated integration test suite (17 test suites; code coverage was not measured) |
| `npm run db:backup` | Creates an atomic snapshot backup of `./data/economist.db` in `./backups/` via SQLite `VACUUM INTO` |
| `npm run seed` | Seeds initial client content (Dr. Simba, TEFPC, publications, services) |
| `npm run demo:clear` | Purges demonstration content without deleting real bookings, inquiries, or subscribers |
| `npm run admin:bootstrap` | Interactively creates or updates administrator credentials |
| `npm run screenshots` | Uses headless Edge browser to capture desktop & 360px screenshots |

---

## 4. Key Functional Workflows

### A. Consultation Bookings (Zero Account Required)
1. **Visitor Journey:** Selects Service (Free mentorship or Paid advisory) → Format (Online Video or In-person at Dar es Salaam office) → Selects available date & time slot → Submits contact details and topic summary.
2. **Transactional Slot Reservation:** Creates booking with status `pending_review` inside an immediate transaction. Overlapping concurrent requests are locked out and rejected.
3. **External Payments:** Paid services are strictly handled outside the site (CRDB / NMB bank transfer or M-Pesa). The booking status and payment status (`not_applicable`, `awaiting_payment`, `paid`) are separate. Only an authenticated admin can mark Paid.
4. **Private Management:** Each booking receives an unguessable 64-character random management token URL (`/consultation/manage/[token]`). Guests can view status, meeting link (when confirmed), office instructions, or cancel their reservation.
5. **Slot Release:** Expired pending requests (configurable `PENDING_BOOKING_EXPIRY_HOURS`, default 24h) and cancellations immediately release the time slot for other visitors.

### B. Visitor Inquiries ("Ask a Question")
1. Submissions require Name, Email, and Message (10–3000 chars).
2. Features server-side validation, rate limiting (max 5/hour/IP), and a hidden honeypot field (`website_hp`) to deflect bots.
3. Submissions enter the Admin Inquiries Inbox (`new` status) and send an honest acknowledgement email stating clearly that questions do not guarantee free detailed consultations.
4. Questions do **not** enroll users in publication mailings.

### C. Email Subscriptions & Notifications
1. Double opt-in: Visitors submit email (name optional) with explicit consent checkbox.
2. An activation link with a random token is emailed (`/subscribe/verify?token=...`).
3. Confirmed subscribers receive publication alerts when the researcher clicks "Send Alert" on a published insight.
4. Campaign deduplication in `email_campaigns` table guarantees that editing or republishing an article can never duplicate email sends.
5. One-click unsubscribe (`/subscribe/unsubscribe?token=...`) requires no login and excludes the recipient from future campaigns.

---

## 5. Client Admin Guide

Log in at `http://localhost:3000/admin/login` using your bootstrapped credentials.

### Admin Sections:
- **Overview Dashboard (`/admin`):** High-level view of pending bookings, new inquiries, active subscribers, and published articles.
- **Profile & Settings (`/admin/profile`):** Update researcher name, title, bio, portrait image, CV upload (PDF), hero headline, contact email, office address, and payment instructions.
- **Ideas & Insights (`/admin/insights`):** Write editorial articles in rich text, toggle Draft/Publish, set featured story, and dispatch subscriber alerts.
- **Research & Publications (`/admin/research`):** Catalog working papers, journal articles, upload official paper PDFs, and link DOI records.
- **Events in Tanzania (`/admin/events`):** Announce upcoming policy forums, conferences, and distinguish self-organized from third-party events.
- **Questions Inbox (`/admin/questions`):** Review inquiries, mark statuses (`new`, `read`, `answered`, `archived`), record private research notes, or reply via email.
- **Services & Hours (`/admin/consultation`):** Configure consultation services (prices, duration, format), weekly office hours (Mon-Sun), and blackout dates.
- **Bookings Manager (`/admin/bookings`):** Review pending reservations, confirm/decline bookings, input Google Meet/Zoom links, and record payment receipt.
- **Subscribers (`/admin/subscribers`):** View confirmed and pending subscribers; manage unsubscribes.
- **Outbox Inspector (`/admin/emails`):** View all outgoing transactional emails in real-time with rendered HTML previews.
- **Launch Readiness Checklist (`/admin/launch-check`):** Automated audit identifying remaining placeholders or unconfigured credentials.
- **Demo Content Tool (`/admin/demo-data`):** One-click button to purge demonstration content before public deployment.

---

## 6. Production Deployment Checklist

Before deploying publicly:
1. **Domain & SSL/HTTPS:** Configure domain DNS (A / CNAME records) pointing to your production host and ensure HTTPS is active.
2. **Environment Variables:**
   - Set `NODE_ENV=production`.
   - Set `SITE_URL=https://your-custom-domain.tz`.
   - Set `ADMIN_SESSION_SECRET` to a random 64-character secret.
   - Configure live SMTP credentials:
     - `SMTP_HOST=smtp.mailprovider.com`
     - `SMTP_PORT=587`
     - `SMTP_USER=user@domain.tz`
     - `SMTP_PASS=secure-password`
     - `SMTP_FROM="Dr. [Name] <contact@domain.tz>"`
3. **Persistent File Storage:** Ensure the upload directory (`UPLOAD_DIR=./public/uploads`) and SQLite database directory (`./data`) reside on persistent storage or a mounted volume.
4. **Purge Demo Data:** Run `npm run demo:clear` or use the Admin Demo Data panel to remove demonstration articles and reset placeholders.
5. **Upload Official Assets:** Upload official portrait photograph and official Curriculum Vitae (PDF) in Admin Profile settings.
6. **Legal & Privacy Review:** Review `/privacy` with local legal counsel under the Tanzania Personal Data Protection Act (PDPA 2022).
7. **Database Backups:** Schedule regular backups of `./data/economist.db` using SQLite VACUUM INTO or file snapshots.
