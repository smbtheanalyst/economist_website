import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getAllProjectsAdmin, getProjectBySlug, getPublishedResearch, getAllNewsAdmin } from '@/lib/data';
import { sanitizeHtml, isValidSlug, isReservedSlug } from '@/lib/sanitize';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = getAllProjectsAdmin();
  const availableResearch = getPublishedResearch().map((r) => ({ id: r.id, title: r.title, slug: r.slug }));
  const availableNews = getAllNewsAdmin().map((n) => ({ id: n.id, title: n.title, slug: n.slug }));
  return NextResponse.json({ projects, availableResearch, availableNews });
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
    const rawDescription = body.description_html || '';
    const research_theme = (body.research_theme || '').trim();
    const project_status = body.project_status === 'completed' ? 'completed' : 'ongoing';
    const status = body.status === 'published' ? 'published' : 'draft';
    const start_date = (body.start_date || '').trim();
    const end_date = (body.end_date || '').trim();
    const location = (body.location || '').trim();

    const objectives_json = Array.isArray(body.objectives)
      ? JSON.stringify(body.objectives)
      : typeof body.objectives_json === 'string'
      ? body.objectives_json
      : '[]';

    const activities_json = Array.isArray(body.activities)
      ? JSON.stringify(body.activities)
      : typeof body.activities_json === 'string'
      ? body.activities_json
      : '[]';

    const outputs_json = Array.isArray(body.outputs)
      ? JSON.stringify(body.outputs)
      : typeof body.outputs_json === 'string'
      ? body.outputs_json
      : '[]';

    const outcomes_json = Array.isArray(body.outcomes)
      ? JSON.stringify(body.outcomes)
      : typeof body.outcomes_json === 'string'
      ? body.outcomes_json
      : '[]';

    const cover_image_url = (body.cover_image_url || '').trim();
    const cover_image_alt = (body.cover_image_alt || '').trim();

    const gallery_images_json = Array.isArray(body.gallery_images)
      ? JSON.stringify(body.gallery_images)
      : typeof body.gallery_images_json === 'string'
      ? body.gallery_images_json
      : '[]';

    const related_research_ids_json = Array.isArray(body.related_research_ids)
      ? JSON.stringify(body.related_research_ids)
      : typeof body.related_research_ids_json === 'string'
      ? body.related_research_ids_json
      : '[]';

    const related_news_ids_json = Array.isArray(body.related_news_ids)
      ? JSON.stringify(body.related_news_ids)
      : typeof body.related_news_ids_json === 'string'
      ? body.related_news_ids_json
      : '[]';

    const partner_organizations_json = Array.isArray(body.partner_organizations)
      ? JSON.stringify(body.partner_organizations)
      : typeof body.partner_organizations_json === 'string'
      ? body.partner_organizations_json
      : '[]';

    const is_featured = body.is_featured ? 1 : 0;

    if (!title) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 });
    }
    if (!summary) {
      return NextResponse.json({ error: 'Project summary is required' }, { status: 400 });
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
        { error: `The slug "${slug}" is reserved and cannot be used for a project.` },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db
      .prepare(`SELECT id FROM projects WHERE slug = ? AND (? IS NULL OR id != ?)`)
      .get(slug, id, id);
    if (existing) {
      return NextResponse.json(
        { error: `A project with slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    const description_html = sanitizeHtml(rawDescription);

    if (id) {
      db.prepare(`
        UPDATE projects
        SET title = ?,
            slug = ?,
            summary = ?,
            description_html = ?,
            research_theme = ?,
            project_status = ?,
            status = ?,
            start_date = ?,
            end_date = ?,
            location = ?,
            objectives_json = ?,
            activities_json = ?,
            outputs_json = ?,
            outcomes_json = ?,
            cover_image_url = ?,
            cover_image_alt = ?,
            gallery_images_json = ?,
            related_research_ids_json = ?,
            related_news_ids_json = ?,
            partner_organizations_json = ?,
            is_featured = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        title,
        slug,
        summary,
        description_html,
        research_theme,
        project_status,
        status,
        start_date,
        end_date,
        location,
        objectives_json,
        activities_json,
        outputs_json,
        outcomes_json,
        cover_image_url,
        cover_image_alt,
        gallery_images_json,
        related_research_ids_json,
        related_news_ids_json,
        partner_organizations_json,
        is_featured,
        id
      );

      const updated = getProjectBySlug(slug, true);
      return NextResponse.json({ success: true, project: updated });
    } else {
      const res = db.prepare(`
        INSERT INTO projects (
          title, slug, summary, description_html, research_theme, project_status, status,
          start_date, end_date, location, objectives_json, activities_json, outputs_json,
          outcomes_json, cover_image_url, cover_image_alt, gallery_images_json,
          related_research_ids_json, related_news_ids_json, partner_organizations_json,
          is_featured, is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(
        title,
        slug,
        summary,
        description_html,
        research_theme,
        project_status,
        status,
        start_date,
        end_date,
        location,
        objectives_json,
        activities_json,
        outputs_json,
        outcomes_json,
        cover_image_url,
        cover_image_alt,
        gallery_images_json,
        related_research_ids_json,
        related_news_ids_json,
        partner_organizations_json,
        is_featured
      );

      const newId = Number(res.lastInsertRowid);
      const created = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(newId);
      return NextResponse.json({ success: true, project: created });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save project' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const db = getDb();
    if (action === 'publish') {
      db.prepare(`UPDATE projects SET status = 'published', updated_at = datetime('now') WHERE id = ?`).run(id);
    } else if (action === 'unpublish') {
      db.prepare(`UPDATE projects SET status = 'draft', updated_at = datetime('now') WHERE id = ?`).run(id);
    } else if (action === 'toggle_featured') {
      db.prepare(`UPDATE projects SET is_featured = CASE WHEN is_featured = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?`).run(id);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update project status' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`DELETE FROM projects WHERE id = ?`).run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}
