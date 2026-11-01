import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getAllHomepageSlidesAdmin, getAllEventsAdmin } from '@/lib/data';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slides = getAllHomepageSlidesAdmin();

  // Collect reusable existing event images for easy reuse without duplicate uploads
  const events = getAllEventsAdmin();
  const reusableImages: { url: string; alt: string; source: string }[] = [];

  events.forEach((ev) => {
    if (ev.cover_image_url) {
      reusableImages.push({
        url: ev.cover_image_url,
        alt: ev.cover_image_alt || ev.title,
        source: `Event: ${ev.title}`,
      });
    }
    if (ev.gallery_images_json) {
      try {
        const gallery = JSON.parse(ev.gallery_images_json);
        if (Array.isArray(gallery)) {
          gallery.forEach((g: any) => {
            if (g.url) {
              reusableImages.push({
                url: g.url,
                alt: g.caption || ev.title,
                source: `Event Gallery: ${ev.title}`,
              });
            }
          });
        }
      } catch {}
    }
  });

  return NextResponse.json({ slides, reusableImages });
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
    const activity_date = (body.activity_date || '').trim();
    const activity_location = (body.activity_location || '').trim();
    const link_url = (body.link_url || '').trim();
    const link_text = (body.link_text || '').trim();
    const focal_point = ['center', 'top', 'bottom', 'left', 'right'].includes(body.focal_point)
      ? body.focal_point
      : 'center';
    const display_order = typeof body.display_order === 'number' ? body.display_order : 0;
    const is_enabled = body.is_enabled !== 0 && body.is_enabled !== false ? 1 : 0;

    if (!title) {
      return NextResponse.json({ error: 'Slide title is required' }, { status: 400 });
    }
    if (!image_url) {
      return NextResponse.json({ error: 'Slide image URL is required' }, { status: 400 });
    }
    if (!image_alt) {
      return NextResponse.json({ error: 'Image alt text is required for accessibility' }, { status: 400 });
    }

    const db = getDb();

    if (id) {
      db.prepare(`
        UPDATE homepage_slides
        SET title = ?,
            caption = ?,
            image_url = ?,
            image_alt = ?,
            activity_date = ?,
            activity_location = ?,
            link_url = ?,
            link_text = ?,
            focal_point = ?,
            display_order = ?,
            is_enabled = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        title,
        caption,
        image_url,
        image_alt,
        activity_date,
        activity_location,
        link_url,
        link_text,
        focal_point,
        display_order,
        is_enabled,
        id
      );

      return NextResponse.json({ success: true });
    } else {
      const res = db.prepare(`
        INSERT INTO homepage_slides (
          title, caption, image_url, image_alt, activity_date, activity_location,
          link_url, link_text, focal_point, display_order, is_enabled, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        title,
        caption,
        image_url,
        image_alt,
        activity_date,
        activity_location,
        link_url,
        link_text,
        focal_point,
        display_order,
        is_enabled
      );

      return NextResponse.json({ success: true, id: Number(res.lastInsertRowid) });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save slide' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, is_enabled, display_order } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing slide ID' }, { status: 400 });
    }

    const db = getDb();

    if (typeof is_enabled !== 'undefined') {
      db.prepare(`
        UPDATE homepage_slides
        SET is_enabled = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(is_enabled ? 1 : 0, id);
    }

    if (typeof display_order !== 'undefined') {
      db.prepare(`
        UPDATE homepage_slides
        SET display_order = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(display_order, id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update slide' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing slide ID' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`DELETE FROM homepage_slides WHERE id = ?`).run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete slide' }, { status: 500 });
  }
}
