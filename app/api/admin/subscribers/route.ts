import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const subscribers = db.prepare(`SELECT * FROM subscribers ORDER BY datetime(created_at) DESC`).all();
  return NextResponse.json({ subscribers });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, action } = await req.json();
    const db = getDb();

    if (action === 'unsubscribe') {
      db.prepare(`UPDATE subscribers SET status = 'unsubscribed', updated_at = datetime('now') WHERE id = ?`).run(id);
      return NextResponse.json({ success: true, message: 'Subscriber unsubscribed.' });
    } else if (action === 'delete') {
      db.prepare(`DELETE FROM subscribers WHERE id = ?`).run(id);
      return NextResponse.json({ success: true, message: 'Subscriber removed.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
