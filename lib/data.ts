import { getDb } from './db';

export interface SiteSettings {
  id: number;
  institution_name?: string;
  institution_short_name?: string;
  institution_tagline?: string;
  mission_statement?: string;
  vision_statement?: string;
  core_values_json?: string;
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
      INSERT INTO site_settings (id, researcher_name, professional_title, hero_headline, hero_intro, office_address, contact_email, portrait_url, cv_url, is_demo)
      VALUES (1, 'Dr. Hamis Miraji Ally Simba', 'Economist · Researcher · Consultant',
              'Research, insights and informed economic decisions.',
              'Economic research and perspectives on public policy, development and the forces shaping Tanzania’s economy.',
              'Tanzania Economic and Financial Policy Consultancy (TEFPC), Simu 4 Street, Makunganya Road, Rita Tower, 15th Floor, Posta, Dar es Salaam, Tanzania',
              '',
              '/portrait-dr-hamis-simba-card.jpg',
              '/dr-hamis-simba-cv-public.pdf',
              0)
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

export interface EventGalleryImage {
  id: string;
  url: string;
  caption: string;
  order: number;
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
  organizer_type?: 'tefpc' | 'external';
  organizer_name: string;
  registration_url: string;
  status: 'draft' | 'published';
  cover_image_url?: string;
  cover_image_alt?: string;
  gallery_images_json?: string;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export function parseGalleryImages(jsonStr?: string | null): EventGalleryImage[] {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  } catch {}
  return [];
}

export function getEvents(includeDrafts = false): { upcoming: EventItem[]; past: EventItem[] } {
  const db = getDb();
  const nowIso = new Date().toISOString();

  const statusClause = includeDrafts ? '' : "AND status = 'published'";

  const upcoming = db.prepare(`
    SELECT * FROM events
    WHERE datetime(end_time) >= datetime(?) ${statusClause}
    ORDER BY datetime(start_time) ASC
  `).all(nowIso) as unknown as EventItem[];

  const past = db.prepare(`
    SELECT * FROM events
    WHERE datetime(end_time) < datetime(?) ${statusClause}
    ORDER BY datetime(start_time) DESC
  `).all(nowIso) as unknown as EventItem[];

  return { upcoming, past };
}

export function getEventBySlug(slug: string, includeDraft = false): EventItem | null {
  const db = getDb();
  const sql = includeDraft
    ? `SELECT * FROM events WHERE slug = ? LIMIT 1`
    : `SELECT * FROM events WHERE slug = ? AND status = 'published' LIMIT 1`;
  const row = db.prepare(sql).get(slug) as EventItem | undefined;
  return row || null;
}

export function getAllEventsAdmin(): EventItem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM events ORDER BY datetime(start_time) DESC`).all() as unknown as EventItem[];
}

// ==========================================
// CONFIGURABLE NAVIGATION
// ==========================================

export interface NavItem {
  id: string;
  label: string;
  path: string;
  is_external?: boolean;
  visible: boolean;
  order: number;
  children?: NavItem[];
}

export interface NavigationMenuData {
  published: NavItem[];
  draft: NavItem[];
  updated_at: string;
}

export function getNavigationMenu(includeDraft = false): NavItem[] {
  const db = getDb();
  const row = db.prepare(`SELECT published_items_json, draft_items_json FROM navigation_menus WHERE id = 1`).get() as {
    published_items_json: string;
    draft_items_json: string;
  } | undefined;

  if (!row) return [];

  const rawJson = includeDraft ? row.draft_items_json : row.published_items_json;
  try {
    const parsed: NavItem[] = JSON.parse(rawJson || '[]');
    // Return only visible items in order, and their visible children in order
    return parsed
      .filter((item) => (includeDraft ? true : item.visible !== false))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item) => ({
        ...item,
        children: (item.children || [])
          .filter((c) => (includeDraft ? true : c.visible !== false))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      }));
  } catch {
    return [];
  }
}

export function getFullNavigationData(): NavigationMenuData {
  const db = getDb();
  const row = db.prepare(`SELECT published_items_json, draft_items_json, updated_at FROM navigation_menus WHERE id = 1`).get() as {
    published_items_json: string;
    draft_items_json: string;
    updated_at: string;
  } | undefined;

  if (!row) {
    return { published: [], draft: [], updated_at: '' };
  }

  let published: NavItem[] = [];
  let draft: NavItem[] = [];

  try {
    published = JSON.parse(row.published_items_json || '[]');
  } catch {}

  try {
    draft = JSON.parse(row.draft_items_json || '[]');
  } catch {}

  return { published, draft, updated_at: row.updated_at };
}

export function saveDraftNavigation(items: NavItem[]): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO navigation_menus (id, draft_items_json, published_items_json, updated_at)
    VALUES (1, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      draft_items_json = excluded.draft_items_json,
      updated_at = datetime('now')
  `).run(JSON.stringify(items), JSON.stringify(items));
}

