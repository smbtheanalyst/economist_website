import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const items = db.prepare(`SELECT * FROM events ORDER BY datetime(start_time) DESC`).all();
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
    const description = body.description?.trim() || '';
    const startTime = body.start_time;
    const endTime = body.end_time;
    const venueOrFormat = body.venue_or_format?.trim() || 'Dar es Salaam, Tanzania';
    const isOnline = body.is_online ? 1 : 0;
    
    // Explicit Organizer Choice: 'tefpc' vs 'external'
    const organizerType = body.organizer_type === 'external' ? 'external' : 'tefpc';
    let organizerName = '';
    let isOrganizedByMe = 0;

    if (organizerType === 'tefpc') {
      organizerName = 'Tanzania Economic and Financial Policy Consultancy (TEFPC)';
      isOrganizedByMe = 1;
    } else {
      organizerName = body.organizer_name?.trim() || '';
      isOrganizedByMe = 0;
      if (!organizerName) {
        return NextResponse.json({ error: 'External organizer name is required.' }, { status: 400 });
      }
    }

    const registrationUrl = body.registration_url?.trim() || '';
    const status = body.status === 'published' ? 'published' : 'draft';
    const coverImageUrl = body.cover_image_url?.trim() || '';
    const coverImageAlt = body.cover_image_alt?.trim() || '';
    const galleryImagesJson = typeof body.gallery_images_json === 'string'
      ? body.gallery_images_json
      : JSON.stringify(body.gallery_images || []);

    if (!title || !slug || !startTime || !endTime) {
      return NextResponse.json({ error: 'Title, slug, start time, and end time are required.' }, { status: 400 });
    }

    if (body.id) {
      db.prepare(`
        UPDATE events
        SET title = ?, slug = ?, description = ?, start_time = ?, end_time = ?,
            venue_or_format = ?, is_online = ?, is_organized_by_me = ?, organizer_type = ?, organizer_name = ?,
            registration_url = ?, status = ?, cover_image_url = ?, cover_image_alt = ?, gallery_images_json = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        title, slug, description, startTime, endTime, venueOrFormat,
        isOnline, isOrganizedByMe, organizerType, organizerName,
        registrationUrl, status, coverImageUrl, coverImageAlt, galleryImagesJson,
        body.id
      );
      return NextResponse.json({ success: true, message: 'Event updated.' });
    } else {
      const result = db.prepare(`
        INSERT INTO events (
          title, slug, description, start_time, end_time, venue_or_format,
          is_online, is_organized_by_me, organizer_type, organizer_name, registration_url,
          status, cover_image_url, cover_image_alt, gallery_images_json,
          is_demo, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(
        title, slug, description, startTime, endTime, venueOrFormat,
        isOnline, isOrganizedByMe, organizerType, organizerName, registrationUrl,
        status, coverImageUrl, coverImageAlt, galleryImagesJson
      );
      return NextResponse.json({ success: true, id: result.lastInsertRowid, message: 'Event created.' });
    }
  } catch (err: unknown) {
    console.error('Events error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Failed to save event.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const id = body.id;
    const action = body.action; // 'publish' or 'unpublish'
    const status = action === 'publish' || body.status === 'published' ? 'published' : 'draft';

    if (!id) {
      return NextResponse.json({ error: 'Event ID required.' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`
      UPDATE events
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, id);

    return NextResponse.json({ success: true, status, message: `Event ${status === 'published' ? 'published' : 'moved to drafts'}.` });
  } catch (err: unknown) {
    console.error('Events status patch error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Failed to update event status.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const db = getDb();
  db.prepare(`DELETE FROM events WHERE id = ?`).run(id);
  return NextResponse.json({ success: true, message: 'Event deleted.' });
}
