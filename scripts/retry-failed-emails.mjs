import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { sendEmail } from '../lib/email.ts';

const DB_PATH = process.env.DATABASE_PATH || './data/economist.db';
if (!fs.existsSync(path.resolve(DB_PATH))) {
  console.log('No database found at:', DB_PATH);
  process.exit(0);
}

const db = new DatabaseSync(path.resolve(DB_PATH));
db.exec('PRAGMA foreign_keys = ON;');

async function main() {
  console.log('📬 Checking for pending/failed emails to retry...');

  const failedEmails = db.prepare(`
    SELECT id, recipient_email, subject, html_body, text_body, email_type, error_message, created_at
    FROM email_logs
    WHERE delivery_status = 'failed'
    ORDER BY id ASC
    LIMIT 50
  `).all() as unknown as {
    id: number;
    recipient_email: string;
    subject: string;
    html_body: string;
    text_body: string;
    email_type: string;
    error_message: string;
    created_at: string;
  }[];

  if (failedEmails.length === 0) {
    console.log('✅ No failed emails pending retry.');
    return;
  }

  console.log(`Found ${failedEmails.length} failed email(s) to process.`);
  let successCount = 0;
  let failCount = 0;

  for (const item of failedEmails) {
    console.log(`Retrying dispatch to ${item.recipient_email} [Subject: "${item.subject}"]...`);
    const result = await sendEmail({
      to: item.recipient_email,
      subject: item.subject,
      html: item.html_body,
      text: item.text_body,
      emailType: item.email_type,
    });

    if (result.success) {
      successCount++;
      db.prepare(`
        UPDATE email_logs
        SET delivery_status = ?, error_message = ''
        WHERE id = ?
      `).run(result.mode, item.id);
      console.log(`  -> Dispatched successfully (${result.mode})`);
    } else {
      failCount++;
      db.prepare(`
        UPDATE email_logs
        SET error_message = ?
        WHERE id = ?
      `).run(result.error || 'Retry attempt failed', item.id);
      console.log(`  -> Retry failed: ${result.error}`);
    }
  }

  console.log('--------------------------------------------------');
  console.log(`Summary: ${successCount} retried successfully, ${failCount} failed.`);
  console.log('--------------------------------------------------');
}

main().catch((err) => {
  console.error('Email retry script error:', err);
  process.exit(1);
});
