import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';
const backupDir = path.resolve('./backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `economist_backup_${timestamp}.db`);

console.log('📦 Starting atomic database backup...');
const db = new DatabaseSync(path.resolve(DB_PATH));

// Safe atomic snapshot via SQLite VACUUM INTO
try {
  db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}';`);
  const stats = fs.statSync(backupPath);
  console.log(`✅ Atomic snapshot created successfully:`);
  console.log(`   Path: ${backupPath}`);
  console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
} catch (err) {
  console.error('Backup failed:', err);
  process.exit(1);
}
