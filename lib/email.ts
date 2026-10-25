import nodemailer from 'nodemailer';
import { getDb } from './db';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  emailType: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  emailType,
}: SendMailOptions): Promise<{
  success: boolean;
  mode: 'sent_smtp' | 'captured_local' | 'failed';
  error?: string;
  retries?: number;
}> {
  const db = getDb();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpFrom = process.env.SMTP_FROM || 'TEFPC Notifications <noreply@localhost>';

  const isSmtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Refusal to silently use local email capture in production
  if (!isSmtpConfigured) {
    if (isProduction) {
      const errorMsg = 'SMTP credentials unconfigured in production environment. Silent local capture is refused in production.';
      console.error(`[CRITICAL EMAIL FAILURE] ${errorMsg} (Recipient: ${to}, Type: ${emailType})`);
      try {
        const stmt = db.prepare(`
          INSERT INTO email_logs (recipient_email, subject, html_body, text_body, email_type, delivery_status, error_message, created_at)
          VALUES (?, ?, ?, ?, ?, 'failed', ?, datetime('now'))
        `);
        stmt.run(to, subject, html, text, emailType, errorMsg);
      } catch (logErr) {
        console.error('Failed to write failure log:', logErr);
      }
      return { success: false, mode: 'failed', error: errorMsg };
    }

    // Development / test local capture sandbox
    try {
      const stmt = db.prepare(`
        INSERT INTO email_logs (recipient_email, subject, html_body, text_body, email_type, delivery_status, created_at)
        VALUES (?, ?, ?, ?, ?, 'captured_local', datetime('now'))
      `);
      stmt.run(to, subject, html, text, emailType);
      return { success: true, mode: 'captured_local' };
    } catch (err: unknown) {
      console.error('Failed to log email locally:', err);
      return { success: false, mode: 'failed', error: (err as Error).message };
    }
  }

  // 2. Real SMTP dispatch with recipient-level retry
  const maxRetries = 2;
  let lastError: Error | null = null;
  let retriesAttempted = 0;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // Fail fast on socket timeouts during retries
    connectionTimeout: 8000,
  });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        retriesAttempted++;
        // Short exponential backoff: 300ms, 600ms
        await new Promise((res) => setTimeout(res, attempt * 300));
      }

      await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        text,
        html,
      });

      const stmt = db.prepare(`
        INSERT INTO email_logs (recipient_email, subject, html_body, text_body, email_type, delivery_status, created_at)
        VALUES (?, ?, ?, ?, ?, 'sent_smtp', datetime('now'))
      `);
      stmt.run(to, subject, html, text, emailType);
      return { success: true, mode: 'sent_smtp', retries: retriesAttempted };
    } catch (err: unknown) {
      lastError = err as Error;
      console.warn(`SMTP delivery attempt ${attempt + 1} to ${to} failed: ${lastError.message}`);
    }
  }

  // All retries exhausted
  const failureMsg = lastError ? lastError.message : 'SMTP delivery failure after retries';
  try {
    const stmt = db.prepare(`
      INSERT INTO email_logs (recipient_email, subject, html_body, text_body, email_type, delivery_status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, 'failed', ?, datetime('now'))
    `);
    stmt.run(to, subject, html, text, emailType, failureMsg);
  } catch (logErr) {
    console.error('Failed to write failure log:', logErr);
  }

  return { success: false, mode: 'failed', error: failureMsg, retries: retriesAttempted };
}
