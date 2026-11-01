import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getAllMediaGalleryAdmin } from '@/lib/data';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = getAllMediaGalleryAdmin();
  return NextResponse.json({ items });
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
    const caption = (body.caption || '').trim();
    const image_url = (body.image_url || '').trim();
    const image_alt = (body.image_alt || '').trim();
    const category = (body.category || 'Events & Dialogues').trim();
    const source_type = (body.source_type || 'manual').trim();
    const source_id = body.source_id ? Number(body.source_id) : null;
    const event_date = (body.event_date || '').trim();
    const location = (body.location || '').trim();
    const display_order = typeof body.display_order === 'number' ? body.display_order : 0;
    const status = body.status === 'draft' ? 'draft' : 'published';

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!image_url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }
    if (!image_alt) {
      return NextResponse.json({ error: 'Image alt text is required' }, { status: 400 });
    }

    const db = getDb();

    if (id) {
      db.prepare(`
        UPDATE media_gallery
        SET title = ?,
            caption = ?,
            image_url = ?,
            image_alt = ?,
            category = ?,
            source_type = ?,
            source_id = ?,
            event_date = ?,
            location = ?,
            display_order = ?,
            status = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        title,
        caption,
        image_url,
        image_alt,
        category,
        source_type,
        source_id,
        event_date,
        location,
        display_order,
        status,
        id
      );

      return NextResponse.json({ success: true });
    } else {
      const res = db.prepare(`
        INSERT INTO media_gallery (
          title, caption, image_url, image_alt, category, source_type,
          source_id, event_date, location, display_order, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        title,
        caption,
        image_url,
        image_alt,
        category,
        source_type,
        source_id,
        event_date,
        location,
        display_order,
        status
      );

      return NextResponse.json({ success: true, id: Number(res.lastInsertRowid) });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save media item' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`DELETE FROM media_gallery WHERE id = ?`).run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete media item' }, { status: 500 });
  }
}
