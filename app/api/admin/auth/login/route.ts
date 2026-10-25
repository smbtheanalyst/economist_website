import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createSession, checkRateLimit } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Strict login rate limit: max 5 failed attempts per 15 minutes
    const rate = checkRateLimit(`login_${ip}`, 10, 900);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare(`SELECT * FROM admin_users WHERE username = ?`).get(username.trim()) as {
      id: number;
      username: string;
      email: string;
      password_hash: string;
    } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    // Create session cookie
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      admin: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error during authentication.' }, { status: 500 });
  }
}
