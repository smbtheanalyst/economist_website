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

// 1. Site Settings (Dr. Hamis Mirai Ally Simba & TEFPC)
const qualifications = JSON.stringify([
  "PhD in Economics, Istanbul Gelisim University (2022–2026)",
  "M.S. in Economics, Ankara Yildirim Beyazit University (2016–2018)",
  "B.A. in Economics (2024–Proc)",
  "B.A. in Computer Science, Institute of Finance Management (IFM) (2009–2012)"
]);

const researchInterests = JSON.stringify([
  "Economic Policy and Analysis",
  "Economic Modelling",
  "Applied Macroeconomics",
  "Applied Econometrics",
  "Economic Development",
  "Time Series Econometrics"
]);

const affiliations = JSON.stringify([
  "Tanzania Economic and Financial Policy Consultancy (TEFPC)",
  "Economic Researcher, Economic and Social Research Foundation (ESRF, 2025–Resuming)",
  "Economic Associate Researcher, Istanbul Gelisim University (2022–2026)",
  "Former Economic Director, Tanzania Chamber of Commerce (TCCIA) in Turkey (2017–2022)",
  "Former Assistant Economic Researcher, Ankara Yildirim Beyazit University (2017–2019)"
]);

const socialLinks = JSON.stringify([
  { label: "Google Scholar", url: "https://scholar.google.com" },
  { label: "ResearchGate", url: "https://researchgate.net" },
  { label: "LinkedIn", url: "https://linkedin.com" }
]);

const bioText = `Dr. Hamis Mirai Ally Simba is an applied economist, researcher, and policy consultant specializing in macroeconomic analysis, econometrics, and empirical policy evaluation. His academic and advisory work focuses on the intersection of institutional governance, energy transition, economic modeling, and income distribution dynamics across Sub-Saharan Africa and Tanzania.

He has conducted extensive research at international and domestic academic and policy institutions, including Istanbul Gelisim University, Ankara Yildirim Beyazit University, and the Economic and Social Research Foundation (ESRF). His professional track record includes leadership in bilateral trade facilitation as Economic Director for the Tanzania Chamber of Commerce, Industry and Agriculture (TCCIA) in Turkey, as well as founding Magandi Foreign Trade Comp LTD.

Dr. Simba holds a PhD in Economics from Istanbul Gelisim University, an M.S. in Economics from Ankara Yildirim Beyazit University, and a background in Computer Science from the Institute of Finance Management (IFM), combining quantitative empirical rigor with computational analysis for data-grounded economic decision-making.`;

db.prepare(`
  INSERT INTO site_settings (
    id, researcher_name, professional_title, portrait_url, biography,
    qualifications_json, research_interests_json, affiliations_json,
    cv_url, hero_headline, hero_intro, contact_email, office_address,
    office_instructions, online_instructions, payment_instructions,
    social_links_json, is_demo, updated_at
  ) VALUES (
    1, 'Dr. Hamis Mirai Ally Simba', 'Economist · Researcher · Consultant',
    '/portrait-dr-hamis-simba-card.jpg',
    ?, ?, ?, ?,
    '/dr-hamis-simba-cv-public.pdf',
    'Research, insights and informed economic decisions.',
    'Economic research and perspectives on public policy, development and the forces shaping Tanzania’s economy.',
    'info@tefpc.or.tz',
    'Tanzania Economic and Financial Policy Consultancy (TEFPC), Simu 4 Street, Makunganya Road, Rita Tower, 15th Floor, Posta, Dar es Salaam, Tanzania',
    'Office visits require building check-in at Rita Tower, 15th Floor, Posta. Photo identification is required for visitor pass issuance.',
    'Online consultations are held via secure video link. Your direct link will be activated and confirmed upon admin booking review.',
    'For paid consultations, remittance instructions (CRDB / NMB corporate bank accounts or M-Pesa Till number) will be displayed on your booking confirmation page.',
    ?, 0, datetime('now')
  )
  ON CONFLICT(id) DO UPDATE SET
    researcher_name = excluded.researcher_name,
    professional_title = excluded.professional_title,
    portrait_url = excluded.portrait_url,
    biography = excluded.biography,
    qualifications_json = excluded.qualifications_json,
    research_interests_json = excluded.research_interests_json,
    affiliations_json = excluded.affiliations_json,
    cv_url = excluded.cv_url,
    hero_headline = excluded.hero_headline,
    hero_intro = excluded.hero_intro,
    contact_email = excluded.contact_email,
    office_address = excluded.office_address,
    office_instructions = excluded.office_instructions,
    online_instructions = excluded.online_instructions,
    payment_instructions = excluded.payment_instructions,
    social_links_json = excluded.social_links_json,
    is_demo = 0
`).run(bioText, qualifications, researchInterests, affiliations, socialLinks);

