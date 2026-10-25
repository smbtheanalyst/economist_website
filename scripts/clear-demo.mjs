import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';
if (!fs.existsSync(path.resolve(DB_PATH))) {
  console.log('No database found. Nothing to clear.');
  process.exit(0);
}

const db = new DatabaseSync(path.resolve(DB_PATH));
db.exec('PRAGMA foreign_keys = ON;');

console.log('🧹 Clearing all demonstration content from database...');

db.prepare(`DELETE FROM insights WHERE is_demo = 1`).run();
db.prepare(`DELETE FROM research WHERE is_demo = 1`).run();
db.prepare(`DELETE FROM events WHERE is_demo = 1`).run();
db.prepare(`DELETE FROM consultation_services WHERE is_demo = 1`).run();
db.prepare(`DELETE FROM bookings WHERE is_demo = 1`).run();
db.prepare(`DELETE FROM subscribers WHERE email LIKE '%@demo-sub.tz'`).run();

db.prepare(`
  UPDATE site_settings
  SET
    researcher_name = 'Dr. [Full Name]',
    professional_title = 'Economic Researcher & Policy Specialist',
    portrait_url = '',
    biography = 'Professional biography to be provided.',
    qualifications_json = '[]',
    research_interests_json = '[]',
    affiliations_json = '[]',
    cv_url = '',
    hero_headline = 'Understanding the economy.\nAdvancing the conversation.',
    hero_intro = 'Independent economic research and policy analysis.',
    contact_email = 'contact@example.tz',
    office_address = 'Dar es Salaam, Tanzania',
    social_links_json = '[]',
    is_demo = 0,
    updated_at = datetime('now')
  WHERE id = 1
`).run();

console.log('✅ Demo content cleared. Site is now ready for production client data.');
