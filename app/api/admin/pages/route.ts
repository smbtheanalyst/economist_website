import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getAllPagesAdmin, getPageBySlug } from '@/lib/data';
import { sanitizeHtml, isValidSlug, isReservedSlug } from '@/lib/sanitize';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pages = getAllPagesAdmin();
  return NextResponse.json({ pages });
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
    const cover_image_url = (body.cover_image_url || '').trim();
    const cover_image_alt = (body.cover_image_alt || '').trim();
    const seo_title = (body.seo_title || '').trim();
    const seo_description = (body.seo_description || '').trim();
    const status = body.status === 'published' ? 'published' : 'draft';

    if (!title) {
      return NextResponse.json({ error: 'Page title is required' }, { status: 400 });
    }

    // Auto-generate slug from title if missing
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
        { error: `The slug "${slug}" is a reserved system route and cannot be used.` },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check slug uniqueness across other pages
    const existing = db.prepare(`SELECT id FROM pages WHERE slug = ? AND (? IS NULL OR id != ?)`).get(slug, id, id);
    if (existing) {
      return NextResponse.json({ error: `A page with slug "${slug}" already exists.` }, { status: 400 });
    }

    // Server-side HTML Sanitization
    const content_html = sanitizeHtml(rawContentHtml);

    if (id) {
      // Update
      db.prepare(`
        UPDATE pages
        SET title = ?,
            slug = ?,
            summary = ?,
            content_html = ?,
            cover_image_url = ?,
            cover_image_alt = ?,
            seo_title = ?,
            seo_description = ?,
            status = ?,
            published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') ELSE published_at END,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        title,
        slug,
        summary,
        content_html,
        cover_image_url,
        cover_image_alt,
        seo_title,
        seo_description,
        status,
        status,
        id
      );

      const updated = getPageBySlug(slug, true);
      return NextResponse.json({ success: true, page: updated });
    } else {
      // Create
      const publishedAt = status === 'published' ? new Date().toISOString() : null;
      const res = db.prepare(`
        INSERT INTO pages (
          title, slug, summary, content_html, cover_image_url, cover_image_alt,
          seo_title, seo_description, status, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        title,
        slug,
        summary,
        content_html,
        cover_image_url,
        cover_image_alt,
        seo_title,
        seo_description,
        status,
        publishedAt
      );

      const newId = Number(res.lastInsertRowid);
      const created = db.prepare(`SELECT * FROM pages WHERE id = ?`).get(newId);
      return NextResponse.json({ success: true, page: created });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save page' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 });
    }

    const db = getDb();
    if (action === 'publish') {
      db.prepare(`
        UPDATE pages
        SET status = 'published',
            published_at = COALESCE(published_at, datetime('now')),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(id);
    } else if (action === 'unpublish') {
      db.prepare(`
        UPDATE pages
        SET status = 'draft',
            updated_at = datetime('now')
        WHERE id = ?
      `).run(id);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update page status' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`DELETE FROM pages WHERE id = ?`).run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete page' }, { status: 500 });
  }
}
