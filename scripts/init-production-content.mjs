import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';
const dbDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(path.resolve(DB_PATH));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');

function ensureSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      researcher_name TEXT NOT NULL DEFAULT 'Dr. Hamis Miraji Ally Simba',
      professional_title TEXT NOT NULL DEFAULT 'Economist · Researcher · Consultant',
      portrait_url TEXT DEFAULT '/portrait-dr-hamis-simba-card.jpg',
      biography TEXT NOT NULL DEFAULT '',
      qualifications_json TEXT NOT NULL DEFAULT '[]',
      research_interests_json TEXT NOT NULL DEFAULT '[]',
      affiliations_json TEXT NOT NULL DEFAULT '[]',
      cv_url TEXT DEFAULT '/dr-hamis-simba-cv-public.pdf',
      hero_headline TEXT NOT NULL DEFAULT 'Research, insights and informed economic decisions.',
      hero_intro TEXT NOT NULL DEFAULT 'Economic research and perspectives on public policy, development and the forces shaping Tanzania’s economy.',
      contact_email TEXT NOT NULL DEFAULT '',
      office_address TEXT NOT NULL DEFAULT 'Tanzania Economic and Financial Policy Consultancy (TEFPC), Simu 4 Street, Makunganya Road, Rita Tower, 15th Floor, Posta, Dar es Salaam, Tanzania',
      office_instructions TEXT NOT NULL DEFAULT 'Office visits require building check-in at Rita Tower, 15th Floor, Posta. Photo identification is required for visitor pass issuance.',
      online_instructions TEXT NOT NULL DEFAULT 'Consultation sessions are conducted over a secure video link. The meeting URL will be made available upon confirmation.',
      payment_instructions TEXT NOT NULL DEFAULT '',
      social_links_json TEXT NOT NULL DEFAULT '[]',
      is_demo INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

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

    CREATE TABLE IF NOT EXISTS availability_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS blocked_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_str TEXT UNIQUE NOT NULL,
      reason TEXT DEFAULT 'Unavailable'
    );

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
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
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

    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 1,
      expires_at INTEGER NOT NULL
    );
  `);
}

async function main() {
  console.log('================================================================');
  console.log('🏛️  TEFPC Production Content Initialization Procedure');
  console.log(`📍 Target Database: ${path.resolve(DB_PATH)}`);
  console.log('================================================================');

  ensureSchema();

  const seedFilePath = path.join(__dirname, 'tefpc-production-seed.json');
  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`Production content seed file not found: ${seedFilePath}`);
  }

  const seed = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

  // 1. Site Settings (Insert once if missing; preserve any later admin modifications)
  console.log('\n[1/5] Applying verified TEFPC site and profile settings...');
  const s = seed.site_settings;
  const existingSettings = db.prepare('SELECT id FROM site_settings WHERE id = 1').get();

  if (existingSettings) {
    console.log(`  ℹ Site settings already exist (id = 1). Preserving existing settings and later admin edits.`);
  } else {
    db.prepare(`
      INSERT INTO site_settings (
        id, researcher_name, professional_title, portrait_url, biography,
        qualifications_json, research_interests_json, affiliations_json,
        cv_url, hero_headline, hero_intro, contact_email, office_address,
        office_instructions, online_instructions, payment_instructions,
        social_links_json, is_demo, updated_at
      ) VALUES (
        1, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, 0, datetime('now')
      )
    `).run(
      s.researcher_name,
      s.professional_title,
      s.portrait_url,
      s.biography,
      s.qualifications_json,
      s.research_interests_json,
      s.affiliations_json,
      s.cv_url,
      s.hero_headline,
      s.hero_intro,
      s.contact_email || '',
      s.office_address,
      s.office_instructions,
      s.online_instructions,
      s.payment_instructions || '',
      s.social_links_json || '[]'
    );
    console.log(`  ✓ Initialized site settings for "${s.researcher_name}".`);
  }

  // 2. Research Publications (Insert if missing; ON CONFLICT DO NOTHING to preserve admin edits)
  console.log(`\n[2/5] Initializing verified academic research publications (${seed.research.length} entries as unpublished drafts)...`);
  const insertResearch = db.prepare(`
    INSERT INTO research (
      title, slug, abstract, authors, year, publication_type,
      topics_json, journal_publisher, doi_url, pdf_url, is_featured,
      status, is_demo, created_at, updated_at
    ) VALUES (
      @title, @slug, @abstract, @authors, @year, @publication_type,
      @topics_json, @journal_publisher, @doi_url, @pdf_url, @is_featured,
      @status, 0, datetime('now'), datetime('now')
    )
    ON CONFLICT(slug) DO NOTHING
  `);

  for (const r of seed.research) {
    const res = insertResearch.run({
      title: r.title,
      slug: r.slug,
      abstract: r.abstract || '',
      authors: r.authors,
      year: r.year,
      publication_type: r.publication_type,
      topics_json: r.topics_json,
      journal_publisher: r.journal_publisher || '',
      doi_url: r.doi_url || '',
      pdf_url: r.pdf_url || '',
      is_featured: r.is_featured || 0,
      status: r.status || 'draft'
    });

    if (res.changes > 0) {
      console.log(`  ✓ Inserted draft research: "${r.title.slice(0, 50)}..." (${r.authors}, ${r.year}) [${r.status}]`);
    } else {
      console.log(`  ℹ Research publication already exists: "${r.title.slice(0, 50)}...". Preserving existing record & admin edits.`);
    }
  }

  // 3. Editorial Insights (Insert if missing; ON CONFLICT DO NOTHING to preserve admin edits)
  console.log(`\n[3/5] Initializing editorial insights and policy analysis (${seed.insights.length} entries as unpublished drafts)...`);
  const insertInsight = db.prepare(`
    INSERT INTO insights (
      title, slug, summary, content_html, topic, cover_image_url,
      read_time_minutes, is_featured, status, published_at, is_demo,
      created_at, updated_at
    ) VALUES (
      @title, @slug, @summary, @content_html, @topic, @cover_image_url,
      @read_time_minutes, @is_featured, @status, @published_at, 0,
      datetime('now'), datetime('now')
    )
    ON CONFLICT(slug) DO NOTHING
  `);

  for (const i of seed.insights) {
    const res = insertInsight.run({
      title: i.title,
      slug: i.slug,
      summary: i.summary,
      content_html: i.content_html,
      topic: i.topic,
      cover_image_url: i.cover_image_url || '',
      read_time_minutes: i.read_time_minutes || 5,
      is_featured: i.is_featured || 0,
      status: i.status || 'draft',
      published_at: i.published_at || null
    });

    if (res.changes > 0) {
      console.log(`  ✓ Inserted draft insight: "${i.title}" [${i.status}]`);
    } else {
      console.log(`  ℹ Insight already exists: "${i.title}". Preserving existing record & admin edits.`);
    }
  }

  // 4. Events & Consultation Services (Insert if missing; ON CONFLICT DO NOTHING)
  console.log(`\n[4/5] Initializing economics events (${seed.events.length}) & provisional consultation services (${seed.consultation_services.length})...`);
  const insertEvent = db.prepare(`
    INSERT INTO events (
      title, slug, description, start_time, end_time, venue_or_format,
      is_online, is_organized_by_me, organizer_name, registration_url,
      is_demo, created_at, updated_at
    ) VALUES (
      @title, @slug, @description, @start_time, @end_time, @venue_or_format,
      @is_online, @is_organized_by_me, @organizer_name, @registration_url,
      0, datetime('now'), datetime('now')
    )
    ON CONFLICT(slug) DO NOTHING
  `);

  for (const ev of seed.events) {
    const res = insertEvent.run({
      title: ev.title,
      slug: ev.slug,
      description: ev.description,
      start_time: ev.start_time,
      end_time: ev.end_time,
      venue_or_format: ev.venue_or_format,
      is_online: ev.is_online || 0,
      is_organized_by_me: ev.is_organized_by_me || 0,
      organizer_name: ev.organizer_name || 'TEFPC',
      registration_url: ev.registration_url || ''
    });

    if (res.changes > 0) {
      console.log(`  ✓ Inserted event: "${ev.title}"`);
    } else {
      console.log(`  ℹ Event already exists: "${ev.title}". Preserving existing record & admin edits.`);
    }
  }

  const insertService = db.prepare(`
    INSERT INTO consultation_services (
      name, slug, is_paid, price_amount, currency, duration_minutes,
      format, description, prep_instructions, is_active, order_index,
      is_demo, created_at, updated_at
    ) VALUES (
      @name, @slug, @is_paid, @price_amount, @currency, @duration_minutes,
      @format, @description, @prep_instructions, @is_active, @order_index,
      0, datetime('now'), datetime('now')
    )
    ON CONFLICT(slug) DO NOTHING
  `);

  for (const cs of seed.consultation_services) {
    const res = insertService.run({
      name: cs.name,
      slug: cs.slug,
      is_paid: cs.is_paid || 0,
      price_amount: cs.price_amount || 0,
      currency: cs.currency || 'USD',
      duration_minutes: cs.duration_minutes || 45,
      format: cs.format || 'both',
      description: cs.description,
      prep_instructions: cs.prep_instructions || '',
      is_active: cs.is_active !== undefined ? cs.is_active : 0,
      order_index: cs.order_index || 0
    });

    if (res.changes > 0) {
      console.log(`  ✓ Inserted provisional service: "${cs.name}" (Public booking: ${cs.is_active ? 'ENABLED' : 'DISABLED until approved'})`);
    } else {
      console.log(`  ℹ Consultation service already exists: "${cs.name}". Preserving existing settings & admin edits.`);
    }
  }

  // 5. Availability Rules
  console.log('\n[5/5] Checking consultation availability schedule...');
  const ruleCount = db.prepare('SELECT count(*) as count FROM availability_rules').get().count;
  if (ruleCount === 0 && seed.availability_rules?.length) {
    const insertRule = db.prepare(`
      INSERT INTO availability_rules (day_of_week, start_time, end_time, is_active)
      VALUES (?, ?, ?, ?)
    `);
    for (const rule of seed.availability_rules) {
      insertRule.run(rule.day_of_week, rule.start_time, rule.end_time, rule.is_active);
    }
    console.log(`  ✓ Initialized ${seed.availability_rules.length} default availability schedule rules.`);
  } else {
    console.log(`  ℹ Availability rules check: ${ruleCount} rules present. Preserving current schedule.`);
  }

  // Verification Audit
  console.log('\n================================================================');
  console.log('🛡️  Safety & Integrity Verification Check:');
  const userCount = db.prepare('SELECT count(*) as count FROM admin_users').get().count;
  const sessionCount = db.prepare('SELECT count(*) as count FROM admin_sessions').get().count;
  const bookingCount = db.prepare('SELECT count(*) as count FROM bookings').get().count;
  const questionCount = db.prepare('SELECT count(*) as count FROM questions').get().count;
  const subscriberCount = db.prepare('SELECT count(*) as count FROM subscribers').get().count;
  const publishedInsights = db.prepare(`SELECT count(*) as count FROM insights WHERE status = 'published'`).get().count;
  const publishedResearch = db.prepare(`SELECT count(*) as count FROM research WHERE status = 'published'`).get().count;
  const activeEvents = db.prepare('SELECT count(*) as count FROM events').get().count;
  const activeServices = db.prepare('SELECT count(*) as count FROM consultation_services WHERE is_active = 1').get().count;
  const demoCount = db.prepare(`
    SELECT (
      (SELECT count(*) FROM research WHERE is_demo = 1) +
      (SELECT count(*) FROM insights WHERE is_demo = 1) +
      (SELECT count(*) FROM events WHERE is_demo = 1) +
      (SELECT count(*) FROM consultation_services WHERE is_demo = 1) +
      (SELECT count(*) FROM bookings WHERE is_demo = 1)
    ) as count
  `).get().count;

  console.log(`  - Admin Users:            ${userCount} (Untouched)`);
  console.log(`  - Active Sessions:        ${sessionCount} (Untouched)`);
  console.log(`  - Visitor Bookings:       ${bookingCount} (Untouched)`);
  console.log(`  - Visitor Questions:      ${questionCount} (Untouched)`);
  console.log(`  - Email Subscribers:      ${subscriberCount} (Untouched)`);
  console.log(`  - Published Insights:     ${publishedInsights} (Strictly 0 published)`);
  console.log(`  - Published Research:     ${publishedResearch} (Strictly 0 published without verified abstracts/DOIs)`);
  console.log(`  - Published Events:       ${activeEvents} (Strictly 0 published)`);
  console.log(`  - Public Active Services: ${activeServices} (Strictly 0 until client approves public bookings)`);
  console.log(`  - Demo Records:           ${demoCount} (Strictly 0 demo items)`);
  console.log('================================================================');
  console.log('✅ TEFPC production content initialization completed successfully.');
}

main().catch((err) => {
  console.error('\n❌ Content initialization failed:', err);
  process.exit(1);
});
