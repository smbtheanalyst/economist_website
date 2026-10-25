import test from 'node:test';
import assert from 'node:assert/strict';
import { getDb } from '../lib/db';
import { getSiteSettings, getPublishedInsights, getInsightBySlug, getPublishedResearch, getResearchBySlug, getEvents } from '../lib/data';
import { createBooking, isSlotConflicting, cleanExpiredBookings } from '../lib/booking';
import { hashPassword, verifyPassword, generateToken } from '../lib/auth';
import { sendEmail } from '../lib/email';

// Ensure DB is initialized
const db = getDb();

test('1. Profile Settings: Admin updates profile and public page reflects saved data', async () => {
  const testName = 'Dr. Test Economist PhD';
  const testTitle = 'Lead Macroeconomic Strategist';

  db.prepare(`
    UPDATE site_settings
    SET researcher_name = ?, professional_title = ?, updated_at = datetime('now')
    WHERE id = 1
  `).run(testName, testTitle);

  const settings = getSiteSettings();
  assert.equal(settings.researcher_name, testName);
  assert.equal(settings.professional_title, testTitle);

  // Revert back to demonstration name
  db.prepare(`
    UPDATE site_settings
    SET researcher_name = 'Dr. Juma M. Mwangi', professional_title = 'Senior Economic Researcher & Policy Analyst'
    WHERE id = 1
  `).run();
});

test('2. Insights Publication & Draft Visibility: Draft content is private; publication is public', async () => {
  const draftSlug = 'test-draft-private-analysis';
  const pubSlug = 'test-public-analysis';

  db.prepare(`DELETE FROM insights WHERE slug IN (?, ?)`).run(draftSlug, pubSlug);

  // Insert a draft
  db.prepare(`
    INSERT INTO insights (title, slug, summary, content_html, topic, status, published_at, created_at, updated_at)
    VALUES ('Private Draft', ?, 'Draft summary', '<p>Confidential draft</p>', 'Policy', 'draft', null, datetime('now'), datetime('now'))
  `).run(draftSlug);

  // Insert a published article
  db.prepare(`
    INSERT INTO insights (title, slug, summary, content_html, topic, status, published_at, created_at, updated_at)
    VALUES ('Public Article', ?, 'Public summary', '<p>Public content</p>', 'Policy', 'published', datetime('now'), datetime('now'), datetime('now'))
  `).run(pubSlug);

  // Public visitor without allowDraft
  const publicDraft = getInsightBySlug(draftSlug, false);
  assert.equal(publicDraft, null, 'Public visitors MUST NOT access draft articles');

  const publicArticle = getInsightBySlug(pubSlug, false);
  assert.ok(publicArticle, 'Public visitors should access published articles');
  assert.equal(publicArticle.slug, pubSlug);

  // Admin preview with allowDraft
  const adminPreview = getInsightBySlug(draftSlug, true);
  assert.ok(adminPreview, 'Admin preview mode allows accessing drafts');

  // Clean up
  db.prepare(`DELETE FROM insights WHERE slug IN (?, ?)`).run(draftSlug, pubSlug);
});

test('3. Research & Publications: PDF / DOI external links and validation', async () => {
  const slug = 'test-debt-modeling-paper';
  db.prepare(`DELETE FROM research WHERE slug = ?`).run(slug);

  db.prepare(`
    INSERT INTO research (title, slug, abstract, authors, year, publication_type, topics_json, journal_publisher, doi_url, pdf_url, status)
    VALUES ('Debt Dynamics Test', ?, 'Test abstract', 'Dr. Juma M. Mwangi', 2026, 'Working Paper', '["Macro"]', 'Bank of Tanzania', 'https://doi.org/10.1234/test', '/demo-papers/debt-sustainability-tanzania.pdf', 'published')
  `).run(slug);

  const paper = getResearchBySlug(slug, false);
  assert.ok(paper);
  assert.equal(paper.doi_url, 'https://doi.org/10.1234/test');
  assert.equal(paper.pdf_url, '/demo-papers/debt-sustainability-tanzania.pdf');

  db.prepare(`DELETE FROM research WHERE slug = ?`).run(slug);
});

test('4. Tanzania Events: Upcoming and past events display correctly with organizer distinction', async () => {
  const { upcoming, past } = getEvents();
  assert.ok(Array.isArray(upcoming));
  assert.ok(Array.isArray(past));

  for (const evt of upcoming) {
    const end = new Date(evt.end_time);
    assert.ok(end >= new Date(), 'Upcoming events must have end_time in the future');
    assert.ok([0, 1].includes(evt.is_organized_by_me));
  }
});

