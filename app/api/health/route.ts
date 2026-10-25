import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    // Quick connectivity query
    const check = db.prepare('SELECT 1 as healthy').get() as { healthy: number } | undefined;

    if (!check || check.healthy !== 1) {
      return NextResponse.json(
        { status: 'degraded', timestamp: new Date().toISOString() },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'ok',
        uptime_seconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