// 2. Client Articles (Insights)
db.prepare(`DELETE FROM insights`).run();

const insertInsight = db.prepare(`
  INSERT INTO insights (title, slug, summary, content_html, topic, read_time_minutes, is_featured, status, published_at, is_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
`);

insertInsight.run(
  "Addressing Income Inequality in Africa: The Fiscal and Monetary Dimensions",
  "addressing-income-inequality-africa-fiscal-monetary",
  "Examining the interaction between government spending allocations, inflationary shocks, and debt service pressures on income distribution across African economies.",
  `<p class="lead">Income inequality remains one of the defining structural development challenges across Sub-Saharan Africa. While headline economic growth rates have shown resilience across several regions, the distribution of economic gains requires rigorous examination of underlying fiscal structures and monetary environments.</p>
  <h2>Macroeconomic Drivers of Disparity</h2>
  <p>Our recent empirical investigations demonstrate that the composition—rather than merely the volume—of public expenditure plays a decisive role in income distribution. When fiscal outlays prioritize social safety nets, public healthcare, and primary education, the redistributive benefits are statistically significant.</p>
  <p>Conversely, when a disproportionate share of national revenue is absorbed by external debt servicing obligations, governments face constrained fiscal space, frequently resulting in compressed social sector spending and heightened vulnerability for lower-income households.</p>
  <blockquote>"Fiscal policy cannot be treated merely as a balancing accounting exercise; its distributional design determines whether national growth translates into broad-based welfare or concentrated wealth."</blockquote>
  <h2>Inflation as a Regressive Levy</h2>
  <p>Inflationary pressures, particularly food and energy price shocks, act as a regressive tax on poorer households who allocate a larger share of disposable income to staple consumption. Using advanced panel econometric modeling across African economies, our findings underscore the vital importance of central bank price stabilization combined with targeted social protection measures.</p>
  <h2>Policy Imperatives for Tanzania</h2>
  <ul>
    <li><strong>Broadening the domestic tax base</strong> without disproportionately burdening micro-enterprises and the informal economy.</li>
    <li><strong>Targeting public capital expenditure</strong> toward rural transport logistics and agricultural market access to narrow spatial income divides.</li>
    <li><strong>Strengthening debt management frameworks</strong> to ensure borrowed funds directly finance productive, income-generating infrastructure.</li>
  </ul>`,
  "Economic Policy and Analysis",
  6,
  1, // featured
  "published",
  "2026-10-10T09:00:00Z"
);

insertInsight.run(
  "Energy Security, Institutional Quality, and Growth in Resource-Rich Economies",
  "energy-security-institutional-quality-resource-economies",
  "Assessing how regulatory governance and institutional quality mediate the economic returns of energy infrastructure investments in developing nations.",
  `<p class="lead">The transition toward sustainable energy systems is inextricably linked to the strength of public institutions and regulatory predictability. For developing economies endowed with natural resources, energy security is both an industrial catalyst and a governance test.</p>
  <h2>The Institutional Quality Nexus</h2>
  <p>Empirical evidence across resource-rich developing economies reveals that natural resource endowments foster sustainable growth only in environments characterized by transparent contract enforcement, effective regulatory oversight, and anti-corruption safeguards.</p>
  <p>Without sound institutional quality, large-scale energy investments frequently succumb to cost overruns, fiscal leakages, and delayed commissioning, undermining the broader macroeconomic multiplier effect.</p>
  <h2>Strategic Considerations for Tanzania</h2>
  <p>As Tanzania expands its domestic energy generation and regional transmission grid, establishing clear tariff methodologies, transparent power-purchase agreements, and strong regulatory standards will remain central to attracting long-term private capital while safeguarding public interests.</p>`,
  "Applied Macroeconomics",
  5,
  0,
  "published",
  "2026-09-28T10:00:00Z"
);

insertInsight.run(
  "Regional Economic Integration and AfCFTA Corridors in East Africa",
  "regional-economic-integration-afcfta-corridors-east-africa",
  "Draft analytical perspectives on border infrastructure, non-tariff barrier reductions, and value-chain development under the African Continental Free Trade Area.",
  `<p class="lead">Draft working overview assessing transit cargo movements, border customs clearance efficiency, and regional supply chain integration between Dar es Salaam and neighboring landlocked markets.</p>
  <p>This preliminary paper is currently being updated with recent logistics data from the Central Corridor Transit Transport Facilitation Agency.</p>`,
  "Economic Development",
  4,
  0,
  "draft",
  null
);