export function publishNavigation(): void {
  const db = getDb();
  const row = db.prepare(`SELECT draft_items_json FROM navigation_menus WHERE id = 1`).get() as { draft_items_json: string } | undefined;
  if (!row) return;

  db.prepare(`
    UPDATE navigation_menus
    SET published_items_json = draft_items_json,
        updated_at = datetime('now')
    WHERE id = 1
  `).run();
}

export function discardDraftNavigation(): void {
  const db = getDb();
  db.prepare(`
    UPDATE navigation_menus
    SET draft_items_json = published_items_json,
        updated_at = datetime('now')
    WHERE id = 1
  `).run();
}

// ==========================================
// INSTITUTIONAL PAGES
// ==========================================

export interface PageItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  seo_title?: string;
  seo_description?: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export function getPageBySlug(slug: string, includeDraft = false): PageItem | null {
  const db = getDb();
  const sql = includeDraft
    ? `SELECT * FROM pages WHERE slug = ? LIMIT 1`
    : `SELECT * FROM pages WHERE slug = ? AND status = 'published' LIMIT 1`;
  const row = db.prepare(sql).get(slug) as PageItem | undefined;
  return row || null;
}

export function getPublishedPages(): PageItem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM pages WHERE status = 'published' ORDER BY title ASC`).all() as unknown as PageItem[];
}

export function getAllPagesAdmin(): PageItem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM pages ORDER BY updated_at DESC`).all() as unknown as PageItem[];
}

// ==========================================
// HOMEPAGE ACTIVITY SLIDES
// ==========================================

export interface HomepageSlideItem {
  id: number;
  title: string;
  caption?: string;
  image_url: string;
  image_alt: string;
  activity_date?: string;
  activity_location?: string;
  link_url?: string;
  link_text?: string;
  focal_point: 'center' | 'top' | 'bottom' | 'left' | 'right';
  display_order: number;
  is_enabled: number;
  created_at: string;
  updated_at: string;
}

export function getActiveHomepageSlides(): HomepageSlideItem[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM homepage_slides
    WHERE is_enabled = 1
    ORDER BY display_order ASC, id ASC
  `).all() as unknown as HomepageSlideItem[];
}

export function getAllHomepageSlidesAdmin(): HomepageSlideItem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM homepage_slides ORDER BY display_order ASC, id ASC`).all() as unknown as HomepageSlideItem[];
}

// ==========================================
// PROJECTS
// ==========================================

export interface ProjectPartnerRole {
  name: string;
  role: 'funder' | 'implementing_partner' | 'research_partner' | 'other';
  role_label?: string;
  url?: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description_html: string;
  research_theme: string;
  project_status: 'ongoing' | 'completed';
  status: 'draft' | 'published';
  start_date?: string;
  end_date?: string;
  location?: string;
  objectives_json: string;
  activities_json: string;
  outputs_json: string;
  outcomes_json: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  gallery_images_json: string;
  related_research_ids_json: string;
  related_news_ids_json: string;
  partner_organizations_json: string;
  is_featured: number;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export function getProjects(options?: {
  status?: 'ongoing' | 'completed' | 'all';
  includeDrafts?: boolean;
  featuredOnly?: boolean;
  theme?: string;
  limit?: number;
}): ProjectItem[] {
  const db = getDb();
  let where = options?.includeDrafts ? `WHERE 1=1` : `WHERE status = 'published'`;
  const params: (string | number)[] = [];

  if (options?.status && options.status !== 'all') {
    where += ` AND project_status = ?`;
    params.push(options.status);
  }

  if (options?.featuredOnly) {
    where += ` AND is_featured = 1`;
  }

  if (options?.theme && options.theme !== 'all') {
    where += ` AND research_theme = ?`;
    params.push(options.theme);
  }

  let query = `
    SELECT * FROM projects
    ${where}
    ORDER BY is_featured DESC, datetime(created_at) DESC, id DESC
  `;

  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }

  return db.prepare(query).all(...params) as unknown as ProjectItem[];
}

export function getProjectBySlug(slug: string, includeDraft = false): ProjectItem | null {
  const db = getDb();
  const sql = includeDraft
    ? `SELECT * FROM projects WHERE slug = ? LIMIT 1`
    : `SELECT * FROM projects WHERE slug = ? AND status = 'published' LIMIT 1`;
  const row = db.prepare(sql).get(slug) as ProjectItem | undefined;
  return row || null;
}