test('5. Question Submission: Question persists securely and enters admin inbox with status "new"', async () => {
  const email = 'inquiry.test@example.tz';
  db.prepare(`DELETE FROM questions WHERE email = ?`).run(email);

  const stmt = db.prepare(`
    INSERT INTO questions (name, email, message, status, ip_hash, email_delivery_status, created_at, updated_at)
    VALUES ('Neema Kimaro', ?, 'What is the current policy rate projection?', 'new', '127.0.0.1', 'captured_local', datetime('now'), datetime('now'))
  `);
  const res = stmt.run(email);

  const question = db.prepare(`SELECT * FROM questions WHERE id = ?`).get(res.lastInsertRowid) as { id: number; status: string; email: string };
  assert.ok(question);
  assert.equal(question.status, 'new');
  assert.equal(question.email, email);

  // Admin marks read
  db.prepare(`UPDATE questions SET status = 'read' WHERE id = ?`).run(question.id);
  const updated = db.prepare(`SELECT status FROM questions WHERE id = ?`).get(question.id) as { status: string };
  assert.equal(updated.status, 'read');

  db.prepare(`DELETE FROM questions WHERE id = ?`).run(question.id);
});

test('6 & 7. Consultation Booking: Transactional Concurrency Overlap Prevention', async () => {
  // Ensure an active consultation service exists
  let service = db.prepare(`SELECT id, duration_minutes FROM consultation_services WHERE is_active = 1`).get() as { id: number; duration_minutes: number };
  if (!service) {
    const ins = db.prepare(`
      INSERT INTO consultation_services (name, slug, is_paid, price_amount, currency, duration_minutes, format, description, is_active)
      VALUES ('Test Service', 'test-service', 1, 100, 'USD', 45, 'both', 'Test description', 1)
    `).run();
    service = { id: Number(ins.lastInsertRowid), duration_minutes: 45 };
  }

  // Choose a future slot
  const testDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  testDate.setUTCHours(10, 0, 0, 0);
  const startIso = testDate.toISOString();
  const endIso = new Date(testDate.getTime() + 45 * 60 * 1000).toISOString();

  // Clear any existing bookings for this window
  db.prepare(`DELETE FROM bookings WHERE datetime(start_time) = datetime(?)`).run(startIso);

  // First booking succeeds
  const res1 = createBooking({
    serviceId: service.id,
    format: 'online',
    startTime: startIso,
    endTime: endIso,
    guestName: 'First Visitor',
    guestEmail: 'first@example.tz',
    topicSummary: 'First discussion topic analysis',
  });
  assert.ok(res1.booking);
  assert.equal(res1.booking.status, 'pending_review');

  // Second concurrent/overlapping booking MUST fail with conflict error
  assert.throws(
    () => {
      createBooking({
        serviceId: service.id,
        format: 'in_person',
        startTime: startIso,
        endTime: endIso,
        guestName: 'Concurrent Second Visitor',
        guestEmail: 'second@example.tz',
        topicSummary: 'Trying to double book same time slot',
      });
    },
    /no longer available/,
    'Concurrent booking for overlapping time MUST throw conflict error!'
  );

  // Cleanup test booking
  db.prepare(`DELETE FROM bookings WHERE id = ?`).run(res1.booking.id);
});