// 3. Client Research & Publications (Preserving author names exactly as in CV)
db.prepare(`DELETE FROM research`).run();

const insertResearch = db.prepare(`
  INSERT INTO research (title, slug, abstract, authors, year, publication_type, topics_json, journal_publisher, doi_url, pdf_url, is_featured, status, is_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
`);

insertResearch.run(
  "Macroeconomic Determinants of Income Inequality in Africa: Assessing the Roles of Government Expenditure, Inflation, and External Debt",
  "macroeconomic-determinants-income-inequality-africa",
  "An empirical investigation into how key macroeconomic variables—namely government expenditure, domestic inflation dynamics, and external debt obligations—drive income inequality across African economies, utilizing advanced panel econometric methodologies to offer actionable policy insights for sustainable development.",
  "Hamisi Miraji Simba",
  2026,
  "Journal Article",
  JSON.stringify(["Applied Macroeconomics", "Economic Policy and Analysis", "Applied Econometrics"]),
  "Cogent Social Sciences",
  "https://doi.org/10.1080/23311886.2026.example",
  "",
  1, // featured
  "published"
);

insertResearch.run(
  "Energy Security, Institutional Quality, and Geopolitical Risks in Resource-Rich Developing Economies",
  "energy-security-institutional-quality-geopolitical-risks",
  "This study assesses the tripartite relationship between energy security, institutional quality, and geopolitical risk metrics in resource-endowed developing countries, providing empirical evidence on governance pathways for resilient and sustainable energy transitions.",
  "Hamisi Miraji Simba",
  2026,
  "Book Chapter",
  JSON.stringify(["Economic Policy and Analysis", "Economic Development"]),
  "Springer Nature",
  "https://doi.org/10.1007/978-example-springer",
  "",
  1, // featured
  "published"
);

insertResearch.run(
  "The Impact of Governance Quality on Economic Growth in Sub-Saharan Africa: A Panel Data Analysis",
  "impact-governance-quality-economic-growth-sub-saharan-africa",
  "A comprehensive empirical evaluation of institutional governance dimensions, regulatory effectiveness, control of corruption, and the rule of law on sustained real GDP per capita growth across Sub-Saharan African economies.",
  "Hamisi Miraji Simba",
  2024,
  "Journal Article",
  JSON.stringify(["Economic Development", "Applied Econometrics", "Time Series Econometrics"]),
  "Journal of the Knowledge Economy",
  "https://doi.org/10.1007/s13132-024-example",
  "",
  0,
  "published"
);

insertResearch.run(
  "Good Governance and Economic Growth: Evidence from Sub-Saharan Africa",
  "good-governance-economic-growth-evidence-sub-saharan-africa",
  "Investigates the catalytic role of institutional reform, public sector transparency, and macroeconomic stability in driving capital accumulation and economic convergence in selected Sub-Saharan economies.",
  "Hamisi Miraji Simba",
  2024,
  "Journal Article",
  JSON.stringify(["Economic Development", "Economic Policy and Analysis"]),
  "Economic and Regional Studies",
  "https://doi.org/10.2478/ers-2024-example",
  "",
  0,
  "published"
);

insertResearch.run(
  "The Nexus Between Energy Consumption, Foreign Direct Investment, and Economic Growth in Tanzania",
  "nexus-energy-consumption-fdi-growth-tanzania",
  "An empirical time series analysis examining cointegration and directional causality between aggregate commercial energy consumption, inward foreign direct investment flows, and real gross domestic product growth in Tanzania over multi-decade observation periods.",
  "Hamisi Miraji Simba",
  2020,
  "Journal Article",
  JSON.stringify(["Economic Modelling", "Time Series Econometrics", "Applied Macroeconomics"]),
  "Journal of Economics Finance and Accounting",
  "https://doi.org/10.17261/Pressacademia.2020.example",
  "",
  0,
  "published"
);

// Ambiguous / Incomplete entries kept in draft for client review
insertResearch.run(
  "Global Energy Transformation, Institutional Governance, and Climate Change Mitigation Pathways",
  "global-energy-transformation-climate-mitigation-pathways",
  "Draft manuscript examining global renewable energy adoption rates, national regulatory frameworks, and carbon emission trajectories in emerging economies.",
  "Hamisi Miraji Simba",
  2023,
  "Journal Article",
  JSON.stringify(["Economic Policy and Analysis", "Economic Development"]),
  "Sustainability (Draft / Under Review)",
  "",
  "",
  0,
  "draft"
);

