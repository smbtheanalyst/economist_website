import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/data';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = getSiteSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const db = getDb();

    db.prepare(`
      UPDATE site_settings
      SET
        researcher_name = ?,
        professional_title = ?,
        portrait_url = ?,
        biography = ?,
        qualifications_json = ?,
        research_interests_json = ?,
        affiliations_json = ?,
        cv_url = ?,
        hero_headline = ?,
        hero_intro = ?,
        contact_email = ?,
        office_address = ?,
        office_instructions = ?,
        online_instructions = ?,
        payment_instructions = ?,
        social_links_json = ?,
        updated_at = datetime('now')
      WHERE id = 1
    `).run(
      body.researcher_name?.trim() || 'Dr. Researcher',
      body.professional_title?.trim() || '',
      body.portrait_url?.trim() || '',
      body.biography?.trim() || '',
      typeof body.qualifications_json === 'string' ? body.qualifications_json : JSON.stringify(body.qualifications_json || []),
      typeof body.research_interests_json === 'string' ? body.research_interests_json : JSON.stringify(body.research_interests_json || []),
      typeof body.affiliations_json === 'string' ? body.affiliations_json : JSON.stringify(body.affiliations_json || []),
      body.cv_url?.trim() || '',
      body.hero_headline?.trim() || '',
      body.hero_intro?.trim() || '',
      body.contact_email?.trim() || '',
      body.office_address?.trim() || '',
      body.office_instructions?.trim() || '',
      body.online_instructions?.trim() || '',
      body.payment_instructions?.trim() || '',
      typeof body.social_links_json === 'string' ? body.social_links_json : JSON.stringify(body.social_links_json || [])
    );

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err: unknown) {
    console.error('Save profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile settings.' }, { status: 500 });
  }
}
