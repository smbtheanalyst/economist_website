import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { checkRateLimit } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { getSiteSettings } from '@/lib/data';

const SubscribeSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address').max(120),
  name: z.string().trim().max(100).optional(),
  consent: z.boolean().refine((val) => val === true, 'Consent is required'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateCheck = checkRateLimit(`sub_${ip}`, 8, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please wait.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = SubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const name = parsed.data.name || '';
    const db = getDb();
    const settings = getSiteSettings();
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

    const existing = db.prepare(`SELECT * FROM subscribers WHERE email = ?`).get(email) as {
      id: number;
      status: string;
      verification_token: string;
      unsubscribe_token: string;
    } | undefined;

    if (existing && existing.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        message: 'This email is already an active confirmed subscriber. Thank you for your continued readership.',
      });
    }

    // Generate secure tokens
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    if (existing) {
      // Refresh pending token
      db.prepare(`
        UPDATE subscribers
        SET name = ?, verification_token = ?, unsubscribe_token = ?, status = 'pending_verification', updated_at = datetime('now')
        WHERE id = ?
      `).run(name, verificationToken, unsubscribeToken, existing.id);
    } else {
      db.prepare(`
        INSERT INTO subscribers (email, name, status, verification_token, unsubscribe_token, created_at, updated_at)
        VALUES (?, ?, 'pending_verification', ?, ?, datetime('now'), datetime('now'))
      `).run(email, name, verificationToken, unsubscribeToken);
    }

    const verifyUrl = `${siteUrl}/subscribe/verify?token=${verificationToken}`;
    const unsubUrl = `${siteUrl}/subscribe/unsubscribe?token=${unsubscribeToken}`;

    // Send Double Opt-in verification email
    await sendEmail({
      to: email,
      subject: `Please Confirm Your Subscription - ${settings.researcher_name}`,
      emailType: 'subscription_verify',
      text: `Dear ${name || 'Reader'},\n\nThank you for requesting to receive publication notifications from Dr. ${settings.researcher_name}.\n\nTo complete your subscription and activate email notifications, please verify your email address by visiting:\n${verifyUrl}\n\nIf you did not request this subscription, no action is required and you will receive no further emails. You may also unsubscribe at any time: ${unsubUrl}\n\nSincerely,\nOffice of Dr. ${settings.researcher_name}\nDar es Salaam, Tanzania`,
      html: `<div style="font-family: Georgia, serif; max-width: 600px; color: #192B2A; line-height: 1.6;">
        <h2 style="color: #285748; font-size: 20px;">Confirm Your Email Subscription</h2>
        <p>Dear ${name || 'Reader'},</p>
        <p>Thank you for requesting to receive publication alerts and economic research from <strong>Dr. ${settings.researcher_name}</strong>.</p>
        <p>Please click below to confirm your subscription:</p>
        <p style="margin: 20px 0;">
          <a href="${verifyUrl}" style="background-color: #285748; color: #F7F5EF; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
            Verify My Subscription
          </a>
        </p>
        <p style="font-size: 12px; color: #52605A;">
          If you did not make this request, you can safely ignore this email.
        </p>
      </div>`,
    });

    return NextResponse.json({
      success: true,
      message: 'A verification link has been dispatched to your email. Please click it to confirm your subscription.',
    });
  } catch (err: unknown) {
    console.error('Subscription error:', err);
    return NextResponse.json({ error: 'Server error processing subscription.' }, { status: 500 });
  }
}
