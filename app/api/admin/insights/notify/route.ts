import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { getSiteSettings } from '@/lib/data';

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { insightId } = await req.json();
    if (!insightId) return NextResponse.json({ error: 'Insight ID is required' }, { status: 400 });

    const db = getDb();
    const settings = getSiteSettings();
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

    const insight = db.prepare(`SELECT * FROM insights WHERE id = ?`).get(insightId) as {
      id: number;
      title: string;
      slug: string;
      summary: string;
      status: string;
    } | undefined;

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    if (insight.status !== 'published') {
      return NextResponse.json({ error: 'Cannot send notification for draft content.' }, { status: 400 });
    }

    // Check if campaign already sent (Deduplication guarantee)
    const existingCampaign = db.prepare(`
      SELECT * FROM email_campaigns
      WHERE publication_type = 'insight' AND publication_id = ?
    `).get(insight.id) as { id: number; sent_count: number; created_at: string } | undefined;

    if (existingCampaign) {
      return NextResponse.json(
        { error: `Notification campaign for this article was already dispatched on ${existingCampaign.created_at}. Duplicate sends are blocked.` },
        { status: 409 }
      );
    }

    // Fetch confirmed subscribers only
    const subscribers = db.prepare(`
      SELECT email, name, unsubscribe_token FROM subscribers
      WHERE status = 'confirmed'
    `).all() as { email: string; name: string; unsubscribe_token: string }[];

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'No confirmed subscribers to notify.',
      });
    }

    const articleUrl = `${siteUrl}/insights/${insight.slug}`;
    const subject = `New Publication: ${insight.title}`;

    let dispatched = 0;
    // Send to each subscriber individually (prevents CC exposure)
    for (const sub of subscribers) {
      const unsubUrl = `${siteUrl}/subscribe/unsubscribe?token=${sub.unsubscribe_token}`;

      await sendEmail({
        to: sub.email,
        subject,
        emailType: 'publication_notify',
        text: `Dear ${sub.name || 'Reader'},\n\nA new economic analysis has been published by Dr. ${settings.researcher_name}:\n\n"${insight.title}"\n\nSummary:\n${insight.summary}\n\nRead the complete article online:\n${articleUrl}\n\nTo manage your preferences or unsubscribe: ${unsubUrl}\n\nOffice of ${settings.researcher_name}\nDar es Salaam, Tanzania`,
        html: `<div style="font-family: Georgia, serif; max-width: 600px; color: #192B2A; line-height: 1.6;">
          <h2 style="color: #285748; font-size: 20px;">${insight.title}</h2>
          <p>Dear ${sub.name || 'Reader'},</p>
          <p>A new economic analysis has been published by <strong>Dr. ${settings.researcher_name}</strong>.</p>
          <p style="font-size: 15px; color: #52605A; font-style: italic;">
            ${insight.summary}
          </p>
          <p style="margin: 20px 0;">
            <a href="${articleUrl}" style="background-color: #285748; color: #F7F5EF; padding: 10px 20px; text-decoration: none; border-radius: 3px; font-weight: bold; font-size: 13px; display: inline-block;">
              Read Full Analysis Online →
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #D9DCD2; margin: 24px 0;" />
          <p style="font-size: 11px; color: #718079;">
            You received this email because you subscribed to research alerts at ${siteUrl}.<br/>
            <a href="${unsubUrl}" style="color: #52605A; text-decoration: underline;">Unsubscribe immediately</a>
          </p>
        </div>`,
      });

      dispatched++;
    }

    // Persist campaign record to prevent duplicates
    db.prepare(`
      INSERT INTO email_campaigns (publication_type, publication_id, subject, sent_count, status, created_at)
      VALUES ('insight', ?, ?, ?, 'sent', datetime('now'))
    `).run(insight.id, subject, dispatched);

    return NextResponse.json({
      success: true,
      sentCount: dispatched,
      message: `Notification successfully dispatched to ${dispatched} confirmed subscribers.`,
    });
  } catch (err: unknown) {
    console.error('Notify error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Failed to dispatch notification.' }, { status: 500 });
  }
}
