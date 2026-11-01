import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getAllNewsAdmin, getNewsBySlug, getAllProjectsAdmin, getAllEventsAdmin } from '@/lib/data';
import { sanitizeHtml, isValidSlug, isReservedSlug } from '@/lib/sanitize';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const news = getAllNewsAdmin();
  const availableProjects = getAllProjectsAdmin().map((p) => ({ id: p.id, title: p.title, slug: p.slug }));
  const availableEvents = getAllEventsAdmin().map((e) => ({ id: e.id, title: e.title, slug: e.slug }));
  return NextResponse.json({ news, availableProjects, availableEvents });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;
    const title = (body.title || '').trim();
    const rawSlug = (body.slug || '').trim().toLowerCase();
    const summary = (body.summary || '').trim();
    const rawContentHtml = body.content_html || '';
    const category = (body.category || 'Institutional News').trim();
    const published_date = (body.published_date || new Date().toISOString().split('T')[0]).trim();
    const cover_image_url = (body.cover_image_url || '').trim();
    const cover_image_alt = (body.cover_image_alt || '').trim();
    const gallery_images_json = Array.isArray(body.gallery_images)
      ? JSON.stringify(body.gallery_images)
      : typeof body.gallery_images_json === 'string'
      ? body.gallery_images_json
      : '[]';
    const related_project_ids_json = Array.isArray(body.related_project_ids)
      ? JSON.stringify(body.related_project_ids)
      : typeof body.related_project_ids_json === 'string'
      ? body.related_project_ids_json
      : '[]';
    const related_event_ids_json = Array.isArray(body.related_event_ids)
      ? JSON.stringify(body.related_event_ids)
      : typeof body.related_event_ids_json === 'string'
      ? body.related_event_ids_json
      : '[]';
    const is_featured = body.is_featured ? 1 : 0;
    const status = body.status === 'published' ? 'published' : 'draft';

    if (!title) {
      return NextResponse.json({ error: 'News title is required' }, { status: 400 });
    }

    let slug = rawSlug;
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens (min 2 characters).' },
        { status: 400 }
      );
    }

    if (isReservedSlug(slug)) {
      return NextResponse.json(
        { error: `The slug "${slug}" is reserved and cannot be used.` },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db
      .prepare(`SELECT id FROM news_articles WHERE slug = ? AND (? IS NULL OR id != ?)`)
      .get(slug, id, id);
    if (existing) {
      return NextResponse.json(
        { error: `A news article with slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    const content_html = sanitizeHtml(rawContentHtml);

    if (id) {
      db.prepare(`
        UPDATE news_articles
        SET title = ?,
            slug = ?,
            summary = ?,
            content_html = ?,
            category = ?,
            published_date = ?,
            cover_image_url = ?,
            cover_image_alt = ?,
            gallery_images_json = ?,
            related_project_ids_json = ?,
            related_event_ids_json = ?,
            is_featured = ?,
            status = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        title,
        slug,
        summary,
        content_html,
        category,
        published_date,
        cover_image_url,
        cover_image_alt,
        gallery_images_json,
        related_project_ids_json,
        related_event_ids_json,
        is_featured,
        status,
        id
      );

      const updated = getNewsBySlug(slug, true);
      return NextResponse.json({ success: true, article: updated });
    } else {
      const res = db.prepare(`
        INSERT INTO news_articles (
          title, slug, summary, content_html, category, published_date,
          cover_image_url, cover_image_alt, gallery_images_json,
          related_project_ids_json, related_event_ids_json, is_featured, status,
          is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(
        title,
        slug,
        summary,
        content_html,
        category,
        published_date,
        cover_image_url,
        cover_image_alt,
        gallery_images_json,
        related_project_ids_json,
        related_event_ids_json,
        is_featured,
        status
      );

      const newId = Number(res.lastInsertRowid);
      const created = db.prepare(`SELECT * FROM news_articles WHERE id = ?`).get(newId);
      return NextResponse.json({ success: true, article: created });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save news article' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, action } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
    }

    const db = getDb();
    if (action === 'publish') {
      db.prepare(`UPDATE news_articles SET status = 'published', updated_at = datetime('now') WHERE id = ?`).run(id);
    } else if (action === 'unpublish') {
      db.prepare(`UPDATE news_articles SET status = 'draft', updated_at = datetime('now') WHERE id = ?`).run(id);
    } else if (action === 'toggle_featured') {
      db.prepare(`UPDATE news_articles SET is_featured = CASE WHEN is_featured = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?`).run(id);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update news status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`DELETE FROM news_articles WHERE id = ?`).run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete news article' }, { status: 500 });
  }
}
