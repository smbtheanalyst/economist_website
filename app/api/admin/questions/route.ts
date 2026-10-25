import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const db = getDb();
  let query = `SELECT * FROM questions`;
  const params: string[] = [];

  if (status && status !== 'all') {
    query += ` WHERE status = ?`;
    params.push(status);
  }

  query += ` ORDER BY datetime(created_at) DESC`;

  const questions = db.prepare(query).all(...params);
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, status, admin_notes } = await req.json();
    if (!id) return NextResponse.json({ error: 'Question ID required' }, { status: 400 });

    const db = getDb();
    db.prepare(`
      UPDATE questions
      SET status = coalesce(?, status),
          admin_notes = coalesce(?, admin_notes),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status, admin_notes, id);

    return NextResponse.json({ success: true, message: 'Question updated.' });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const db = getDb();
  db.prepare(`DELETE FROM questions WHERE id = ?`).run(id);
  return NextResponse.json({ success: true, message: 'Question deleted.' });
}
