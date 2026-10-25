import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { action } = await req.json();

    if (action === 'seed') {
      await execAsync('node scripts/seed.mjs');
      return NextResponse.json({ success: true, message: 'Demonstration content seeded successfully.' });
    } else if (action === 'clear') {
      await execAsync('node scripts/clear-demo.mjs');
      return NextResponse.json({ success: true, message: 'Demonstration content cleared successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Demo data action error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
