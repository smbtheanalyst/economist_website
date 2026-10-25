import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb } from './db';

const SESSION_COOKIE_NAME = 'econ_admin_session';
const SESSION_TTL_DAYS = 7;

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login_at: string | null;
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

export async function createSession(adminId: number): Promise<string> {
  const db = getDb();
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const stmt = db.prepare(`
    INSERT INTO admin_sessions (token, admin_id, expires_at)
    VALUES (?, ?, ?)
  `);
  stmt.run(token, adminId, expiresAt);

  // Update last login
  db.prepare(`UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?`).run(adminId);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const db = getDb();
    db.prepare(`DELETE FROM admin_sessions WHERE token = ?`).run(token);
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const db = getDb();
  const row = db.prepare(`
    SELECT u.id, u.username, u.email, u.created_at, u.last_login_at
    FROM admin_sessions s
    JOIN admin_users u ON s.admin_id = u.id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
  `).get(token) as (AdminUser | undefined);

  if (!row) return null;
  return row;
}

export function checkRateLimit(key: string, limit = 5, windowSeconds = 60): { allowed: boolean; remaining: number } {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  // Clean expired
  db.prepare(`DELETE FROM rate_limits WHERE expires_at < ?`).run(now);

  const record = db.prepare(`SELECT count, expires_at FROM rate_limits WHERE key = ?`).get(key) as { count: number; expires_at: number } | undefined;

  if (!record) {
    db.prepare(`INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)`).run(key, now + windowSeconds);
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  db.prepare(`UPDATE rate_limits SET count = count + 1 WHERE key = ?`).run(key);
  return { allowed: true, remaining: limit - (record.count + 1) };
}
