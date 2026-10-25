import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { checkRateLimit } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { getSiteSettings } from '@/lib/data';

const AskSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').max(120, 'Email cannot exceed 120 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000, 'Message cannot exceed 3000 characters'),
  website_hp: z.string().optional(), // Honeypot spam trap
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Rate limit: max 5 questions per hour per IP
    const rateCheck = checkRateLimit(`ask_${ip}`, 5, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'You have submitted several inquiries recently. Please wait before submitting another question.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = AskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid form input' },
        { status: 400 }
      );
    }

    // Honeypot check - bots fill hidden website_hp
    if (parsed.data.website_hp && parsed.data.website_hp.trim() !== '') {
      // Silently accept without saving spam
      return NextResponse.json({
        success: true,
        message: 'Your question has been received. Thank you.',
        emailDeliveryStatus: 'ignored_spam',
      });
    }

    const db = getDb();
    const settings = getSiteSettings();

    // 1. Store securely in questions table first
    const stmt = db.prepare(`
      INSERT INTO questions (name, email, message, status, ip_hash, email_delivery_status, created_at, updated_at)
      VALUES (?, ?, ?, 'new', ?, 'pending', datetime('now'), datetime('now'))
    `);
    const insertResult = stmt.run(parsed.data.name, parsed.data.email, parsed.data.message, ip);
    const questionId = insertResult.lastInsertRowid;

    // 2. Dispatch notifications (Local capture or SMTP)
    let emailStatus = 'captured_local';
    try {
      // Send acknowledgement to visitor
      const visitorEmailResult = await sendEmail({
        to: parsed.data.email,
        subject: `Inquiry Received - ${settings.researcher_name}`,
        emailType: 'question_ack',
        text: `Dear ${parsed.data.name},\n\nThank you for reaching out with your question regarding economic research in Tanzania.\n\nYour message has been received by ${settings.researcher_name}'s office. Inquiries are reviewed and answered subject to scholarly and advisory schedules.\n\nPlease note: An inquiry does not guarantee an immediate or detailed consultation. If your inquiry requires in-depth methodology review, institutional policy advisory, or PhD thesis guidance, please consider booking a formal consultation at: ${process.env.SITE_URL || 'http://localhost:3000'}/consultation.\n\nSummary of your submitted inquiry:\n"${parsed.data.message}"\n\nSincerely,\nOffice of ${settings.researcher_name}\nDar es Salaam, Tanzania`,
        html: `<div style="font-family: Georgia, serif; max-width: 600px; color: #192B2A; line-height: 1.6;">
          <h2 style="color: #285748; font-size: 20px;">Inquiry Received</h2>
          <p>Dear ${parsed.data.name},</p>
          <p>Thank you for reaching out with your question regarding economic research in Tanzania.</p>
          <p>Your message has been securely recorded by <strong>${settings.researcher_name}</strong>'s office. Inquiries are reviewed and answered subject to ongoing research commitments.</p>
          <div style="background-color: #E9EDE4; border-left: 3px solid #285748; padding: 12px; margin: 16px 0; font-size: 13px;">
            <em>"${parsed.data.message}"</em>
          </div>
          <p style="font-size: 13px; color: #52605A;">
            <strong>Important note:</strong> Submitting a question does not guarantee a free detailed consultation. If you require dedicated structured advisory, please book an appointment via our website.
          </p>
          <p>Sincerely,<br/>Office of ${settings.researcher_name}<br/>Dar es Salaam, Tanzania</p>
        </div>`,
      });

      emailStatus = visitorEmailResult.mode;
    } catch (mailErr) {
      console.error('Email notification failure for question:', mailErr);
      emailStatus = 'failed';
    }

    // Update delivery status on question record
    db.prepare(`UPDATE questions SET email_delivery_status = ? WHERE id = ?`).run(emailStatus, questionId);

    return NextResponse.json({
      success: true,
      message: 'Your question has been securely recorded. An acknowledgement has been prepared.',
      emailDeliveryStatus: emailStatus,
      disclaimer: 'Note: Inquiries are answered subject to availability and do not constitute a guaranteed free consultation.',
    });
  } catch (err: unknown) {
    console.error('Ask API error:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
