import { getDb } from './db';
import crypto from 'node:crypto';

export interface ConsultationService {
  id: number;
  name: string;
  slug: string;
  is_paid: number;
  price_amount: number;
  currency: string;
  duration_minutes: number;
  format: 'both' | 'online' | 'in_person';
  description: string;
  prep_instructions: string;
  is_active: number;
  order_index: number;
}

export interface Booking {
  id: number;
  booking_reference: string;
  management_token: string;
  service_id: number;
  service_name_snapshot: string;
  price_amount_snapshot: number;
  currency_snapshot: string;
  duration_minutes_snapshot: number;
  format: 'online' | 'in_person';
  start_time: string;
  end_time: string;
  guest_name: string;
  guest_email: string;
  topic_summary: string;
  status: 'pending_review' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'expired';
  payment_status: 'not_applicable' | 'awaiting_payment' | 'paid';
  online_meeting_link: string;
  admin_notes: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  label: string;     // e.g. "10:00 - 10:45 (EAT)"
  available: boolean;
  reason?: string;
}

// Generate random booking reference like ECO-2026-X7K9
export function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'ECO-';
  for (let i = 0; i < 4; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  ref += '-';
  for (let i = 0; i < 4; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

// Releases expired pending bookings
export function cleanExpiredBookings(): void {
  const db = getDb();
  db.prepare(`
    UPDATE bookings
    SET status = 'expired', updated_at = datetime('now')
    WHERE status = 'pending_review'
      AND expires_at IS NOT NULL
      AND datetime(expires_at) < datetime('now')
  `).run();
}

/**
 * Checks whether a given [startTime, endTime] window is already booked or reserved
 * Active reservations are: 'confirmed' OR ('pending_review' where expires_at > now)
 */
export function isSlotConflicting(startTime: string, endTime: string, excludeBookingId?: number): boolean {
  cleanExpiredBookings();
  const db = getDb();
  
  let sql = `
    SELECT id FROM bookings
    WHERE (
      (status = 'confirmed') OR
      (status = 'pending_review' AND (expires_at IS NULL OR datetime(expires_at) > datetime('now')))
    )
    AND datetime(start_time) < datetime(?)
    AND datetime(end_time) > datetime(?)
  `;
  const params: (string | number)[] = [endTime, startTime];

  if (excludeBookingId) {
    sql += ` AND id != ?`;
    params.push(excludeBookingId);
  }

  const existing = db.prepare(sql).get(...params);
  return Boolean(existing);
}

/**
 * Get available time slots for a given date (YYYY-MM-DD) and service duration
 * Office timezone is Africa/Dar_es_Salaam (UTC+3)
 */
export function getAvailableSlots(dateStr: string, durationMinutes: number): TimeSlot[] {
  cleanExpiredBookings();
  const db = getDb();

  // Check if date is blocked
  const isBlocked = db.prepare(`SELECT id, reason FROM blocked_dates WHERE date_str = ?`).get(dateStr) as { id: number; reason: string } | undefined;
  if (isBlocked) {
    return [];
  }

  // Parse target date in UTC+3 (Dar es Salaam)
  // dateStr is 'YYYY-MM-DD'
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const dayOfWeek = targetDate.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // Check availability rule for day of week
  const rule = db.prepare(`
    SELECT start_time, end_time FROM availability_rules
    WHERE day_of_week = ? AND is_active = 1
  `).get(dayOfWeek) as { start_time: string; end_time: string } | undefined;

  if (!rule) {
    return []; // Closed on this day
  }

  const [startHour, startMin] = rule.start_time.split(':').map(Number);
  const [endHour, endMin] = rule.end_time.split(':').map(Number);

  // Notice buffer: slots must be at least 24 hours in the future
  const nowUtc = new Date();
  const minNoticeTime = new Date(nowUtc.getTime() + 24 * 60 * 60 * 1000);

  // Maximum booking horizon: 30 days
  const maxHorizonTime = new Date(nowUtc.getTime() + 30 * 24 * 60 * 60 * 1000);

  const slots: TimeSlot[] = [];
  const bufferMinutes = 15; // 15-minute buffer between consultations

  let currentMinute = startHour * 60 + startMin;
  const endMinute = endHour * 60 + endMin;

  while (currentMinute + durationMinutes <= endMinute) {
    const slotStartHour = Math.floor(currentMinute / 60);
    const slotStartMin = currentMinute % 60;

    const slotEndMinute = currentMinute + durationMinutes;
    const slotEndHour = Math.floor(slotEndMinute / 60);
    const slotEndMin = slotEndMinute % 60;

    // Build ISO string in UTC. Dar es Salaam is UTC+3.
    // So 09:00 EAT is 06:00 UTC.
    const startIso = new Date(Date.UTC(year, month - 1, day, slotStartHour - 3, slotStartMin, 0)).toISOString();
    const endIso = new Date(Date.UTC(year, month - 1, day, slotEndHour - 3, slotEndMin, 0)).toISOString();

    const slotStartDate = new Date(startIso);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const label = `${pad(slotStartHour)}:${pad(slotStartMin)} - ${pad(slotEndHour)}:${pad(slotEndMin)} EAT`;

    let available = true;
    let reason = '';

    if (slotStartDate < minNoticeTime) {
      available = false;
      reason = 'Requires 24 hours advance notice';
    } else if (slotStartDate > maxHorizonTime) {
      available = false;
      reason = 'Outside 30-day booking horizon';
    } else if (isSlotConflicting(startIso, endIso)) {
      available = false;
      reason = 'Slot reserved or unavailable';
    }

    slots.push({
      startTime: startIso,
      endTime: endIso,
      label,
      available,
      reason: available ? undefined : reason,
    });

    currentMinute += durationMinutes + bufferMinutes;
  }

  return slots;
}

export interface CreateBookingInput {
  serviceId: number;
  format: 'online' | 'in_person';
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  topicSummary: string;
}

/**
 * Creates a consultation booking inside an immediate transaction.
 * Guarantees zero race conditions or double bookings!
 */
export function createBooking(input: CreateBookingInput): { booking: Booking } {
  const db = getDb();

  // Validate service exists and is active
  const service = db.prepare(`
    SELECT * FROM consultation_services WHERE id = ? AND is_active = 1
  `).get(input.serviceId) as ConsultationService | undefined;

  if (!service) {
    throw new Error('Selected consultation service is not available');
  }

  if (service.format !== 'both' && service.format !== input.format) {
    throw new Error(`This service is only offered ${service.format.replace('_', ' ')}`);
  }

  // Expiry hours for pending review
  const expiryHours = parseInt(process.env.PENDING_BOOKING_EXPIRY_HOURS || '24', 10);
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

  const bookingRef = generateBookingReference();
  const managementToken = crypto.randomBytes(32).toString('hex');
  const paymentStatus = service.is_paid ? 'awaiting_payment' : 'not_applicable';

  // ATOMIC IMMEDIATE TRANSACTION
  db.exec('BEGIN IMMEDIATE');
  try {
    // Check conflicts inside exclusive transaction
    const conflict = isSlotConflicting(input.startTime, input.endTime);
    if (conflict) {
      throw new Error('This time slot is no longer available. Please select another slot.');
    }

    const stmt = db.prepare(`
      INSERT INTO bookings (
        booking_reference,
        management_token,
        service_id,
        service_name_snapshot,
        price_amount_snapshot,
        currency_snapshot,
        duration_minutes_snapshot,
        format,
        start_time,
        end_time,
        guest_name,
        guest_email,
        topic_summary,
        status,
        payment_status,
        online_meeting_link,
        expires_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, '', ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(
      bookingRef,
      managementToken,
      service.id,
      service.name,
      service.price_amount,
      service.currency,
      service.duration_minutes,
      input.format,
      input.startTime,
      input.endTime,
      input.guestName.trim(),
      input.guestEmail.trim().toLowerCase(),
      input.topicSummary.trim(),
      paymentStatus,
      expiresAt
    );

    const booking = (db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(result.lastInsertRowid) as unknown) as Booking;

    db.exec('COMMIT');
    return { booking };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
