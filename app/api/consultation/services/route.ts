import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/data';

export async function GET() {
  const db = getDb();
  const settings = getSiteSettings();

  const services = db.prepare(`
    SELECT * FROM consultation_services
    WHERE is_active = 1
    ORDER BY order_index ASC, id ASC
  `).all();

  return NextResponse.json({
    services,
    settings: {
      office_address: settings.office_address,
      office_instructions: settings.office_instructions,
      online_instructions: settings.online_instructions,
      payment_instructions: settings.payment_instructions,
      timezone: 'Africa/Dar_es_Salaam (EAT, UTC+3)',
    },
  });
}