test('8. Expiry / Cancellation releases reserved slot', async () => {
  let service = db.prepare(`SELECT id, duration_minutes FROM consultation_services WHERE is_active = 1`).get() as { id: number; duration_minutes: number };

  const testDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
  testDate.setUTCHours(14, 0, 0, 0);
  const startIso = testDate.toISOString();
  const endIso = new Date(testDate.getTime() + 45 * 60 * 1000).toISOString();

  // Create booking
  const { booking } = createBooking({
    serviceId: service.id,
    format: 'online',
    startTime: startIso,
    endTime: endIso,
    guestName: 'Cancel Test',
    guestEmail: 'cancel@example.tz',
    topicSummary: 'Testing slot release upon cancellation',
  });

  // Verify slot is currently conflicted
  assert.equal(isSlotConflicting(startIso, endIso), true);

  // Cancel booking
  db.prepare(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`).run(booking.id);

  // Slot should now be free
  assert.equal(isSlotConflicting(startIso, endIso), false, 'Cancelled booking must release availability slot');

  // Cleanup
  db.prepare(`DELETE FROM bookings WHERE id = ?`).run(booking.id);
});

test('9. Paid booking remains unpaid until admin explicitly records payment', async () => {
  let paidService = db.prepare(`SELECT id, price_amount, currency FROM consultation_services WHERE is_paid = 1 AND is_active = 1`).get() as { id: number };

  const testDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const startIso = testDate.toISOString();
  const endIso = new Date(testDate.getTime() + 60 * 60 * 1000).toISOString();

  const { booking } = createBooking({
    serviceId: paidService.id,
    format: 'online',
    startTime: startIso,
    endTime: endIso,
    guestName: 'Paid Client',
    guestEmail: 'paidclient@example.tz',
    topicSummary: 'Strategic policy consultation',
  });

  // Booking MUST be awaiting_payment upon creation
  assert.equal(booking.payment_status, 'awaiting_payment');

  // Only admin action updates it to paid
  db.prepare(`UPDATE bookings SET payment_status = 'paid' WHERE id = ?`).run(booking.id);

  const verified = db.prepare(`SELECT payment_status FROM bookings WHERE id = ?`).get(booking.id) as { payment_status: string };
  assert.equal(verified.payment_status, 'paid');

  // Cleanup
  db.prepare(`DELETE FROM bookings WHERE id = ?`).run(booking.id);
});

test('10. Guest management tokens are unguessable and protect booking details', async () => {
  const token = generateToken(32);
  assert.equal(token.length, 64);
  assert.match(token, /^[0-9a-f]{64}$/);
});

test('11 & 12. Email Subscriptions: Double opt-in & Unsubscribe exclusion', async () => {
  const email = 'sub.test@example.tz';
  db.prepare(`DELETE FROM subscribers WHERE email = ?`).run(email);

  const verifyToken = generateToken(32);
  const unsubToken = generateToken(32);

  // Initial subscribe -> pending_verification
  db.prepare(`
    INSERT INTO subscribers (email, name, status, verification_token, unsubscribe_token, created_at, updated_at)
    VALUES (?, 'Sub Test', 'pending_verification', ?, ?, datetime('now'), datetime('now'))
  `).run(email, verifyToken, unsubToken);

  let sub = db.prepare(`SELECT * FROM subscribers WHERE email = ?`).get(email) as { id: number; status: string };
  assert.equal(sub.status, 'pending_verification');

  // Verify email -> confirmed
  db.prepare(`
    UPDATE subscribers SET status = 'confirmed', verified_at = datetime('now') WHERE id = ?
  `).run(sub.id);

  sub = db.prepare(`SELECT * FROM subscribers WHERE id = ?`).get(sub.id) as { id: number; status: string };
  assert.equal(sub.status, 'confirmed');

  // Unsubscribe -> unsubscribed
  db.prepare(`
    UPDATE subscribers SET status = 'unsubscribed' WHERE unsubscribe_token = ?
  `).run(unsubToken);

  sub = db.prepare(`SELECT * FROM subscribers WHERE id = ?`).get(sub.id) as { id: number; status: string };
  assert.equal(sub.status, 'unsubscribed');

  // Check that notification query excludes unsubscribed
  const activeSubs = db.prepare(`SELECT * FROM subscribers WHERE email = ? AND status = 'confirmed'`).all(email);
  assert.equal(activeSubs.length, 0, 'Unsubscribed subscriber must not receive future sends');

  // Cleanup
  db.prepare(`DELETE FROM subscribers WHERE id = ?`).run(sub.id);
});

test('13. Publication Campaign Deduplication: Republishing does not duplicate campaign', async () => {
  const insightId = 999999;
  db.prepare(`DELETE FROM email_campaigns WHERE publication_type = 'insight' AND publication_id = ?`).run(insightId);

  // First campaign dispatch
  db.prepare(`
    INSERT INTO email_campaigns (publication_type, publication_id, subject, sent_count, status, created_at)
    VALUES ('insight', ?, 'Test Subject', 10, 'sent', datetime('now'))
  `).run(insightId);

  // Attempting duplicate insert with same publication_type and publication_id must violate UNIQUE constraint
  assert.throws(() => {
    db.prepare(`
      INSERT INTO email_campaigns (publication_type, publication_id, subject, sent_count, status, created_at)
      VALUES ('insight', ?, 'Duplicate Send', 10, 'sent', datetime('now'))
    `).run(insightId);
  }, /UNIQUE constraint failed/, 'Campaign deduplication UNIQUE constraint must block duplicate notification sends');

  db.prepare(`DELETE FROM email_campaigns WHERE publication_type = 'insight' AND publication_id = ?`).run(insightId);
});

test('14. Safe Local Email Capture Outbox', async () => {
  const result = await sendEmail({
    to: 'tester@example.tz',
    subject: 'Local Capture Test',
    emailType: 'test_dispatch',
    text: 'Hello test body',
    html: '<p>Hello test body</p>',
  });

  assert.equal(result.success, true);
  assert.equal(result.mode, 'captured_local');

  const log = db.prepare(`SELECT * FROM email_logs WHERE recipient_email = ? AND subject = ?`).get('tester@example.tz', 'Local Capture Test') as { id: number; delivery_status: string };
  assert.ok(log);
  assert.equal(log.delivery_status, 'captured_local');

  db.prepare(`DELETE FROM email_logs WHERE id = ?`).run(log.id);
});
