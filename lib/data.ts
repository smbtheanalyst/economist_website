import { getDb } from './db';

export interface SiteSettings {
  id: number;
  researcher_name: string;
  professional_title: string;
  portrait_url: string;
  biography: string;
  qualifications_json: string;
  research_interests_json: string;
  affiliations_json: string;
  cv_url: string;
  hero_headline: string;
  hero_intro: string;
  contact_email: string;
  office_address: string;
  office_instructions: string;
  online_instructions: string;
  payment_instructions: string;
  social_links_json: string;
  is_demo: number;
  updated_at: string;
}

export function getSiteSettings(): SiteSettings {
  const db = getDb();
  let row = (db.prepare(`SELECT * FROM site_settings WHERE id = 1`).get() as unknown) as SiteSettings | undefined;
  if (!row) {
    db.prepare(`
      INSERT INTO site_settings (id, researcher_name, professional_title)
      VALUES (1, 'Dr. Juma M. Mwangi', 'Senior Economic Researcher & Policy Analyst')
    `).run();
    row = (db.prepare(`SELECT * FROM site_settings WHERE id = 1`).get() as unknown) as SiteSettings;
  }
  return row;
}

export interface InsightItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  topic: string;
  cover_image_url: string;
  read_time_minutes: number;
  is_featured: number;
  status: 'draft' | 'published';
  published_at: string | null;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export function getPublishedInsights(options?: {
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): { items: InsightItem[]; total: number } {
  const db = getDb();
  let where = `WHERE status = 'published'`;
  const params: (string | number)[] = [];

  if (options?.topic && options.topic !== 'all') {
    where += ` AND topic = ?`;
    params.push(options.topic);
  }

  if (options?.search && options.search.trim()) {
    where += ` AND (title LIKE ? OR summary LIKE ? OR content_html LIKE ?)`;
    const s = `%${options.search.trim()}%`;
    params.push(s, s, s);
  }

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM insights ${where}`).get(...params) as { count: number };
  const total = countRow ? countRow.count : 0;

  let query = `
    SELECT * FROM insights
    ${where}
    ORDER BY is_featured DESC, datetime(published_at) DESC, id DESC
  `;

  if (options?.limit) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(options.limit, options.offset || 0);
  }

  const items = db.prepare(query).all(...params) as unknown as InsightItem[];
  return { items, total };
}

export function getInsightTopics(): string[] {
  const db = getDb();
  const rows = db.prepare(`SELECT DISTINCT topic FROM insights WHERE status = 'published' AND topic != '' ORDER BY topic ASC`).all() as { topic: string }[];
  return rows.map(r => r.topic);
}

export function getInsightBySlug(slug: string, allowDraft = false): InsightItem | null {
  const db = getDb();
  const sql = allowDraft
    ? `SELECT * FROM insights WHERE slug = ?`
    : `SELECT * FROM insights WHERE slug = ? AND status = 'published'`;
  const row = db.prepare(sql).get(slug) as unknown as InsightItem | undefined;
  return row || null;
}

export interface ResearchItem {
  id: number;
  title: string;
  slug: string;
  abstract: string;
  authors: string;
  year: number;
  publication_type: string;
  topics_json: string;
  journal_publisher: string;
  doi_url: string;
  pdf_url: string;
  is_featured: number;
  status: 'draft' | 'published';
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export function getPublishedResearch(options?: {
  type?: string;
  search?: string;
  limit?: number;
}): ResearchItem[] {
  const db = getDb();
  let where = `WHERE status = 'published'`;
  const params: (string | number)[] = [];

  if (options?.type && options.type !== 'all') {
    where += ` AND publication_type = ?`;
    params.push(options.type);
  }

  if (options?.search && options.search.trim()) {
    where += ` AND (title LIKE ? OR abstract LIKE ? OR authors LIKE ?)`;
    const s = `%${options.search.trim()}%`;
    params.push(s, s, s);
  }

  let query = `
    SELECT * FROM research
    ${where}
    ORDER BY is_featured DESC, year DESC, id DESC
  `;

  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }

  return db.prepare(query).all(...params) as unknown as ResearchItem[];
}

export function getResearchBySlug(slug: string, allowDraft = false): ResearchItem | null {
  const db = getDb();
  const sql = allowDraft
    ? `SELECT * FROM research WHERE slug = ?`
    : `SELECT * FROM research WHERE slug = ? AND status = 'published'`;
  const row = db.prepare(sql).get(slug) as unknown as ResearchItem | undefined;
  return row || null;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  start_time: string;
  end_time: string;
  venue_or_format: string;
  is_online: number;
  is_organized_by_me: number;
  organizer_name: string;
  registration_url: string;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export function getEvents(): { upcoming: EventItem[]; past: EventItem[] } {
  const db = getDb();
  const nowIso = new Date().toISOString();

  const upcoming = db.prepare(`
    SELECT * FROM events
    WHERE datetime(end_time) >= datetime(?)
    ORDER BY datetime(start_time) ASC
  `).all(nowIso) as unknown as EventItem[];

  const past = db.prepare(`
    SELECT * FROM events
    WHERE datetime(end_time) < datetime(?)
    ORDER BY datetime(start_time) DESC
  `).all(nowIso) as unknown as EventItem[];

  return { upcoming, past };
}
