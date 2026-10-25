import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createBooking } from '@/lib/booking';
import { checkRateLimit } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { getSiteSettings } from '@/lib/data';

const BookSchema = z.object({
  serviceId: z.number().int().positive(),
  format: z.enum(['online', 'in_person']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  guestName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  guestEmail: z.string().trim().email('Valid email is required').max(120),
  topicSummary: z.string().trim().min(10, 'Topic must be at least 10 characters').max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate limit: max 6 booking requests per hour
    const rateCheck = checkRateLimit(`book_${ip}`, 6, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many booking requests. Please wait before attempting another booking.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = BookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid booking details.' },
        { status: 400 }
      );
    }

    // Call atomic transactional booking function
    const { booking } = createBooking({
      serviceId: parsed.data.serviceId,
      format: parsed.data.format,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      guestName: parsed.data.guestName,
      guestEmail: parsed.data.guestEmail,
      topicSummary: parsed.data.topicSummary,
    });

    const settings = getSiteSettings();
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    const manageUrl = `${siteUrl}/consultation/manage/${booking.management_token}`;

    const formattedStart = new Date(booking.start_time).toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Dar_es_Salaam',
    });

    // Send email notification to guest
    await sendEmail({
      to: booking.guest_email,
      subject: `Consultation Request Received: ${booking.booking_reference}`,
      emailType: 'booking_request_guest',
      text: `Dear ${booking.guest_name},\n\nYour consultation booking request has been received and is currently Pending Review.\n\nBooking Reference: ${booking.booking_reference}\nService: ${booking.service_name_snapshot} (${booking.duration_minutes_snapshot} mins)\nFormat: ${booking.format === 'online' ? 'Online Video' : 'In-Person at Dar es Salaam Office'}\nScheduled Time: ${formattedStart} (EAT, UTC+3)\nPayment Status: ${booking.payment_status === 'awaiting_payment' ? `Awaiting Payment (${booking.currency_snapshot} ${booking.price_amount_snapshot})` : 'Not Applicable (Free Session)'}\n\nYou can view and manage your reservation anytime at:\n${manageUrl}\n\nPlease note: This time slot has been reserved for you and awaits confirmation by Dr. ${settings.researcher_name}. You will receive a notification as soon as your booking is reviewed.\n\nSincerely,\nOffice of ${settings.researcher_name}`,
      html: `<div style="font-family: Georgia, serif; max-width: 600px; color: #192B2A; line-height: 1.6;">
        <h2 style="color: #285748; font-size: 20px;">Consultation Request Received</h2>
        <p>Dear ${booking.guest_name},</p>
        <p>Your consultation booking request has been received and is currently <strong>Pending Review</strong>.</p>
        <div style="background-color: #E9EDE4; padding: 16px; border-radius: 4px; margin: 16px 0; font-size: 14px;">
          <p style="margin: 0 0 8px 0;"><strong>Reference:</strong> ${booking.booking_reference}</p>
          <p style="margin: 0 0 8px 0;"><strong>Service:</strong> ${booking.service_name_snapshot}</p>
          <p style="margin: 0 0 8px 0;"><strong>Format:</strong> ${booking.format === 'online' ? 'Online Video' : 'In-Person at Office'}</p>
          <p style="margin: 0 0 8px 0;"><strong>Date & Time:</strong> ${formattedStart} EAT</p>
          <p style="margin: 0;"><strong>Payment:</strong> ${booking.payment_status === 'awaiting_payment' ? `Awaiting Payment (${booking.currency_snapshot} ${booking.price_amount_snapshot})` : 'Free Session'}</p>
        </div>
        <p>
          <a href="${manageUrl}" style="display: inline-block; background-color: #285748; color: #F7F5EF; padding: 10px 18px; text-decoration: none; border-radius: 3px; font-weight: bold; font-size: 13px;">
            View / Manage Your Reservation
          </a>
        </p>
        <p style="font-size: 12px; color: #52605A; margin-top: 24px;">
          This private management link is unique to your booking. Please retain this email for your records.
        </p>
      </div>`,
    });

    return NextResponse.json({
      success: true,
      booking: {
        reference: booking.booking_reference,
        managementToken: booking.management_token,
        status: booking.status,
        paymentStatus: booking.payment_status,
        serviceName: booking.service_name_snapshot,
        format: booking.format,
        startTime: booking.start_time,
        endTime: booking.end_time,
        manageUrl,
      },
    });
  } catch (err: unknown) {
    const errorMsg = (err as Error).message || 'Failed to complete booking.';
    const isConflict = errorMsg.includes('no longer available');
    return NextResponse.json(
      { error: errorMsg },
      { status: isConflict ? 409 : 500 }
    );
  }
}
