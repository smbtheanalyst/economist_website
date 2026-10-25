import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/data';
import { sendEmail } from '@/lib/email';
import { Booking } from '@/lib/booking';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  if (!token || token.length < 20) {
    return NextResponse.json({ error: 'Invalid management token.' }, { status: 400 });
  }

  const db = getDb();
  const settings = getSiteSettings();

  const booking = db.prepare(`SELECT * FROM bookings WHERE management_token = ?`).get(token) as Booking | undefined;

  if (!booking) {
    return NextResponse.json({ error: 'Booking reservation not found.' }, { status: 404 });
  }

  // Check if pending has expired
  if (
    booking.status === 'pending_review' &&
    booking.expires_at &&
    new Date(booking.expires_at) < new Date()
  ) {
    db.prepare(`UPDATE bookings SET status = 'expired', updated_at = datetime('now') WHERE id = ?`).run(booking.id);
    booking.status = 'expired';
  }

  return NextResponse.json({
    booking: {
      reference: booking.booking_reference,
      status: booking.status,
      paymentStatus: booking.payment_status,
      serviceName: booking.service_name_snapshot,
      priceAmount: booking.price_amount_snapshot,
      currency: booking.currency_snapshot,
      durationMinutes: booking.duration_minutes_snapshot,
      format: booking.format,
      startTime: booking.start_time,
      endTime: booking.end_time,
      guestName: booking.guest_name,
      guestEmail: booking.guest_email,
      topicSummary: booking.topic_summary,
      // Private online meeting link is only revealed when status is confirmed
      onlineMeetingLink: booking.status === 'confirmed' ? booking.online_meeting_link : '',
      createdAt: booking.created_at,
    },
    instructions: {
      officeAddress: settings.office_address,
      officeInstructions: settings.office_instructions,
      onlineInstructions: settings.online_instructions,
      paymentInstructions: settings.payment_instructions,
      researcherName: settings.researcher_name,
      contactEmail: settings.contact_email,
    },
  });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  if (!token || token.length < 20) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 400 });
  }

  const body = await req.json();
  const action = body.action;

  if (action !== 'cancel') {
    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  }

  const db = getDb();
  const settings = getSiteSettings();

  const booking = db.prepare(`SELECT * FROM bookings WHERE management_token = ?`).get(token) as Booking | undefined;

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'declined') {
    return NextResponse.json({ error: `Cannot cancel a booking that is already ${booking.status}.` }, { status: 400 });
  }

  // Update status to cancelled (this frees up the slot)
  db.prepare(`
    UPDATE bookings
    SET status = 'cancelled', updated_at = datetime('now')
    WHERE id = ?
  `).run(booking.id);

  // Send cancellation email
  await sendEmail({
    to: booking.guest_email,
    subject: `Consultation Cancelled: ${booking.booking_reference}`,
    emailType: 'booking_cancelled',
    text: `Dear ${booking.guest_name},\n\nYour consultation reservation (${booking.booking_reference}) has been successfully cancelled as requested. The reserved time slot has been released.\n\nSincerely,\nOffice of ${settings.researcher_name}`,
    html: `<div style="font-family: Georgia, serif; max-width: 600px; color: #192B2A;">
      <h2 style="color: #285748;">Consultation Cancelled</h2>
      <p>Dear ${booking.guest_name},</p>
      <p>Your consultation reservation (<strong>${booking.booking_reference}</strong>) has been cancelled as requested. The time slot has been released.</p>
      <p>Sincerely,<br/>Office of ${settings.researcher_name}</p>
    </div>`,
  });

  return NextResponse.json({
    success: true,
    message: 'Your booking has been cancelled and the reserved slot released.',
    status: 'cancelled',
  });
}
