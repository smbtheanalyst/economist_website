'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, AlertCircle, Loader2, Video, Building, ArrowRight, UserCheck } from 'lucide-react';

interface Service {
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
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  label: string;
  available: boolean;
  reason?: string;
}

export default function ConsultationPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'online' | 'in_person'>('online');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [topicSummary, setTopicSummary] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reference: string;
    managementToken: string;
    manageUrl: string;
    status: string;
    paymentStatus: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/consultation/services')
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
        setLoadingServices(false);
      })
      .catch((err) => {
        console.error('Failed to load services:', err);
        setLoadingServices(false);
      });
  }, []);

  // Fetch slots whenever selectedDate or selectedService changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setSelectedSlot(null);

    fetch(`/api/consultation/slots?date=${selectedDate}&duration=${selectedService.duration_minutes}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch((err) => {
        console.error('Failed to load slots:', err);
        setLoadingSlots(false);
      });
  }, [selectedDate, selectedService]);

  // Compute tomorrow date in YYYY-MM-DD as minimum for date picker (24h advance notice)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedSlot) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/consultation/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          format: selectedFormat,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          guestName,
          guestEmail,
          topicSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete booking.');
      }

      setConfirmedBooking(data.booking);
    } catch (err: unknown) {
      setSubmitError((err as Error).message || 'Booking submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Direct Engagement
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Book a Consultation
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-2xl">
          Reserve an advisory appointment online via secure video link or in-person at the office in Dar es Salaam. No account registration required.
        </p>
      </div>

      {confirmedBooking ? (
        /* SUCCESS CONFIRMATION VIEW */
        <div className="bg-[#E9EDE4] border border-[#285748] p-8 rounded-sm space-y-6">
          <div className="flex items-center gap-3 text-[#285748]">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h2 className="font-serif text-3xl font-medium text-[#192B2A]">
                Booking Request Submitted
              </h2>
              <p className="text-xs text-[#52605A] font-medium tracking-wide">
                Reference: <span className="text-[#192B2A] font-mono font-bold text-sm">{confirmedBooking.reference}</span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#F7F5EF] border border-[#D9DCD2] rounded space-y-3 text-sm text-[#192B2A]">
            <p className="font-semibold text-[#285748]">
              Status: Request Awaiting Admin Confirmation (Pending Review)
            </p>
            <p className="text-xs text-[#52605A] leading-relaxed">
              Your requested slot is now held and reserved for you. An acknowledgement email with your management link has been dispatched to <strong>{guestEmail}</strong>.
            </p>
            {confirmedBooking.paymentStatus === 'awaiting_payment' && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded space-y-1">
                <p className="font-semibold">Payment Status: Awaiting Payment</p>
                <p>
                  External payment instructions have been provided on your private management dashboard. Once payment is recorded by the researcher, your consultation will be marked Paid and confirmed.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href={confirmedBooking.manageUrl}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
            >
              <span>View & Manage Your Reservation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="px-5 py-3 text-sm font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#DCE3D7] transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      ) : (
        /* WIZARD PROGRESS & STEPS */
        <div className="space-y-8">
          {/* Progress Indicators */}
          <div className="grid grid-cols-5 gap-2 border-b border-[#D9DCD2] pb-4 text-xs font-medium text-[#52605A]">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-[#285748] font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-[#E9EDE4] flex items-center justify-center text-[11px]">1</span>
              <span className="hidden sm:inline">Service</span>
            </div>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-[#285748] font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-[#E9EDE4] flex items-center justify-center text-[11px]">2</span>
              <span className="hidden sm:inline">Format</span>
            </div>
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-[#285748] font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-[#E9EDE4] flex items-center justify-center text-[11px]">3</span>
              <span className="hidden sm:inline">Date & Time</span>
            </div>
            <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-[#285748] font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-[#E9EDE4] flex items-center justify-center text-[11px]">4</span>
              <span className="hidden sm:inline">Your Details</span>
            </div>
            <div className={`flex items-center gap-1.5 ${step === 5 ? 'text-[#285748] font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-[#E9EDE4] flex items-center justify-center text-[11px]">5</span>
              <span className="hidden sm:inline">Review</span>
            </div>
          </div>

          {/* STEP 1: CHOOSE SERVICE */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
                Step 1: Select Consultation Service
              </h2>

              {loadingServices ? (
                <div className="p-8 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#285748]" />
                  <span>Loading available services...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {services.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => {
                        setSelectedService(svc);
                        if (svc.format === 'in_person') setSelectedFormat('in_person');
                        else setSelectedFormat('online');
                        setStep(2);
                      }}
                      className={`p-6 bg-[#E9EDE4] border rounded-sm cursor-pointer transition-all hover:border-[#285748] ${
                        selectedService?.id === svc.id ? 'border-[#285748] ring-1 ring-[#285748]' : 'border-[#D9DCD2]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-serif text-xl font-medium text-[#192B2A]">
                          {svc.name}
                        </h3>
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#F7F5EF] text-[#285748] border border-[#DCE3D7]">
                            {svc.is_paid ? `${svc.currency} ${svc.price_amount}` : 'Free Mentorship'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#52605A] mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#285748]" />
                          {svc.duration_minutes} Minutes
                        </span>
                        <span>•</span>
                        <span>
                          Format: {svc.format === 'both' ? 'Online or In-Person' : svc.format.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-sm text-[#52605A] mt-3 leading-relaxed font-light">
                        {svc.description}
                      </p>

                      <div className="pt-3 mt-3 border-t border-[#D9DCD2] flex justify-end">
                        <span className="text-xs font-semibold text-[#285748] inline-flex items-center gap-1">
                          Select This Service <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CHOOSE FORMAT */}
          {step === 2 && selectedService && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
                Step 2: Choose Meeting Format
              </h2>
              <p className="text-xs text-[#52605A]">
                Selected Service: <strong className="text-[#192B2A]">{selectedService.name}</strong> ({selectedService.duration_minutes} mins)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(selectedService.format === 'both' || selectedService.format === 'online') && (
                  <div
                    onClick={() => setSelectedFormat('online')}
                    className={`p-6 bg-[#E9EDE4] border rounded-sm cursor-pointer transition-all ${
                      selectedFormat === 'online' ? 'border-[#285748] ring-1 ring-[#285748]' : 'border-[#D9DCD2]'
                    }`}
                  >
                    <Video className="w-6 h-6 text-[#285748] mb-3" />
                    <h3 className="font-serif text-lg font-medium text-[#192B2A]">Online Video Consultation</h3>
                    <p className="text-xs text-[#52605A] mt-2 leading-relaxed">
                      Conducted via private video meeting (Google Meet / Zoom). The meeting link is delivered upon confirmation.
                    </p>
                  </div>
                )}

                {(selectedService.format === 'both' || selectedService.format === 'in_person') && (
                  <div
                    onClick={() => setSelectedFormat('in_person')}
                    className={`p-6 bg-[#E9EDE4] border rounded-sm cursor-pointer transition-all ${
                      selectedFormat === 'in_person' ? 'border-[#285748] ring-1 ring-[#285748]' : 'border-[#D9DCD2]'
                    }`}
                  >
                    <Building className="w-6 h-6 text-[#285748] mb-3" />
                    <h3 className="font-serif text-lg font-medium text-[#192B2A]">In-Person Office Session</h3>
                    <p className="text-xs text-[#52605A] mt-2 leading-relaxed">
                      Held at the researcher&apos;s office in Dar es Salaam (Harbour View Tower, Samora Avenue).
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-[#D9DCD2]">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold border border-[#D9DCD2] text-[#52605A] rounded hover:bg-[#E9EDE4]"
                >
                  ← Back to Services
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337]"
                >
                  Continue to Date Selection →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME SLOT PICKER */}
          {step === 3 && selectedService && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
                Step 3: Choose Date & Time
              </h2>
              <p className="text-xs text-[#52605A]">
                Timezone: <strong className="text-[#192B2A]">Africa/Dar_es_Salaam (EAT, UTC+3)</strong>. Sessions require minimum 24 hours advance notice.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Date Picker */}
                <div className="md:col-span-5 space-y-2">
                  <label htmlFor="booking-date" className="block text-xs font-semibold text-[#192B2A]">
                    Select Date (Monday – Friday)
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    min={minDateStr}
                    max={maxDateStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#E9EDE4] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748]"
                  />
                  <p className="text-[11px] text-[#718079]">
                    Select a weekday within the next 30 days.
                  </p>
                </div>

                {/* Slots List */}
                <div className="md:col-span-7 space-y-2">
                  <label className="block text-xs font-semibold text-[#192B2A]">
                    Available Consultation Slots
                  </label>

                  {!selectedDate ? (
                    <div className="p-6 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center text-xs text-[#52605A]">
                      Please choose a date from the calendar to view available times.
                    </div>
                  ) : loadingSlots ? (
                    <div className="p-6 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center text-xs text-[#52605A] flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#285748]" />
                      <span>Checking researcher availability...</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-6 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center text-xs text-[#52605A]">
                      No available slots on this date (office closed or date blocked). Please try another date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                      {slots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 text-left rounded text-xs border transition-all ${
                            !slot.available
                              ? 'opacity-40 bg-[#DCE3D7] border-[#D9DCD2] cursor-not-allowed'
                              : selectedSlot?.startTime === slot.startTime
                              ? 'bg-[#285748] text-[#F7F5EF] border-[#285748] font-bold'
                              : 'bg-[#E9EDE4] text-[#192B2A] border-[#D9DCD2] hover:border-[#285748]'
                          }`}
                        >
                          <div className="font-mono">{slot.label}</div>
                          {!slot.available && slot.reason && (
                            <div className="text-[10px] text-red-800 mt-0.5">{slot.reason}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#D9DCD2]">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold border border-[#D9DCD2] text-[#52605A] rounded hover:bg-[#E9EDE4]"
                >
                  ← Back to Format
                </button>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(4)}
                  className="px-5 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] disabled:opacity-40"
                >
                  Continue to Your Details →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: GUEST DETAILS & TOPIC */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
                Step 4: Your Contact & Discussion Topic
              </h2>

              <div className="space-y-4 bg-[#E9EDE4] p-6 border border-[#D9DCD2] rounded-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="guest-name" className="block text-xs font-semibold text-[#192B2A] mb-1">
                      Full Name <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Dr. Frank Shirima"
                      className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748]"
                    />
                  </div>

                  <div>
                    <label htmlFor="guest-email" className="block text-xs font-semibold text-[#192B2A] mb-1">
                      Email Address <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="guest-email"
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. frank@example.tz"
                      className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748]"
                    />
                    <p className="text-[11px] text-[#52605A] mt-1">
                      Your booking confirmation and private management link will be sent here.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="guest-topic" className="block text-xs font-semibold text-[#192B2A] mb-1">
                    Discussion Topic & Specific Inquiries <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    id="guest-topic"
                    required
                    rows={4}
                    value={topicSummary}
                    onChange={(e) => setTopicSummary(e.target.value)}
                    placeholder="Briefly state your research project, policy question, or advisory objective (minimum 10 characters)..."
                    className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748]"
                  />
                  <span className="text-[11px] text-[#52605A]">{topicSummary.length} characters</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#D9DCD2]">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-semibold border border-[#D9DCD2] text-[#52605A] rounded hover:bg-[#E9EDE4]"
                >
                  ← Back to Slot Selection
                </button>
                <button
                  disabled={!guestName.trim() || !guestEmail.includes('@') || topicSummary.trim().length < 10}
                  onClick={() => setStep(5)}
                  className="px-5 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] disabled:opacity-40"
                >
                  Review Booking Request →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {step === 5 && selectedService && selectedSlot && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
                Step 5: Review & Submit Booking Request
              </h2>

              <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
                <div className="border-b border-[#D9DCD2] pb-3 space-y-1">
                  <h3 className="font-serif text-xl font-medium text-[#192B2A]">
                    {selectedService.name}
                  </h3>
                  <p className="text-xs text-[#52605A]">
                    {selectedService.duration_minutes} Minutes • Format: {selectedFormat === 'online' ? 'Online Video' : 'In-Person at Office'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#52605A]">
                  <div>
                    <span className="block font-semibold text-[#192B2A]">Scheduled Time (EAT):</span>
                    <span className="font-mono text-sm text-[#285748]">{selectedSlot.label}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[#192B2A]">Quoted Advisory Fee:</span>
                    <span className="font-semibold text-sm text-[#192B2A]">
                      {selectedService.is_paid ? `${selectedService.currency} ${selectedService.price_amount}` : 'Free Mentorship Session'}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[#192B2A]">Guest Name:</span>
                    <span>{guestName}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[#192B2A]">Guest Email:</span>
                    <span>{guestEmail}</span>
                  </div>
                </div>

                <div className="border-t border-[#D9DCD2] pt-3 text-xs text-[#52605A]">
                  <span className="block font-semibold text-[#192B2A] mb-1">Discussion Topic:</span>
                  <p className="bg-[#F7F5EF] p-3 rounded border border-[#DCE3D7] text-[#192B2A]">
                    {topicSummary}
                  </p>
                </div>

                {selectedService.is_paid ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded">
                    <strong>Payment Terms:</strong> Payments are handled outside this website via direct bank transfer or M-Pesa. Your slot is reserved immediately upon request, and full payment remittance details will be provided on your confirmation page.
                  </div>
                ) : (
                  <div className="p-3 bg-[#DCE3D7] border border-[#285748] text-xs text-[#192B2A] rounded">
                    <strong>Free Mentorship:</strong> This session is offered without charge to support Tanzanian economics researchers and graduate students.
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-[#D9DCD2]">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 text-xs font-semibold border border-[#D9DCD2] text-[#52605A] rounded hover:bg-[#E9EDE4]"
                >
                  ← Edit Details
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBookingSubmit}
                  className="px-6 py-2.5 text-sm font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Reserving Slot...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Reserve Slot</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
