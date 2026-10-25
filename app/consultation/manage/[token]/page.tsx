'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowLeft, Shield } from 'lucide-react';

interface BookingData {
  reference: string;
  status: 'pending_review' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'expired';
  paymentStatus: 'not_applicable' | 'awaiting_payment' | 'paid';
  serviceName: string;
  priceAmount: number;
  currency: string;
  durationMinutes: number;
  format: 'online' | 'in_person';
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  topicSummary: string;
  onlineMeetingLink?: string;
  createdAt: string;
}

interface Instructions {
  officeAddress: string;
  officeInstructions: string;
  onlineInstructions: string;
  paymentInstructions: string;
  researcherName: string;
  contactEmail: string;
}

export default function GuestManageBookingPage() {
  const params = useParams();
  const token = params?.token as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const fetchBooking = () => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/consultation/manage/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Booking reservation not found or invalid token.');
        return res.json();
      })
      .then((data) => {
        setBooking(data.booking);
        setInstructions(data.instructions);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load booking details.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooking();
  }, [token]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this consultation reservation? This action releases your reserved slot.')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch(`/api/consultation/manage/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel booking.');
      }
      setCancelSuccess(true);
      fetchBooking();
    } catch (err: unknown) {
      alert((err as Error).message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
        <span>Loading reservation details...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded text-red-900 text-sm space-y-2">
          <p className="font-semibold">Unable to access booking</p>
          <p>{error || 'The management link is invalid or expired.'}</p>
        </div>
        <Link href="/" className="text-xs font-semibold text-[#285748] underline">
          ← Return to Homepage
        </Link>
      </div>
    );
  }

  const formattedStart = new Date(booking.startTime).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Dar_es_Salaam',
  });

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#285748] text-[#F7F5EF]">Confirmed by Researcher</span>;
      case 'pending_review':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Pending Review (Slot Held)</span>;
      case 'declined':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900">Declined</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800">Cancelled by Guest</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">Completed</span>;
      case 'expired':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">Expired</span>;
    }
  };

  const getPaymentBadge = () => {
    switch (booking.paymentStatus) {
      case 'paid':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-900 border border-green-300">Paid & Verified</span>;
      case 'awaiting_payment':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Awaiting External Payment</span>;
      case 'not_applicable':
        return <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-[#E9EDE4] text-[#52605A]">Not Applicable (Free)</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top breadcrumb */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#285748] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Main Reservation Card */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 sm:p-8 rounded-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9DCD2] pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Consultation Management
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
              Reservation {booking.reference}
            </h1>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#52605A] bg-[#F7F5EF] p-5 rounded border border-[#D9DCD2]">
          <div>
            <span className="block font-semibold text-[#192B2A]">Service:</span>
            <span className="text-sm font-medium text-[#192B2A]">{booking.serviceName}</span>
            <span className="block text-[11px] text-[#718079]">{booking.durationMinutes} minutes</span>
          </div>

          <div>
            <span className="block font-semibold text-[#192B2A]">Meeting Format:</span>
            <span className="text-sm font-medium text-[#192B2A]">
              {booking.format === 'online' ? 'Online Video Meeting' : 'In-Person at Office'}
            </span>
          </div>

          <div>
            <span className="block font-semibold text-[#192B2A]">Scheduled Time (EAT):</span>
            <span className="text-sm font-mono font-medium text-[#285748]">{formattedStart}</span>
          </div>

          <div>
            <span className="block font-semibold text-[#192B2A]">Payment Status:</span>
            <div className="mt-1">{getPaymentBadge()}</div>
            {booking.priceAmount > 0 && (
              <span className="block text-[11px] text-[#718079] mt-0.5">
                Quoted Fee: {booking.currency} {booking.priceAmount}
              </span>
            )}
          </div>
        </div>

        {/* Discussion Topic */}
        <div className="space-y-1 text-xs text-[#52605A]">
          <span className="block font-semibold text-[#192B2A]">Discussion Topic:</span>
          <p className="bg-[#F7F5EF] p-4 rounded border border-[#D9DCD2] text-sm text-[#192B2A] leading-relaxed">
            {booking.topicSummary}
          </p>
        </div>

        {/* Format Specific Details */}
        {booking.format === 'online' ? (
          <div className="p-4 bg-[#F7F5EF] border border-[#D9DCD2] rounded space-y-2 text-xs text-[#192B2A]">
            <div className="flex items-center gap-2 font-semibold text-[#285748]">
              <Video className="w-4 h-4" />
              <span>Online Video Instructions:</span>
            </div>
            {booking.status === 'confirmed' && booking.onlineMeetingLink ? (
              <div className="p-3 bg-green-50 border border-green-300 rounded space-y-1">
                <p className="font-semibold text-green-900">Your Meeting Link:</p>
                <a
                  href={booking.onlineMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#285748] underline font-mono break-all font-bold"
                >
                  {booking.onlineMeetingLink}
                </a>
              </div>
            ) : (
              <p className="text-[#52605A] italic">
                {instructions?.onlineInstructions || 'Video meeting link will be activated here once the booking is confirmed by the researcher.'}
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 bg-[#F7F5EF] border border-[#D9DCD2] rounded space-y-2 text-xs text-[#192B2A]">
            <div className="flex items-center gap-2 font-semibold text-[#285748]">
              <MapPin className="w-4 h-4" />
              <span>Office Address & Arrival Instructions:</span>
            </div>
            <p className="font-medium">{instructions?.officeAddress}</p>
            <p className="text-[#52605A] leading-relaxed">{instructions?.officeInstructions}</p>
          </div>
        )}

        {/* Payment Remittance Instructions (if paid service) */}
        {booking.paymentStatus === 'awaiting_payment' && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded space-y-2 text-xs text-amber-950">
            <p className="font-bold text-amber-900">External Payment Instructions:</p>
            <p className="leading-relaxed whitespace-pre-line">
              {instructions?.paymentInstructions}
            </p>
            <p className="text-[11px] text-amber-800 italic pt-1 border-t border-amber-200">
              Please include your booking reference <strong>{booking.reference}</strong> when initiating transfer. The researcher will verify receipt and update your status to Paid.
            </p>
          </div>
        )}

        {/* Actions: Cancel Booking */}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'declined' && (
          <div className="pt-4 border-t border-[#D9DCD2] flex items-center justify-between">
            <p className="text-xs text-[#52605A]">
              Need to reschedule or release your slot?
            </p>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
