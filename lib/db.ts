import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';

// Ensure the directory exists
const dbDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Global cache for singleton SQLite connection across hot reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __db_instance: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (!global.__db_instance) {
    const db = new DatabaseSync(path.resolve(DB_PATH));
    
    // Pragmas for performance and concurrency
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA busy_timeout = 5000;');

    initSchema(db);
    global.__db_instance = db;
  }
  return global.__db_instance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    -- Site & Profile Settings
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      researcher_name TEXT NOT NULL DEFAULT 'Dr. Hamis Mirai Ally Simba',
      professional_title TEXT NOT NULL DEFAULT 'Economist · Researcher · Consultant',
      portrait_url TEXT DEFAULT '/portrait-dr-hamis-simba-card.jpg',
      biography TEXT NOT NULL DEFAULT '',
      qualifications_json TEXT NOT NULL DEFAULT '[]',
      research_interests_json TEXT NOT NULL DEFAULT '[]',
      affiliations_json TEXT NOT NULL DEFAULT '[]',
      cv_url TEXT DEFAULT '/dr-hamis-simba-cv-public.pdf',
      hero_headline TEXT NOT NULL DEFAULT 'Research, insights and informed economic decisions.',
      hero_intro TEXT NOT NULL DEFAULT 'Economic research and perspectives on public policy, development and the forces shaping Tanzania’s economy.',
      contact_email TEXT NOT NULL DEFAULT 'info@tefpc.or.tz',
      office_address TEXT NOT NULL DEFAULT 'Tanzania Economic and Financial Policy Consultancy (TEFPC), Simu 4 Street, Makunganya Road, Rita Tower, 15th Floor, Posta, Dar es Salaam, Tanzania',
      office_instructions TEXT NOT NULL DEFAULT 'Office visits require building check-in at Rita Tower, 15th Floor, Posta. Photo identification is required for visitor pass issuance.',
      online_instructions TEXT NOT NULL DEFAULT 'Consultation sessions are conducted over a secure video link. The meeting URL will be made available upon confirmation.',
      payment_instructions TEXT NOT NULL DEFAULT 'For paid consultations, payments are accepted via direct Bank Transfer (NMB / CRDB) or Mobile Money (M-Pesa / Tigo Pesa). Transfer details and reference numbers are provided in your booking confirmation.',
      social_links_json TEXT NOT NULL DEFAULT '[]',
      is_demo INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Admin Users
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    -- Admin Sessions
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Ideas & Insights (Editorial Articles)
    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      content_html TEXT NOT NULL,
      topic TEXT NOT NULL,
      cover_image_url TEXT DEFAULT '',
      read_time_minutes INTEGER NOT NULL DEFAULT 5,
      is_featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
      published_at TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Research & Academic Publications
    CREATE TABLE IF NOT EXISTS research (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      abstract TEXT NOT NULL,
      authors TEXT NOT NULL,
      year INTEGER NOT NULL,
      publication_type TEXT NOT NULL CHECK(publication_type IN ('Journal Article', 'Working Paper', 'Policy Brief', 'Book Chapter', 'Report')) DEFAULT 'Journal Article',
      topics_json TEXT NOT NULL DEFAULT '[]',
      journal_publisher TEXT DEFAULT '',
      doi_url TEXT DEFAULT '',
      pdf_url TEXT DEFAULT '',
      is_featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Events in Tanzania
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      venue_or_format TEXT NOT NULL,
      is_online INTEGER NOT NULL DEFAULT 0,
      is_organized_by_me INTEGER NOT NULL DEFAULT 0,
      organizer_name TEXT NOT NULL,
      registration_url TEXT DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Visitor Questions
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('new', 'read', 'answered', 'archived')) DEFAULT 'new',
      admin_notes TEXT DEFAULT '',
      ip_hash TEXT DEFAULT '',
      email_delivery_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Consultation Services
    CREATE TABLE IF NOT EXISTS consultation_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      is_paid INTEGER NOT NULL DEFAULT 0,
      price_amount REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      duration_minutes INTEGER NOT NULL DEFAULT 45,
      format TEXT NOT NULL CHECK(format IN ('both', 'online', 'in_person')) DEFAULT 'both',
      description TEXT NOT NULL,
      prep_instructions TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Consultation Availability Settings & Rules
    CREATE TABLE IF NOT EXISTS availability_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, ..., 6=Sat
      start_time TEXT NOT NULL, -- '09:00'
      end_time TEXT NOT NULL,   -- '17:00'
      is_active INTEGER NOT NULL DEFAULT 1
    );

    -- Blocked Specific Dates
    CREATE TABLE IF NOT EXISTS blocked_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_str TEXT UNIQUE NOT NULL, -- 'YYYY-MM-DD'
      reason TEXT DEFAULT 'Unavailable'
    );

    -- Bookings (Transactional Overlap Prevention)
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT UNIQUE NOT NULL,
      management_token TEXT UNIQUE NOT NULL,
      service_id INTEGER NOT NULL REFERENCES consultation_services(id),
      service_name_snapshot TEXT NOT NULL,
      price_amount_snapshot REAL NOT NULL,
      currency_snapshot TEXT NOT NULL,
      duration_minutes_snapshot INTEGER NOT NULL,
      format TEXT NOT NULL CHECK(format IN ('online', 'in_person')),
      start_time TEXT NOT NULL, -- ISO 8601 UTC or tz
      end_time TEXT NOT NULL,   -- ISO 8601 UTC or tz
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      topic_summary TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending_review', 'confirmed', 'declined', 'cancelled', 'completed', 'expired')) DEFAULT 'pending_review',
      payment_status TEXT NOT NULL CHECK(payment_status IN ('not_applicable', 'awaiting_payment', 'paid')) DEFAULT 'not_applicable',
      online_meeting_link TEXT DEFAULT '',
      admin_notes TEXT DEFAULT '',
      expires_at TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Email Subscribers (Double Opt-in)
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('pending_verification', 'confirmed', 'unsubscribed')) DEFAULT 'pending_verification',
      verification_token TEXT UNIQUE NOT NULL,
      unsubscribe_token TEXT UNIQUE NOT NULL,
      verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Email Publication Campaigns (Prevents Duplicate Sends)
    CREATE TABLE IF NOT EXISTS email_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      publication_type TEXT NOT NULL CHECK(publication_type IN ('insight', 'research')),
      publication_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      sent_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('sent', 'failed')) DEFAULT 'sent',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(publication_type, publication_id)
    );

    -- Persisted Email Outbox / Audit Log (Safe local capture and viewing)
    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_body TEXT NOT NULL,
      text_body TEXT NOT NULL,
      email_type TEXT NOT NULL,
      delivery_status TEXT NOT NULL CHECK(delivery_status IN ('captured_local', 'sent_smtp', 'failed')),
      error_message TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Rate Limiting Table (IP-based)
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 1,
      expires_at INTEGER NOT NULL
    );
  `);
}