insertResearch.run(
  "Macroeconomic Dynamics and Monetary Policy Transmission in East Africa",
  "macroeconomic-dynamics-monetary-policy-transmission-east-africa",
  "Working paper analyzing policy interest rate pass-through and reserve currency effects across East African regional markets.",
  "Hamisi Miraji Simba",
  2025,
  "Working Paper",
  JSON.stringify(["Applied Macroeconomics", "Economic Modelling"]),
  "Working Paper Series",
  "",
  "",
  0,
  "draft"
);

// 4. Events
db.prepare(`DELETE FROM events`).run();

const insertEvent = db.prepare(`
  INSERT INTO events (title, slug, description, start_time, end_time, venue_or_format, is_online, is_organized_by_me, organizer_name, registration_url, is_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
`);

insertEvent.run(
  "TEFPC Policy Roundtable: Macroeconomic Outlook for Tanzania 2027",
  "tefpc-policy-roundtable-macro-outlook-tanzania-2027",
  "An executive economic policy forum organized by the Tanzania Economic and Financial Policy Consultancy (TEFPC) bringing together academic researchers, banking executives, and public policy analysts at Rita Tower to evaluate fiscal trajectories, foreign exchange stability, and trade opportunities.",
  "2026-11-26T09:00:00+03:00",
  "2026-11-26T13:00:00+03:00",
  "Rita Tower, 15th Floor, Posta, Dar es Salaam, Tanzania",
  0,
  1, // Organized by TEFPC / Dr. Simba
  "Tanzania Economic and Financial Policy Consultancy (TEFPC)",
  "https://tefpc.or.tz/consultation"
);

insertEvent.run(
  "Bank of Tanzania (BOT) Annual Research Conference",
  "bank-of-tanzania-annual-research-conference-2026",
  "National economic and financial symposium focusing on digital financial services, monetary policy implementation, and macroeconomic resilience across the East African Community.",
  "2026-12-10T08:30:00+03:00",
  "2026-12-11T17:00:00+03:00",
  "BOT Conference Auditorium, 10 Mirambo Street, Dar es Salaam",
  0,
  0, // Third party
  "Bank of Tanzania (BOT)",
  "https://www.bot.go.tz"
);

// 5. Consultation Services
db.prepare(`DELETE FROM consultation_services`).run();

const insertService = db.prepare(`
  INSERT INTO consultation_services (name, slug, is_paid, price_amount, currency, duration_minutes, format, description, prep_instructions, is_active, order_index, is_demo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0)
`);

insertService.run(
  "Academic Methodology & Econometric Mentorship",
  "academic-methodology-econometric-mentorship",
  0, // Free
  0,
  "USD",
  45,
  "both",
  "One-on-one consultation dedicated to postgraduate researchers, doctoral candidates, and university scholars seeking expert guidance on research design, time series econometrics, panel data models, or publication development.",
  "Please share your research abstract, working proposal, or specific econometric methodology inquiries at least 48 hours in advance.",
  1
);

insertService.run(
  "Strategic Macroeconomic & Policy Advisory",
  "strategic-macroeconomic-policy-advisory",
  1, // Paid
  150,
  "USD",
  60,
  "both",
  "Dedicated economic consultation for development agencies, policy think tanks, NGOs, and corporate leadership requiring high-level empirical analysis on Tanzanian economic policy, sector dynamics, or macroeconomic outlook.",
  "Please outline the key policy questions, project terms of reference, or background materials prior to the session.",
  2
);

insertService.run(
  "Executive Country Briefing & Sectoral Risk Analysis",
  "executive-country-briefing-sectoral-risk-analysis",
  1, // Paid
  300,
  "USD",
  90,
  "both",
  "Comprehensive private briefing covering Tanzania's macroeconomic indicators, regulatory shifts, foreign exchange trends, and regional trade opportunities tailored to institutional investors and senior executives.",
  "A customized briefing deck will be structured based on your organization's specific sector of interest.",
  3
);

// 6. Availability Rules (Mon - Fri: 09:00 - 17:00 EAT)
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
insertSubscriber.run("amani.mkali@demo-sub.tz", "Amani Mkali", "sub-token-client-1", "unsub-token-client-1");
insertSubscriber.run("sarah.kimaro@demo-sub.tz", "Sarah Kimaro", "sub-token-client-2", "unsub-token-client-2");

console.log('✅ Client data seeded successfully for Dr. Hamis Mirai Ally Simba and TEFPC.');
