import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './data/uploads';

const args = process.argv.slice(2);
const backupArg = args[0];

if (!backupArg) {
  console.error('❌ Error: Backup source directory or file required.');
  console.log('Usage: node scripts/restore.mjs <path/to/backup_directory_or_db_file>');
  process.exit(1);
}

const backupPath = path.resolve(backupArg);
if (!fs.existsSync(backupPath)) {
  console.error(`❌ Error: Backup path does not exist: ${backupPath}`);
  process.exit(1);
}

console.log('🔄 Starting restoration from:', backupPath);

let dbSourceFile = '';
let uploadsSourceDir = '';

const stat = fs.statSync(backupPath);
if (stat.isDirectory()) {
  dbSourceFile = path.join(backupPath, 'economist.db');
  uploadsSourceDir = path.join(backupPath, 'uploads');
} else if (stat.isFile()) {
  dbSourceFile = backupPath;
}

// 1. Restore Database
if (fs.existsSync(dbSourceFile)) {
  const targetDbDir = path.dirname(path.resolve(DB_PATH));
  if (!fs.existsSync(targetDbDir)) {
    fs.mkdirSync(targetDbDir, { recursive: true });
  }

  // Remove existing WAL / SHM files if replacing database
  const targetDbPath = path.resolve(DB_PATH);
  const walPath = `${targetDbPath}-wal`;
  const shmPath = `${targetDbPath}-shm`;
  try { if (fs.existsSync(walPath)) fs.unlinkSync(walPath); } catch (e) {}
  try { if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath); } catch (e) {}

  fs.copyFileSync(dbSourceFile, targetDbPath);
  console.log(`✅ Database restored to: ${targetDbPath}`);

  // Integrity check
  try {
    const db = new DatabaseSync(targetDbPath);
    const check = db.prepare('PRAGMA integrity_check;').get() as { integrity_check?: string };
    console.log(`✅ SQLite integrity verification: ${check?.integrity_check || 'ok'}`);
  } catch (dbErr) {
    console.error('⚠️  Warning during integrity check:', dbErr);
  }
} else {
  console.error(`❌ Could not locate database file in backup: ${dbSourceFile}`);
  process.exit(1);
}

// 2. Restore Uploads
if (uploadsSourceDir && fs.existsSync(uploadsSourceDir)) {
  const targetUploadDir = path.resolve(UPLOAD_DIR);
  if (!fs.existsSync(targetUploadDir)) {
    fs.mkdirSync(targetUploadDir, { recursive: true });
  }

  const files = fs.readdirSync(uploadsSourceDir);
  let restoredCount = 0;
  for (const f of files) {
    const src = path.join(uploadsSourceDir, f);
    const dest = path.join(targetUploadDir, f);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
      restoredCount++;
    }
  }
  console.log(`✅ Restored ${restoredCount} upload file(s) to: ${targetUploadDir}`);
}

console.log('--------------------------------------------------');
console.log('🎉 Restoration completed successfully.');
console.log('--------------------------------------------------');
