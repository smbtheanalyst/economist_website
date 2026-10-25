import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { getSiteSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Privacy & Data Protection Policy',
  description: 'How consultation bookings, inquiries, and publication subscriptions are handled and protected.',
};

export default function PrivacyPage() {
  const settings = getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Operational Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Privacy & Data Protection Notice
        </h1>
        <p className="text-sm text-[#52605A]">
          Last revised: October 2026 • Office of {settings.researcher_name}, Dar es Salaam, Tanzania
        </p>
      </div>

      {/* Mandatory Client Review Banner as required by prompt */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Notice to Client Legal / Administrative Review:</p>
          <p>
            [CLIENT REVIEW NEEDED]: This baseline privacy statement outlines the actual technical data flows implemented in this web platform (consultation reservations, visitor question submissions, and double opt-in email notifications). Please review with Tanzanian Data Protection Act (2022) legal counsel to adjust corporate registration details prior to formal public launch.
          </p>
        </div>
      </div>

      <div className="prose-editorial text-sm text-[#192B2A] leading-relaxed space-y-6">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
            1. Core Information Collected
          </h2>
          <p>
            This website operates with strict data minimization principles. We do not use third-party behavioral advertising trackers, commercial cookies, or cross-site tracking scripts.
          </p>
          <ul>
            <li><strong>Consultation Bookings:</strong> We collect your full name, email address, selected meeting format, and a brief discussion topic to coordinate the advisory session. No account creation or password is required.</li>
            <li><strong>Visitor Questions:</strong> We collect your name, email, and message text solely to allow the researcher to review and formulate an academic response. Submitting a question does not opt you into marketing campaigns.</li>
            <li><strong>Email Subscriptions:</strong> We collect your email address and optional name with explicit double opt-in verification. Subscribers may unsubscribe at any time using the one-click unsubscribe link provided in every notification.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
            2. Payment & Financial Data
          </h2>
          <p>
            <strong>No financial transaction processing occurs on this website.</strong> We do not ask for, capture, or store credit card numbers, mobile money PINs, or banking passwords. For paid consultations, remittance instructions are provided for independent execution via authorized Tanzanian banking channels or verified mobile money services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
            3. Data Retention & Access Rights
          </h2>
          <p>
            Consultation records and question submissions are stored securely in encrypted administrative databases. You may request deletion or correction of your submitted inquiries or cancellation of active bookings at any time by contacting:
          </p>
          <p className="font-medium text-[#285748]">
            {settings.contact_email ? (
              <>Email: <a href={`mailto:${settings.contact_email}`} className="underline">{settings.contact_email}</a><br /></>
            ) : (
              <>Official contact email pending activation. Inquiries may be submitted via the website inquiry form.<br /></>
            )}
            Address: {settings.office_address}
          </p>
        </section>
      </div>
    </div>
  );
}
