import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/booking';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD
  const durationParam = searchParams.get('duration'); // in minutes

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: 'Valid date (YYYY-MM-DD) is required.' }, { status: 400 });
  }

  const duration = parseInt(durationParam || '45', 10);
  if (isNaN(duration) || duration <= 0) {
    return NextResponse.json({ error: 'Valid duration in minutes is required.' }, { status: 400 });
  }

  try {
    const slots = getAvailableSlots(dateStr, duration);
    return NextResponse.json({
      date: dateStr,
      duration,
      slots,
      timezone: 'Africa/Dar_es_Salaam (EAT, UTC+3)',
    });
  } catch (err: unknown) {
    console.error('Error fetching slots:', err);
    return NextResponse.json({ error: 'Failed to compute availability slots.' }, { status: 500 });
  }
}
