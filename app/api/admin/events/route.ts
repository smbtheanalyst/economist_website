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
    const isOrganizedByMe = body.is_organized_by_me ? 1 : 0;
    const organizerName = body.organizer_name?.trim() || (isOrganizedByMe ? 'Dr. Researcher' : 'Third Party');
    const registrationUrl = body.registration_url?.trim() || '';

    if (!title || !slug || !startTime || !endTime) {
      return NextResponse.json({ error: 'Title, slug, start time, and end time are required.' }, { status: 400 });
    }

    if (body.id) {
      db.prepare(`
        UPDATE events
        SET title = ?, slug = ?, description = ?, start_time = ?, end_time = ?,
            venue_or_format = ?, is_online = ?, is_organized_by_me = ?, organizer_name = ?,
            registration_url = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(title, slug, description, startTime, endTime, venueOrFormat, isOnline, isOrganizedByMe, organizerName, registrationUrl, body.id);
      return NextResponse.json({ success: true, message: 'Event updated.' });
    } else {
      const result = db.prepare(`
        INSERT INTO events (title, slug, description, start_time, end_time, venue_or_format, is_online, is_organized_by_me, organizer_name, registration_url, is_demo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(title, slug, description, startTime, endTime, venueOrFormat, isOnline, isOrganizedByMe, organizerName, registrationUrl);
      return NextResponse.json({ success: true, id: result.lastInsertRowid, message: 'Event created.' });
    }
  } catch (err: unknown) {
    console.error('Events error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Failed to save event.' }, { status: 500 });
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
