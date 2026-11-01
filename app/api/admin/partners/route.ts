import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getAllPartnersAdmin, getPartnerBySlug } from '@/lib/data';
import { isValidSlug, isReservedSlug } from '@/lib/sanitize';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const partners = getAllPartnersAdmin();
  return NextResponse.json({ partners });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;
    const name = (body.name || '').trim();
    const rawSlug = (body.slug || '').trim().toLowerCase();
    const logo_url = (body.logo_url || '').trim();
    const logo_alt = (body.logo_alt || '').trim();
    const website_url = (body.website_url || '').trim();
    const relationship_description = (body.relationship_description || '').trim();
    const relationship_type = (body.relationship_type || 'Institutional Partner').trim();
    const related_project_ids_json = Array.isArray(body.related_project_ids)
      ? JSON.stringify(body.related_project_ids)
      : typeof body.related_project_ids_json === 'string'
      ? body.related_project_ids_json
      : '[]';
    const display_order = typeof body.display_order === 'number' ? body.display_order : 0;
    const is_featured_homepage = body.is_featured_homepage ? 1 : 0;
    const status = body.status === 'published' ? 'published' : 'draft';

    if (!name) {
      return NextResponse.json({ error: 'Partner organization name is required' }, { status: 400 });
    }

    let slug = rawSlug;
    if (!slug) {
      slug = name
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
      .prepare(`SELECT id FROM partners WHERE slug = ? AND (? IS NULL OR id != ?)`)
      .get(slug, id, id);
    if (existing) {
      return NextResponse.json(
        { error: `A partner with slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    if (id) {
      db.prepare(`
        UPDATE partners
        SET name = ?,
            slug = ?,
            logo_url = ?,
            logo_alt = ?,
            website_url = ?,
            relationship_description = ?,
            relationship_type = ?,
            related_project_ids_json = ?,
            display_order = ?,
            is_featured_homepage = ?,
            status = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        name,
        slug,
        logo_url,
        logo_alt,
        website_url,
        relationship_description,
        relationship_type,
        related_project_ids_json,
        display_order,
        is_featured_homepage,
        status,
        id
      );

      const updated = getPartnerBySlug(slug, true);
      return NextResponse.json({ success: true, partner: updated });
    } else {
      const res = db.prepare(`
        INSERT INTO partners (
          name, slug, logo_url, logo_alt, website_url, relationship_description,
          relationship_type, related_project_ids_json, display_order, is_featured_homepage,
          status, is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(
        name,
        slug,
        logo_url,
        logo_alt,
        website_url,
        relationship_description,
        relationship_type,
        related_project_ids_json,
        display_order,
        is_featured_homepage,
        status
      );

      const newId = Number(res.lastInsertRowid);
      const created = db.prepare(`SELECT * FROM partners WHERE id = ?`).get(newId);
      return NextResponse.json({ success: true, partner: created });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save partner' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing partner ID' }, { status: 400 });
    }

    const db = getDb();
    if (action === 'publish') {
      db.prepare(`UPDATE partners SET status = 'published', updated_at = datetime('now') WHERE id = ?`).run(id);
    } else if (action === 'unpublish') {
      db.prepare(`UPDATE partners SET status = 'draft', updated_at = datetime('now') WHERE id = ?`).run(id);
    } else if (action === 'toggle_homepage') {
      db.prepare(`UPDATE partners SET is_featured_homepage = CASE WHEN is_featured_homepage = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?`).run(id);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update partner status' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing partner ID' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`DELETE FROM partners WHERE id = ?`).run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete partner' }, { status: 500 });
  }
}
