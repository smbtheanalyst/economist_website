import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './data/uploads';
const BACKUP_ROOT = process.env.BACKUP_DIR || './backups';

if (!fs.existsSync(BACKUP_ROOT)) {
  fs.mkdirSync(BACKUP_ROOT, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const targetBackupDir = path.join(BACKUP_ROOT, `backup_${timestamp}`);
fs.mkdirSync(targetBackupDir, { recursive: true });

console.log('📦 Starting full application backup (SQLite database + uploads)...');

// 1. Atomic SQLite Snapshot via VACUUM INTO
const dbBackupPath = path.join(targetBackupDir, 'economist.db');
const db = new DatabaseSync(path.resolve(DB_PATH));
try {
  db.exec(`VACUUM INTO '${dbBackupPath.replace(/'/g, "''")}';`);
  const dbStats = fs.statSync(dbBackupPath);
  console.log(`✅ SQLite snapshot saved: ${dbBackupPath} (${(dbStats.size / 1024).toFixed(2)} KB)`);
} catch (err) {
  console.error('❌ Database snapshot failed:', err);
  process.exit(1);
}

// 2. Backup Uploaded Files
const targetUploadsDir = path.join(targetBackupDir, 'uploads');
fs.mkdirSync(targetUploadsDir, { recursive: true });
let uploadCount = 0;
let totalUploadBytes = 0;

const sourceUploads = path.resolve(UPLOAD_DIR);
if (fs.existsSync(sourceUploads)) {
  const files = fs.readdirSync(sourceUploads);
  for (const f of files) {
    if (f === '.gitkeep') continue;
    const src = path.join(sourceUploads, f);
    const dest = path.join(targetUploadsDir, f);
    const stat = fs.statSync(src);
    if (stat.isFile()) {
      fs.copyFileSync(src, dest);
      uploadCount++;
      totalUploadBytes += stat.size;
    }
  }
}
console.log(`✅ Uploads copied: ${uploadCount} file(s) (${(totalUploadBytes / 1024).toFixed(2)} KB)`);

// 3. Backup Manifest
const manifest = {
  timestamp: new Date().toISOString(),
  db_source: DB_PATH,
  upload_source: UPLOAD_DIR,
  db_file: 'economist.db',
  uploads_dir: 'uploads',
  upload_count: uploadCount,
};
fs.writeFileSync(path.join(targetBackupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('--------------------------------------------------');
console.log(`🎉 Complete backup archived to: ${targetBackupDir}`);
console.log('--------------------------------------------------');
