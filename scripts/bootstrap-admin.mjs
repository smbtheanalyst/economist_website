import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
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

// Ensure table exists even if bootstrap runs before server startup
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  );
`);

async function main() {
  console.log('==================================================');
  console.log('🔐 TEFPC Interactive Admin Account Bootstrap');
  console.log(`📍 Target Database: ${path.resolve(DB_PATH)}`);
  console.log('==================================================');

  const rl = readline.createInterface({ input, output });
  let username = '';
  let email = '';
  let password = '';

  try {
    username = (await rl.question('Enter admin username (e.g. simba_admin): ')).trim();
    while (!username) {
      console.log('Admin username is required.');
      username = (await rl.question('Enter admin username: ')).trim();
    }

    email = (await rl.question('Enter admin notification email (e.g. admin@tefpc.or.tz): ')).trim();
    if (!email) {
      email = 'admin@tefpc.or.tz';
    }

    password = (await rl.question('Enter secure admin password (min 10 characters): ')).trim();
    while (!password || password.length < 10) {
      console.log('Password must be at least 10 characters long for production security.');
      password = (await rl.question('Enter secure admin password (min 10 characters): ')).trim();
    }
  } finally {
    rl.close();
  }

  console.log('\n🔒 Hashing password with bcrypt (12 rounds)...');
  const saltRounds = 12;
  const passwordHash = bcrypt.hashSync(password, saltRounds);

  const existing = db.prepare(`SELECT id, username FROM admin_users WHERE username = ?`).get(username);

  if (existing) {
    db.prepare(`
      UPDATE admin_users
      SET password_hash = ?, email = ?
      WHERE username = ?
    `).run(passwordHash, email, username);
    console.log(`✅ Admin account "${username}" updated successfully.`);
  } else {
    db.prepare(`
      INSERT INTO admin_users (username, email, password_hash, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(username, email, passwordHash);
    console.log(`✅ Admin account "${username}" created successfully.`);
  }

  console.log('--------------------------------------------------');
  console.log(`Username: ${username}`);
  console.log(`Email:    ${email}`);
  console.log('Password: [SECURELY CONFIGURED — NOT LOGGED OR PRINTED]');
  console.log('--------------------------------------------------');
}

main().catch((err) => {
  console.error('\n❌ Admin bootstrap failed:', err);
  process.exit(1);
});
