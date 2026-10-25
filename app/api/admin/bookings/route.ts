import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { cleanExpiredBookings, Booking } from '@/lib/booking';
import { sendEmail } from '@/lib/email';
import { getSiteSettings } from '@/lib/data';

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  cleanExpiredBookings();
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = `SELECT * FROM bookings`;
  const params: string[] = [];

  if (status && status !== 'all') {
    query += ` WHERE status = ?`;
    params.push(status);
  }

  query += ` ORDER BY datetime(start_time) DESC`;

  const bookings = db.prepare(query).all(...params);
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status, payment_status, online_meeting_link, admin_notes } = body;

    if (!id) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

    const db = getDb();
    const settings = getSiteSettings();

    const currentBooking = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(id) as Booking | undefined;
    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE bookings
      SET status = coalesce(?, status),
          payment_status = coalesce(?, payment_status),
          online_meeting_link = coalesce(?, online_meeting_link),
          admin_notes = coalesce(?, admin_notes),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status, payment_status, online_meeting_link, admin_notes, id);

    const updatedBooking = (db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(id) as unknown) as Booking;

    // Send notification to guest if status changed
    if (status && status !== currentBooking.status) {
      const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
      const manageUrl = `${siteUrl}/consultation/manage/${updatedBooking.management_token}`;

      let subject = `Consultation Update: ${updatedBooking.booking_reference}`;
      let textBody = '';
      let htmlBody = '';

      if (status === 'confirmed') {
        subject = `Consultation Confirmed: ${updatedBooking.booking_reference}`;
        textBody = `Dear ${updatedBooking.guest_name},\n\nYour consultation reservation (${updatedBooking.booking_reference}) has been confirmed by Dr. ${settings.researcher_name}.\n\nService: ${updatedBooking.service_name_snapshot}\nFormat: ${updatedBooking.format === 'online' ? 'Online Video' : 'In-Person at Dar es Salaam Office'}\nDate & Time: ${updatedBooking.start_time}\n${updatedBooking.online_meeting_link ? `Online Meeting Link: ${updatedBooking.online_meeting_link}\n` : ''}\nView all details: ${manageUrl}\n\nSincerely,\nOffice of ${settings.researcher_name}`;
        htmlBody = `<div style="font-family: Georgia, serif; max-width: 600px; color: #192B2A;">
          <h2 style="color: #285748;">Consultation Confirmed</h2>
          <p>Dear ${updatedBooking.guest_name},</p>
          <p>Your consultation reservation (<strong>${updatedBooking.booking_reference}</strong>) has been confirmed.</p>
          ${updatedBooking.online_meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${updatedBooking.online_meeting_link}">${updatedBooking.online_meeting_link}</a></p>` : ''}
          <p><a href="${manageUrl}" style="background-color: #285748; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 3px; display: inline-block;">View Reservation Details</a></p>
          <p>Sincerely,<br/>Office of ${settings.researcher_name}</p>
        </div>`;
      } else if (status === 'declined') {
        subject = `Consultation Request Declined: ${updatedBooking.booking_reference}`;
        textBody = `Dear ${updatedBooking.guest_name},\n\nRegrettably, your consultation request (${updatedBooking.booking_reference}) cannot be accommodated at this time due to schedule conflicts.\n\nSincerely,\nOffice of ${settings.researcher_name}`;
        htmlBody = `<div style="font-family: Georgia, serif; max-width: 600px; color: #192B2A;">
          <h2 style="color: #991b1b;">Consultation Request Declined</h2>
          <p>Dear ${updatedBooking.guest_name},</p>
          <p>Regrettably, your consultation request (<strong>${updatedBooking.booking_reference}</strong>) could not be accommodated at this time due to conflicting obligations.</p>
          <p>Sincerely,<br/>Office of ${settings.researcher_name}</p>
        </div>`;
      }

      if (textBody) {
        await sendEmail({
          to: updatedBooking.guest_email,
          subject,
          emailType: `booking_${status}`,
          text: textBody,
          html: htmlBody,
        });
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err: unknown) {
    console.error('Update booking error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
