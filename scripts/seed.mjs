import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';
const dbDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(path.resolve(DB_PATH));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

console.log('🌱 Seeding database at:', path.resolve(DB_PATH));

// Ensure schema
db.exec(`
  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    researcher_name TEXT NOT NULL DEFAULT 'Dr. Juma M. Mwangi',
    professional_title TEXT NOT NULL DEFAULT 'Senior Economic Researcher & Policy Analyst',
    portrait_url TEXT DEFAULT '',
    biography TEXT NOT NULL DEFAULT '',
    qualifications_json TEXT NOT NULL DEFAULT '[]',
    research_interests_json TEXT NOT NULL DEFAULT '[]',
    affiliations_json TEXT NOT NULL DEFAULT '[]',
    cv_url TEXT DEFAULT '',
    hero_headline TEXT NOT NULL DEFAULT 'Understanding the economy. Advancing the conversation.',
    hero_intro TEXT NOT NULL DEFAULT 'Independent macroeconomic analysis, fiscal policy research, and empirical insights on Tanzania and East Africa.',
    contact_email TEXT NOT NULL DEFAULT 'researcher@example.tz',
    office_address TEXT NOT NULL DEFAULT 'CBD Financial District, Dar es Salaam, Tanzania',
    office_instructions TEXT NOT NULL DEFAULT 'Please arrive 10 minutes prior to your scheduled consultation time. Building security requires photo identification for visitor badges.',
    online_instructions TEXT NOT NULL DEFAULT 'Consultation sessions are conducted over a secure video link. The meeting URL will be made available here upon confirmation.',
    payment_instructions TEXT NOT NULL DEFAULT 'For paid consultations, payments are accepted via direct Bank Transfer (NMB / CRDB) or Mobile Money (M-Pesa / Tigo Pesa). Transfer details and reference numbers are provided in your booking confirmation.',
    social_links_json TEXT NOT NULL DEFAULT '[]',
    is_demo INTEGER NOT NULL DEFAULT 1,
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

// 1. Site Settings
const qualifications = JSON.stringify([
  "Ph.D. in Economics, University of Dar es Salaam (2014)",
  "M.Sc. in Development Economics, University of Manchester (2009)",
  "B.A. in Economics & Statistics (First Class Honours), University of Dar es Salaam (2007)"
]);

const researchInterests = JSON.stringify([
  "Fiscal Policy & Domestic Resource Mobilization",
  "Macroeconomic Modeling & Inflation Forecasting",
  "Regional Trade Integration & AfCFTA Implementation",
  "Agricultural Markets & Food Security Dynamics in East Africa"
]);

const affiliations = JSON.stringify([
  "Fellow, Tanzania Economic Association (TEA)",
  "Visiting Research Fellow, African Economic Research Consortium (AERC)",
  "Member, Royal Economic Society (UK)",
  "Advisory Consultant, National Planning & Policy Working Groups"
]);

const socialLinks = JSON.stringify([
  { label: "Google Scholar", url: "https://scholar.google.com" },
  { label: "ResearchGate", url: "https://researchgate.net" },
  { label: "LinkedIn", url: "https://linkedin.com" },
  { label: "X / Twitter", url: "https://x.com" }
]);

const bioText = `Dr. Juma M. Mwangi is an applied economic researcher and macro-policy analyst with over fifteen years of scholarly and advisory experience across East Africa. His work focuses on structural transformation, fiscal space expansion, monetary transmission mechanisms, and cross-border trade resilience under the African Continental Free Trade Area (AfCFTA).

He has served as a consultant for multilateral institutions including the African Development Bank, the World Bank, and regional development secretariats. Alongside academic publishing, Dr. Mwangi is deeply committed to public economic discourse, regularly contributing policy briefs, public lectures, and data-driven commentary on Tanzania's evolving macroeconomic landscape.`;

db.prepare(`
  INSERT INTO site_settings (
    id, researcher_name, professional_title, portrait_url, biography,
    qualifications_json, research_interests_json, affiliations_json,
    cv_url, hero_headline, hero_intro, contact_email, office_address,
    office_instructions, online_instructions, payment_instructions,
    social_links_json, is_demo, updated_at
  ) VALUES (
    1, 'Dr. Juma M. Mwangi', 'Senior Economic Researcher & Policy Analyst',
    '/placeholder-portrait.svg',
    ?, ?, ?, ?,
    '/demo-cv.pdf',
    'Understanding the economy.\nAdvancing the conversation.',
    'Independent macroeconomic analysis, fiscal policy research, and empirical insights on Tanzania and East Africa.',
    'dr.mwangi@example.tz',
    'Level 7, Harbour View Commercial Tower, Samora Avenue, Dar es Salaam, Tanzania',
    'Office visits require check-in at the ground floor concierge. Please have government identification available for visitor badge issuance.',
    'Online consultations are held via secure Google Meet or Zoom. Your direct link will be activated and confirmed upon admin booking review.',
    'For paid consultations, remittance instructions (CRDB / NMB corporate bank accounts or M-Pesa Till number) will be displayed on your booking confirmation page.',
    ?, 1, datetime('now')
  )
  ON CONFLICT(id) DO UPDATE SET
    researcher_name = excluded.researcher_name,
    professional_title = excluded.professional_title,
    biography = excluded.biography,
    qualifications_json = excluded.qualifications_json,
    research_interests_json = excluded.research_interests_json,
    affiliations_json = excluded.affiliations_json,
    hero_headline = excluded.hero_headline,
    hero_intro = excluded.hero_intro,
    office_address = excluded.office_address,
    office_instructions = excluded.office_instructions,
    online_instructions = excluded.online_instructions,
    payment_instructions = excluded.payment_instructions,
    social_links_json = excluded.social_links_json,
    is_demo = 1
`).run(bioText, qualifications, researchInterests, affiliations, socialLinks);

// 2. Demonstration Articles (Insights)
db.prepare(`DELETE FROM insights WHERE is_demo = 1`).run();

const insertInsight = db.prepare(`
  INSERT INTO insights (title, slug, summary, content_html, topic, read_time_minutes, is_featured, status, published_at, is_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

insertInsight.run(
  "Fiscal Resilience in East Africa: Lessons from Tanzania's Revenue Modernization",
  "fiscal-resilience-east-africa-revenue-modernization",
  "An examination of electronic fiscal devices, tax registry expansion, and revenue-to-GDP dynamics across the EAC bloc over the past decade.",
  `<p class="lead">Tax revenue mobilization remains the single most critical structural bottleneck for infrastructure financing and debt sustainability across Sub-Saharan Africa. Over the past decade, Tanzania has engaged in wide-ranging digital compliance and registry integration efforts that offer substantial policy lessons for regional partners.</p>
  <h2>The Structural Challenge</h2>
  <p>Historically, the tax-to-GDP ratio across the East African Community (EAC) has hovered between 11% and 15%, well below the 20% benchmark recommended by the United Nations for achieving sustainable development goals without accumulating precarious external debt obligations.</p>
  <p>In Tanzania, structural informality in agriculture and retail trade, alongside fragmented administrative registries, limited the reach of domestic indirect taxation. However, recent initiatives integrating national identification (NIDA), telecom SIM registrations, and real-time electronic invoicing (EFD) protocols have begun yielding tangible behavioral shifts.</p>
  <blockquote>"Expanding the tax net without penalizing enterprise formation requires administrative predictability rather than erratic enforcement campaigns."</blockquote>
  <h2>Empirical Findings</h2>
  <p>Our empirical examination of TRA quarterly collections between 2018 and 2025 demonstrates three distinct effects:</p>
  <ul>
    <li><strong>Compliance elasticity:</strong> Small and medium enterprises exhibit high compliance responsiveness when filing frictions are reduced via mobile platforms.</li>
    <li><strong>Sectoral asymmetries:</strong> While manufacturing and mining sectors maintain high automated compliance, regional agricultural logistics continue to leak taxable value due to cash-based intermediation.</li>
    <li><strong>Audit efficiency:</strong> Machine-assisted anomaly detection in value-added tax (VAT) refunds cut fraudulent claims by an estimated 28% year-on-year.</li>
  </ul>
  <h2>Strategic Policy Recommendations</h2>
  <p>To sustain these gains, authorities must prioritize widening the tax base horizontally rather than compounding levy burdens on formal corporations. Harmonizing municipal levies with national revenue streams will mitigate double-taxation grievances and foster durable economic formalization.</p>`,
  "Fiscal Policy",
  7,
  1, // featured
  "published",
  "2026-09-15T09:00:00Z"
);

insertInsight.run(
  "Exchange Rate Transmission and Imported Inflation in Tanzania",
  "exchange-rate-transmission-imported-inflation-tanzania",
  "Assessing the pass-through elasticity of global dollar strength to local headline consumer prices in Dar es Salaam and regional hubs.",
  `<p class="lead">Global macroeconomic turbulence and monetary tightening across central banks in the Global North have amplified foreign exchange pressures on emerging and developing economies. In Tanzania, the stability of the Shilling has been a pillar of macroeconomic credibility.</p>
  <h2>The Anatomy of Import Exposure</h2>
  <p>Tanzania's headline inflation has remained remarkably stable compared to regional peers, consistently staying within the central bank's target band of 3% to 5%. However, structural import dependencies in refined petroleum products, chemical fertilizers, and industrial machinery create targeted transmission channels for imported price pressure.</p>
  <h2>Monetary Policy Coordination</h2>
  <p>The Bank of Tanzania's transition toward an interest-rate-based monetary policy framework (shifting away from reserve money targeting) represents an essential maturation. Our vector autoregression (VAR) estimates suggest that pass-through from foreign exchange depreciations to domestic consumer prices has softened from 0.35 in the early 2010s to roughly 0.18 today, reflecting increased domestic food substitution and proactive liquidity sterilization.</p>`,
  "Monetary Economics",
  5,
  0,
  "published",
  "2026-10-02T11:00:00Z"
);

insertInsight.run(
  "AfCFTA and the Logistics Corridor: Tanzania as an East-to-Central African Trade Pivot",
  "afcfta-logistics-corridor-tanzania-trade-pivot",
  "Evaluating standard gauge railway expansions, port modernizations, and cross-border trade facilitation under the African Continental Free Trade Area.",
  `<p class="lead">Draft analytical overview of transit trade through the Central Corridor linking the Port of Dar es Salaam to Rwanda, Burundi, Uganda, and the eastern Democratic Republic of Congo.</p>
  <p>This draft paper analyzes port dwell times, corridor freight tariffs, and regulatory non-tariff barriers currently under review for academic presentation.</p>`,
  "Trade & Integration",
  4,
  0,
  "draft",
  null
);

// 3. Demonstration Research & Publications
db.prepare(`DELETE FROM research WHERE is_demo = 1`).run();

const insertResearch = db.prepare(`
  INSERT INTO research (title, slug, abstract, authors, year, publication_type, topics_json, journal_publisher, doi_url, pdf_url, is_featured, status, is_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

insertResearch.run(
  "Sovereign Debt Sustainability and Domestic Resource Mobilization in Tanzania (2015–2025)",
  "sovereign-debt-sustainability-resource-mobilization-tanzania",
  "This study models the medium-term debt trajectory of Tanzania under alternative fiscal consolidation and global interest rate scenarios. Using a dynamic stochastic general equilibrium (DSGE) framework calibrated to East African macroeconomic data, we demonstrate that achieving a domestic tax-to-GDP ratio above 16.5% completely insulates the national balance sheet against external commodity price shocks while safeguarding concessional social infrastructure investments.",
  "Dr. Juma M. Mwangi, Prof. A. K. Luwano",
  2025,
  "Journal Article",
  JSON.stringify(["Macroeconomics", "Debt Policy", "Fiscal Space"]),
  "Journal of African Economies & Development",
  "https://doi.org/10.1093/jae/demo-2025-04",
  "/demo-papers/debt-sustainability-tanzania.pdf",
  1,
  "published"
);

insertResearch.run(
  "Agricultural Commercialization and Cross-Border Food Price Convergence in the EAC",
  "agricultural-commercialization-cross-border-price-convergence-eac",
  "An empirical evaluation of regional price integration for staple grains (maize and rice) across wholesale border markets between Tanzania, Kenya, and Uganda. Utilizing spatial price transmission econometric models, the findings highlight that non-tariff cross-border clearance delays account for up to 64% of wholesale price divergence during regional harvest discrepancies.",
  "Dr. Juma M. Mwangi",
  2024,
  "Policy Brief",
  JSON.stringify(["Agriculture", "Regional Trade", "Market Integration"]),
  "East African Economic Policy Research Institute",
  "https://doi.org/10.1016/demo-policy-brief-2024",
  "/demo-papers/agricultural-price-convergence.pdf",
  0,
  "published"
);

insertResearch.run(
  "Inflation Dynamics, Fuel Subsidies, and Welfare Disparities in Urban and Rural Tanzania",
  "inflation-dynamics-fuel-subsidies-welfare-disparities",
  "Analyzing household survey data from the National Bureau of Statistics to evaluate the distributional welfare incidence of temporary fuel price subsidies versus targeted cash transfers during the 2022-2023 international energy spike.",
  "Dr. Juma M. Mwangi, Dr. Grace S. Mushi",
  2023,
  "Working Paper",
  JSON.stringify(["Poverty & Inequality", "Energy Policy", "Microeconometrics"]),
  "Tanzania Economic Working Paper Series, No. 88",
  "",
  "",
  0,
  "published"
);

// 4. Demonstration Events
db.prepare(`DELETE FROM events WHERE is_demo = 1`).run();

const insertEvent = db.prepare(`
  INSERT INTO events (title, slug, description, start_time, end_time, venue_or_format, is_online, is_organized_by_me, organizer_name, registration_url, is_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

insertEvent.run(
  "Roundtable: Macroeconomic Outlook for Tanzania 2027",
  "roundtable-macroeconomic-outlook-tanzania-2027",
  "An interactive policy discussion bringing together university scholars, banking economists, and government treasury analysts to review public debt dynamics, foreign exchange management, and export competitiveness projections.",
  "2026-11-20T09:00:00+03:00",
  "2026-11-20T13:00:00+03:00",
  "Level 7 Conference Suite, Harbour View Tower, Dar es Salaam",
  0,
  1, // Organized by researcher
  "Dr. Juma M. Mwangi Policy Forum",
  "https://example.tz/events/macro-outlook-2027"
);

insertEvent.run(
  "Bank of Tanzania Annual Economic Research Symposium",
  "bank-of-tanzania-annual-economic-symposium-2026",
  "Keynote presentations and panel discussions on digital currency frameworks, regional cross-border payment integration, and financial inclusion frontiers in East Africa.",
  "2026-12-08T08:30:00+03:00",
  "2026-12-09T17:00:00+03:00",
  "BOT Conference Auditorium, 10 Mirambo Street, Dar es Salaam",
  0,
  0, // Third party
  "Bank of Tanzania (BOT)",
  "https://www.bot.go.tz/events"
);

insertEvent.run(
  "Webinar: AfCFTA Rules of Origin and Agribusiness Export Opportunities",
  "webinar-afcfta-rules-of-origin-agribusiness",
  "Virtual masterclass examining certificate of origin requirements and tariff concession schedules for Tanzanian horticultural and food processing exporters.",
  "2026-08-14T14:00:00+03:00",
  "2026-08-14T16:00:00+03:00",
  "Online via Zoom Webinar",
  1,
  1, // Organized by researcher
  "Dr. Juma M. Mwangi in collaboration with TEA",
  ""
);

// 5. Consultation Services
db.prepare(`DELETE FROM consultation_services WHERE is_demo = 1`).run();

const insertService = db.prepare(`
  INSERT INTO consultation_services (name, slug, is_paid, price_amount, currency, duration_minutes, format, description, prep_instructions, is_active, order_index, is_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)
`);

insertService.run(
  "Academic Mentorship & Ph.D. Research Advisory",
  "academic-mentorship-phd-advisory",
  0, // Free
  0,
  "USD",
  45,
  "both",
  "One-on-one session dedicated to graduate students, doctoral researchers, and early-career economists seeking guidance on research proposal design, econometric methodology, journal publication strategies, or dissertation refinement.",
  "Please share your research abstract, working outline, or specific methodological inquiries at least 48 hours in advance.",
  1
);

insertService.run(
  "Strategic Macroeconomic & Policy Advisory",
  "strategic-macro-policy-advisory",
  1, // Paid
  150,
  "USD",
  60,
  "both",
  "In-depth economic consultation designed for development partners, policy research organizations, NGOs, and corporate executives needing expert analysis on Tanzanian fiscal trends, regulatory changes, or macroeconomic risk assessments.",
  "Please provide background materials and key questions for analysis prior to the consultation.",
  2
);

insertService.run(
  "Executive Country Risk & Sectoral Briefing",
  "executive-country-risk-sectoral-briefing",
  1, // Paid
  300,
  "USD",
  90,
  "both",
  "Comprehensive private briefing covering macroeconomic indicators, monetary policy direction, regional East African Community trade implications, and foreign exchange dynamics tailored to institutional investors and senior leadership.",
  "A customized briefing deck will be prepared based on your organization's specific sector of interest.",
  3
);

// 6. Availability Rules (Mon - Fri: 09:00 - 17:00)
db.prepare(`DELETE FROM availability_rules`).run();
const insertRule = db.prepare(`INSERT INTO availability_rules (day_of_week, start_time, end_time, is_active) VALUES (?, '09:00', '17:00', 1)`);
for (let d = 1; d <= 5; d++) {
  insertRule.run(d);
}

// 7. Subscribers
db.prepare(`DELETE FROM subscribers WHERE email LIKE '%@demo-sub.tz'`).run();
const insertSubscriber = db.prepare(`
  INSERT INTO subscribers (email, name, status, verification_token, unsubscribe_token, verified_at)
  VALUES (?, ?, 'confirmed', ?, ?, datetime('now'))
`);
insertSubscriber.run("amani.mkali@demo-sub.tz", "Amani Mkali", "demo-token-1", "demo-unsub-1");
insertSubscriber.run("sarah.kimaro@demo-sub.tz", "Sarah Kimaro", "demo-token-2", "demo-unsub-2");

console.log('✅ Demonstration seed data created successfully.');
