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
  const args = process.argv.slice(2);
  let username = args.find(a => a.startsWith('--username='))?.split('=')[1] || process.env.ADMIN_BOOTSTRAP_USER;
  let email = args.find(a => a.startsWith('--email='))?.split('=')[1] || process.env.ADMIN_BOOTSTRAP_EMAIL;
  let password = args.find(a => a.startsWith('--password='))?.split('=')[1] || process.env.ADMIN_BOOTSTRAP_PASSWORD;

  // If interactive terminal and missing fields, prompt securely
  if (process.stdin.isTTY && (!username || !password)) {
    const rl = readline.createInterface({ input, output });
    try {
      if (!username) {
        username = (await rl.question('Enter admin username: ')).trim();
      }
      if (!email) {
        email = (await rl.question('Enter admin email (e.g. admin@tefpc.or.tz): ')).trim();
      }
      if (!password) {
        password = (await rl.question('Enter secure password (min 10 characters): ')).trim();
      }
    } finally {
      rl.close();
    }
  }

  if (!username) {
    console.error('❌ Error: Admin username is required. Run interactively or supply --username=...');
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long.');
    process.exit(1);
  }
  if (!email) {
    email = 'admin@tefpc.or.tz';
  }

  console.log('🔒 Configuring administrator credentials...');
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
  console.log(`Account:  ${username}`);
  console.log(`Email:    ${email}`);
  console.log('Password: [SECURELY HASHED & CONFIGURED — NOT PRINTED]');
  console.log('--------------------------------------------------');
}

main().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
