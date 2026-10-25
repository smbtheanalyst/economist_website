import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';
const dbDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(path.resolve(DB_PATH));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Parse args or env
const args = process.argv.slice(2);
const usernameArg = args.find(a => a.startsWith('--username='))?.split('=')[1];
const passwordArg = args.find(a => a.startsWith('--password='))?.split('=')[1];
const emailArg = args.find(a => a.startsWith('--email='))?.split('=')[1];

const username = usernameArg || process.env.ADMIN_BOOTSTRAP_USER || 'admin';
const email = emailArg || process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@economist.tz';
const password = passwordArg || process.env.ADMIN_BOOTSTRAP_PASSWORD || crypto.randomBytes(12).toString('base64url');

console.log('🔒 Bootstrapping admin user...');

const saltRounds = 12;
const passwordHash = bcrypt.hashSync(password, saltRounds);

const existing = db.prepare(`SELECT id, username FROM admin_users WHERE username = ?`).get(username);

if (existing) {
  db.prepare(`
    UPDATE admin_users
    SET password_hash = ?, email = ?
    WHERE username = ?
  `).run(passwordHash, email, username);
  console.log(`✅ Admin user "${username}" updated successfully.`);
} else {
  db.prepare(`
    INSERT INTO admin_users (username, email, password_hash, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(username, email, passwordHash);
  console.log(`✅ Admin user "${username}" created successfully.`);
}

console.log('--------------------------------------------------');
console.log(`Username: ${username}`);
console.log(`Email:    ${email}`);
if (!passwordArg && !process.env.ADMIN_BOOTSTRAP_PASSWORD) {
  console.log(`Generated Password: ${password}`);
  console.log('⚠️  Please save this password securely now! It will not be shown again.');
} else {
  console.log('Password: [Provided via arguments or environment]');
}
console.log('--------------------------------------------------');