export function getAllProjectsAdmin(): ProjectItem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM projects ORDER BY created_at DESC`).all() as unknown as ProjectItem[];
}

// ==========================================
// PARTNERS
// ==========================================

export interface PartnerItem {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  logo_alt?: string;
  website_url?: string;
  relationship_description: string;
  relationship_type: string;
  related_project_ids_json: string;
  display_order: number;
  is_featured_homepage: number;
  status: 'draft' | 'published';
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export function getPartners(options?: {
  includeDrafts?: boolean;
  featuredHomepageOnly?: boolean;
  limit?: number;
}): PartnerItem[] {
  const db = getDb();
  let where = options?.includeDrafts ? `WHERE 1=1` : `WHERE status = 'published'`;
  const params: (string | number)[] = [];

  if (options?.featuredHomepageOnly) {
    where += ` AND is_featured_homepage = 1`;
  }

  let query = `
    SELECT * FROM partners
    ${where}
    ORDER BY display_order ASC, id ASC
  `;

  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }

  return db.prepare(query).all(...params) as unknown as PartnerItem[];
}

export function getPartnerBySlug(slug: string, includeDraft = false): PartnerItem | null {
  const db = getDb();
  const sql = includeDraft
    ? `SELECT * FROM partners WHERE slug = ? LIMIT 1`
    : `SELECT * FROM partners WHERE slug = ? AND status = 'published' LIMIT 1`;
  const row = db.prepare(sql).get(slug) as PartnerItem | undefined;
  return row || null;
}

export function getAllPartnersAdmin(): PartnerItem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM partners ORDER BY display_order ASC, id ASC`).all() as unknown as PartnerItem[];
}

// ==========================================
// NEWS ARTICLES
// ==========================================

export interface NewsArticleItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  category: string;
  published_date: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  gallery_images_json: string;
  related_project_ids_json: string;
  related_event_ids_json: string;
  is_featured: number;
  status: 'draft' | 'published';
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export function getNewsArticles(options?: {
  category?: string;
  includeDrafts?: boolean;
  featuredOnly?: boolean;
  limit?: number;
}): NewsArticleItem[] {
  const db = getDb();
  let where = options?.includeDrafts ? `WHERE 1=1` : `WHERE status = 'published'`;
  const params: (string | number)[] = [];

  if (options?.category && options.category !== 'all') {
    where += ` AND category = ?`;
    params.push(options.category);
  }

  if (options?.featuredOnly) {
    where += ` AND is_featured = 1`;
  }

  let query = `
    SELECT * FROM news_articles
    ${where}
    ORDER BY is_featured DESC, date(published_date) DESC, id DESC
  `;

  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }

  return db.prepare(query).all(...params) as unknown as NewsArticleItem[];
}

export function getNewsBySlug(slug: string, includeDraft = false): NewsArticleItem | null {
  const db = getDb();
  const sql = includeDraft
    ? `SELECT * FROM news_articles WHERE slug = ? LIMIT 1`
    : `SELECT * FROM news_articles WHERE slug = ? AND status = 'published' LIMIT 1`;
  const row = db.prepare(sql).get(slug) as NewsArticleItem | undefined;
  return row || null;
}

export function getAllNewsAdmin(): NewsArticleItem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM news_articles ORDER BY date(published_date) DESC, id DESC`).all() as unknown as NewsArticleItem[];
}

// ==========================================
// MEDIA GALLERY
// ==========================================

export interface MediaGalleryItem {
  id: number;
  title: string;
  caption?: string;
  image_url: string;
  image_alt: string;
  category: string;
  source_type: string;
  source_id?: number | null;
  event_date?: string;
  location?: string;
  display_order: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export function getMediaGalleryItems(options?: {
  category?: string;
  includeDrafts?: boolean;
  limit?: number;
}): MediaGalleryItem[] {
  const db = getDb();
  let where = options?.includeDrafts ? `WHERE 1=1` : `WHERE status = 'published'`;
  const params: (string | number)[] = [];

  if (options?.category && options.category !== 'all') {
    where += ` AND category = ?`;
    params.push(options.category);
  }

  let query = `
    SELECT * FROM media_gallery
    ${where}
    ORDER BY display_order ASC, date(created_at) DESC, id DESC
  `;

  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }

  return db.prepare(query).all(...params) as unknown as MediaGalleryItem[];
}

export function getAllMediaGalleryAdmin(): MediaGalleryItem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM media_gallery ORDER BY display_order ASC, id DESC`).all() as unknown as MediaGalleryItem[];
}
