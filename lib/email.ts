import nodemailer from 'nodemailer';
import { getDb } from './db';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  emailType: string;
}

export async function sendEmail({ to, subject, html, text, emailType }: SendMailOptions): Promise<{ success: boolean; mode: 'sent_smtp' | 'captured_local' | 'failed'; error?: string }> {
  const db = getDb();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpFrom = process.env.SMTP_FROM || 'Dr. Researcher <noreply@example.com>';

  const isSmtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

  if (!isSmtpConfigured) {
    // Local capture mode
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

  // Attempt real SMTP dispatch
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

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
    return { success: true, mode: 'sent_smtp' };
  } catch (err: unknown) {
    const errorMsg = (err as Error).message || 'SMTP delivery failure';
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
}
