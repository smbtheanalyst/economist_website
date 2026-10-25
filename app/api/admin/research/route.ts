import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const items = db.prepare(`SELECT * FROM research ORDER BY is_featured DESC, year DESC, id DESC`).all();
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
    const abstract = body.abstract?.trim() || '';
    const authors = body.authors?.trim() || 'Dr. Researcher';
    const year = parseInt(body.year || new Date().getFullYear().toString(), 10);
    const publicationType = body.publication_type || 'Journal Article';
    const topicsJson = typeof body.topics_json === 'string' ? body.topics_json : JSON.stringify(body.topics_json || []);
    const journalPublisher = body.journal_publisher?.trim() || '';
    const doiUrl = body.doi_url?.trim() || '';
    const pdfUrl = body.pdf_url?.trim() || '';
    const isFeatured = body.is_featured ? 1 : 0;
    const status = body.status === 'published' ? 'published' : 'draft';

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });
    }

    if (body.id) {
      db.prepare(`
        UPDATE research
        SET title = ?, slug = ?, abstract = ?, authors = ?, year = ?,
            publication_type = ?, topics_json = ?, journal_publisher = ?,
            doi_url = ?, pdf_url = ?, is_featured = ?, status = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(title, slug, abstract, authors, year, publicationType, topicsJson, journalPublisher, doiUrl, pdfUrl, isFeatured, status, body.id);
      return NextResponse.json({ success: true, message: 'Research publication updated.' });
    } else {
      const result = db.prepare(`
        INSERT INTO research (title, slug, abstract, authors, year, publication_type, topics_json, journal_publisher, doi_url, pdf_url, is_featured, status, is_demo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(title, slug, abstract, authors, year, publicationType, topicsJson, journalPublisher, doiUrl, pdfUrl, isFeatured, status);
      return NextResponse.json({ success: true, id: result.lastInsertRowid, message: 'Research publication created.' });
    }
  } catch (err: unknown) {
    console.error('Research error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Failed to save publication.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const db = getDb();
  db.prepare(`DELETE FROM research WHERE id = ?`).run(id);
  return NextResponse.json({ success: true, message: 'Publication deleted.' });
}
