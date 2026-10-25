'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  CreditCard,
  Edit2,
  ExternalLink,
} from 'lucide-react';

interface Booking {
  id: number;
  booking_reference: string;
  management_token: string;
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
  created_at: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Edit fields
  const [meetingLink, setMeetingLink] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string>('not_applicable');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchBookings = (status = currentTab) => {
    setLoading(true);
    fetch(`/api/admin/bookings?status=${status}`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings(currentTab);
  }, [currentTab]);

  const handleOpenBooking = (b: Booking) => {
    setSelectedBooking(b);
    setMeetingLink(b.online_meeting_link || '');
    setAdminNotes(b.admin_notes || '');
    setPaymentStatus(b.payment_status);
  };

  const handleUpdate = async (statusOverride?: string) => {
    if (!selectedBooking) return;
    setSaving(true);
    setMsg('');

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBooking.id,
          status: statusOverride || selectedBooking.status,
          payment_status: paymentStatus,
          online_meeting_link: meetingLink,
          admin_notes: adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update booking');

      setSelectedBooking(data.booking);
      setMsg(`Booking updated successfully.`);
      fetchBookings();
    } catch (err: unknown) {
      alert((err as Error).message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Consultation Bookings Management
          </h2>
          <p className="text-xs text-[#52605A]">
            Review pending slot reservations, confirm appointments, enter meeting links, and manually record external payment receipt.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-900 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#D9DCD2] pb-2 text-xs font-medium overflow-x-auto">
        {(['all', 'pending_review', 'confirmed', 'declined', 'cancelled', 'completed', 'expired'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`px-3 py-1.5 rounded transition-colors uppercase tracking-wider text-[11px] whitespace-nowrap ${
              currentTab === tab
                ? 'bg-[#285748] text-[#F7F5EF] font-bold'
                : 'bg-[#E9EDE4] text-[#52605A] hover:bg-[#DCE3D7]'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
          <span>Loading bookings...</span>
        </div>
      ) : (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#192B2A]">
            <thead className="bg-[#DCE3D7] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Reference & Guest</th>
                <th className="p-3">Service & Format</th>
                <th className="p-3">Scheduled Time (EAT)</th>
                <th className="p-3">Booking Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DCD2]">
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => handleOpenBooking(b)}
                  className="hover:bg-[#F7F5EF] transition-colors cursor-pointer"
                >
                  <td className="p-3">
                    <span className="font-mono font-bold text-[#192B2A]">{b.booking_reference}</span>
                    <p className="font-semibold text-xs mt-0.5">{b.guest_name}</p>
                    <p className="text-[11px] text-[#52605A]">{b.guest_email}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{b.service_name_snapshot}</p>
                    <span className="text-[11px] text-[#52605A]">
                      {b.format === 'online' ? 'Online Video' : 'In-Person Office'}
                    </span>
                  </td>
                  <td className="p-3 text-[#52605A] whitespace-nowrap">
                    {new Date(b.start_time).toLocaleString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Africa/Dar_es_Salaam',
                    })}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'confirmed'
                          ? 'bg-green-700 text-white'
                          : b.status === 'pending_review'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : b.status === 'declined'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        b.payment_status === 'paid'
                          ? 'bg-green-100 text-green-900'
                          : b.payment_status === 'awaiting_payment'
                          ? 'bg-amber-100 text-amber-900'
                          : 'text-[#718079]'
                      }`}
                    >
                      {b.payment_status === 'paid'
                        ? 'PAID'
                        : b.payment_status === 'awaiting_payment'
                        ? `AWAITING (${b.currency_snapshot} ${b.price_amount_snapshot})`
                        : 'FREE'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337]"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#52605A]">
                    No bookings found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Management Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] w-full max-w-2xl rounded-sm p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#D9DCD2] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#285748]">
                  Reservation Management
                </span>
                <h3 className="font-serif text-xl font-medium text-[#192B2A]">
                  {selectedBooking.booking_reference} — {selectedBooking.guest_name}
                </h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-[#52605A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F5EF] p-4 rounded border border-[#D9DCD2]">
              <div>
                <span className="font-semibold text-[#192B2A]">Service:</span>{' '}
                {selectedBooking.service_name_snapshot} ({selectedBooking.duration_minutes_snapshot} mins)
              </div>
              <div>
                <span className="font-semibold text-[#192B2A]">Quoted Price:</span>{' '}
                {selectedBooking.price_amount_snapshot > 0
                  ? `${selectedBooking.currency_snapshot} ${selectedBooking.price_amount_snapshot}`
                  : 'Free Mentorship'}
              </div>
              <div>
                <span className="font-semibold text-[#192B2A]">Format:</span>{' '}
                {selectedBooking.format === 'online' ? 'Online Video' : 'In-Person at Office'}
              </div>
              <div>
                <span className="font-semibold text-[#192B2A]">Time (EAT):</span>{' '}
                {new Date(selectedBooking.start_time).toLocaleString('en-GB', {
                  timeZone: 'Africa/Dar_es_Salaam',
                })}
              </div>
              <div>
                <span className="font-semibold text-[#192B2A]">Guest Email:</span>{' '}
                <a href={`mailto:${selectedBooking.guest_email}`} className="text-[#285748] underline">
                  {selectedBooking.guest_email}
                </a>
              </div>
              <div>
                <span className="font-semibold text-[#192B2A]">Guest Link:</span>{' '}
                <Link
                  href={`/consultation/manage/${selectedBooking.management_token}`}
                  target="_blank"
                  className="text-[#285748] underline inline-flex items-center gap-1"
                >
                  <span>Open Guest View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-[#192B2A]">Discussion Topic:</span>
              <p className="bg-[#F7F5EF] p-3 rounded border border-[#D9DCD2] text-[#192B2A]">
                {selectedBooking.topic_summary}
              </p>
            </div>

            {/* Online meeting link if online */}
            {selectedBooking.format === 'online' && (
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-[#192B2A]">Online Video Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-1.5 bg-[#F7F5EF] border border-[#D9DCD2] rounded font-mono"
                />
                <p className="text-[11px] text-[#52605A]">
                  This link is kept private and only displayed to the guest once status is Confirmed.
                </p>
              </div>
            )}

            {/* Payment status control (Strictly authenticated admin only) */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-[#192B2A]">
                Advisory Payment Status (Admin Verified)
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F5EF] border border-[#D9DCD2] rounded font-semibold text-[#192B2A]"
              >
                <option value="not_applicable">Not Applicable (Free Mentorship Session)</option>
                <option value="awaiting_payment">Awaiting Payment (External Transfer Pending)</option>
                <option value="paid">Paid & Verified (Funds Received by Researcher)</option>
              </select>
            </div>

            {/* Admin notes */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-[#192B2A]">Private Admin Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes regarding prep or remittance..."
                className="w-full px-3 py-1.5 bg-[#F7F5EF] border border-[#D9DCD2] rounded"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-[#D9DCD2] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#192B2A]">Set Status:</span>
                {selectedBooking.status === 'pending_review' && (
                  <>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleUpdate('confirmed')}
                      className="px-3 py-1.5 bg-[#285748] text-white rounded font-semibold hover:bg-[#1e4337]"
                    >
                      Confirm Booking
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleUpdate('declined')}
                      className="px-3 py-1.5 bg-red-100 text-red-900 rounded font-semibold hover:bg-red-200"
                    >
                      Decline
                    </button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleUpdate('completed')}
                      className="px-3 py-1.5 bg-blue-100 text-blue-900 rounded font-semibold hover:bg-blue-200"
                    >
                      Mark Completed
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleUpdate('cancelled')}
                      className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Cancel & Release Slot
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleUpdate()}
                className="px-4 py-2 bg-[#285748] text-white rounded font-semibold hover:bg-[#1e4337] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
