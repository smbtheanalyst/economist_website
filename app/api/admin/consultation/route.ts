import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const services = db.prepare(`SELECT * FROM consultation_services ORDER BY order_index ASC, id ASC`).all();
  const availabilityRules = db.prepare(`SELECT * FROM availability_rules ORDER BY day_of_week ASC`).all();
  const blockedDates = db.prepare(`SELECT * FROM blocked_dates ORDER BY date_str ASC`).all();

  return NextResponse.json({
    services,
    availabilityRules,
    blockedDates,
  });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const db = getDb();
    const entity = body.entity; // 'service' | 'availability' | 'blocked_date'

    if (entity === 'service') {
      const name = body.name?.trim();
      let slug = body.slug?.trim() || name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const isPaid = body.is_paid ? 1 : 0;
      const priceAmount = parseFloat(body.price_amount || '0');
      const currency = body.currency || 'USD';
      const durationMinutes = parseInt(body.duration_minutes || '45', 10);
      const format = body.format || 'both';
      const description = body.description?.trim() || '';
      const prepInstructions = body.prep_instructions?.trim() || '';
      const isActive = body.is_active === false ? 0 : 1;
      const orderIndex = parseInt(body.order_index || '0', 10);

      if (!name || !slug) return NextResponse.json({ error: 'Service name and slug are required' }, { status: 400 });

      if (body.id) {
        db.prepare(`
          UPDATE consultation_services
          SET name = ?, slug = ?, is_paid = ?, price_amount = ?, currency = ?,
              duration_minutes = ?, format = ?, description = ?, prep_instructions = ?,
              is_active = ?, order_index = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(name, slug, isPaid, priceAmount, currency, durationMinutes, format, description, prepInstructions, isActive, orderIndex, body.id);
        return NextResponse.json({ success: true, message: 'Service updated.' });
      } else {
        const res = db.prepare(`
          INSERT INTO consultation_services (name, slug, is_paid, price_amount, currency, duration_minutes, format, description, prep_instructions, is_active, order_index, is_demo, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
        `).run(name, slug, isPaid, priceAmount, currency, durationMinutes, format, description, prepInstructions, isActive, orderIndex);
        return NextResponse.json({ success: true, id: res.lastInsertRowid, message: 'Service created.' });
      }
    } else if (entity === 'availability') {
      const rules = body.rules as { day_of_week: number; start_time: string; end_time: string; is_active: number }[];
      if (!Array.isArray(rules)) return NextResponse.json({ error: 'Rules array required' }, { status: 400 });

      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare(`DELETE FROM availability_rules`).run();
        const insert = db.prepare(`
          INSERT INTO availability_rules (day_of_week, start_time, end_time, is_active)
          VALUES (?, ?, ?, ?)
        `);
        for (const r of rules) {
          insert.run(r.day_of_week, r.start_time, r.end_time, r.is_active ? 1 : 0);
        }
        db.exec('COMMIT');
        return NextResponse.json({ success: true, message: 'Availability rules saved.' });
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    } else if (entity === 'blocked_date') {
      const dateStr = body.date_str?.trim();
      const reason = body.reason?.trim() || 'Blocked';
      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return NextResponse.json({ error: 'Valid date (YYYY-MM-DD) is required.' }, { status: 400 });
      }

      db.prepare(`
        INSERT INTO blocked_dates (date_str, reason)
        VALUES (?, ?)
        ON CONFLICT(date_str) DO UPDATE SET reason = excluded.reason
      `).run(dateStr, reason);

      return NextResponse.json({ success: true, message: 'Date blocked.' });
    }

    return NextResponse.json({ error: 'Unknown entity type' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Consultation settings error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entity = searchParams.get('entity');
  const id = searchParams.get('id');

  const db = getDb();
  if (entity === 'service' && id) {
    db.prepare(`DELETE FROM consultation_services WHERE id = ?`).run(id);
    return NextResponse.json({ success: true, message: 'Service deleted.' });
  } else if (entity === 'blocked_date' && id) {
    db.prepare(`DELETE FROM blocked_dates WHERE id = ?`).run(id);
    return NextResponse.json({ success: true, message: 'Blocked date removed.' });
  }

  return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
}
