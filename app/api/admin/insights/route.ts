import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const items = db.prepare(`SELECT * FROM insights ORDER BY is_featured DESC, id DESC`).all();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const db = getDb();

    const title = body.title?.trim();
    let slug = body.slug?.trim() || title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const summary = body.summary?.trim() || '';
    const contentHtml = body.content_html?.trim() || '';
    const topic = body.topic?.trim() || 'Economics';
    const coverImageUrl = body.cover_image_url?.trim() || '';
    const readTimeMinutes = parseInt(body.read_time_minutes || '5', 10);
    const isFeatured = body.is_featured ? 1 : 0;
    const status = body.status === 'published' ? 'published' : 'draft';
    const publishedAt = status === 'published' ? (body.published_at || new Date().toISOString()) : null;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });
    }

    if (body.id) {
      // Update
      db.prepare(`
        UPDATE insights
        SET title = ?, slug = ?, summary = ?, content_html = ?, topic = ?,
            cover_image_url = ?, read_time_minutes = ?, is_featured = ?, status = ?,
            published_at = coalesce(?, published_at), updated_at = datetime('now')
        WHERE id = ?
      `).run(title, slug, summary, contentHtml, topic, coverImageUrl, readTimeMinutes, isFeatured, status, publishedAt, body.id);
      return NextResponse.json({ success: true, message: 'Article updated successfully.' });
    } else {
      // Insert
      const result = db.prepare(`
        INSERT INTO insights (title, slug, summary, content_html, topic, cover_image_url, read_time_minutes, is_featured, status, published_at, is_demo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(title, slug, summary, contentHtml, topic, coverImageUrl, readTimeMinutes, isFeatured, status, publishedAt);
      return NextResponse.json({ success: true, id: result.lastInsertRowid, message: 'Article created successfully.' });
    }
  } catch (err: unknown) {
    console.error('Insights error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Failed to save insight.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const db = getDb();
  db.prepare(`DELETE FROM insights WHERE id = ?`).run(id);
  return NextResponse.json({ success: true, message: 'Article deleted.' });
}
