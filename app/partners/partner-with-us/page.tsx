'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Handshake,
  Building2,
  CheckCircle2,
  Mail,
  Shield,
  ArrowLeft,
  Send,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function PartnerWithUsPage() {
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [collaborationType, setCollaborationType] = useState('Joint Economic Research');
  const [scopeDetails, setScopeDetails] = useState('');
  const [websiteHp, setWebsiteHp] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!orgName.trim() || !contactName.trim() || !email.trim() || !scopeDetails.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    const fullMessage = `[Institutional Partnership Inquiry - ${orgName.trim()}]\nOrganization: ${orgName.trim()}\nContact Person: ${contactName.trim()}\nFocus / Collaboration Type: ${collaborationType}\n\nPartnership Scope & Objectives:\n${scopeDetails.trim()}`;

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${contactName.trim()} (${orgName.trim()})`,
          email: email.trim(),
          message: fullMessage,
          website_hp: websiteHp,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Failed to submit partnership inquiry. Please try again.');
      }
    } catch {
      setErrorMsg('Network error submitting inquiry. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">
      {/* Return link */}
      <div>
        <Link
          href="/partners"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#285748] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Partners Directory</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Institutional Engagement Framework
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Partner With TEFPC
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-2xl leading-relaxed">
          We collaborate with multilateral institutions, government ministries, regional economic communities, universities, and research institutes across Africa and globally.
        </p>
      </div>

      {/* Collaboration Modalities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm space-y-2">
          <h3 className="font-serif font-bold text-base text-[#192B2A]">
            1. Joint Policy Studies
          </h3>
          <p className="text-xs text-[#52605A] leading-relaxed">
            Co-authored empirical research, econometric modeling, macroeconomic policy briefs, and sectoral evaluations for public dissemination.
          </p>
        </div>

        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm space-y-2">
          <h3 className="font-serif font-bold text-base text-[#192B2A]">
            2. Policy Dialogues & Forums
          </h3>
          <p className="text-xs text-[#52605A] leading-relaxed">
            Co-hosting economic symposiums, closed-door policy roundtables, and technical workshops bringing together policymakers, academia, and the private sector.
          </p>
        </div>

        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm space-y-2">
          <h3 className="font-serif font-bold text-base text-[#192B2A]">
            3. Commissioned Advisory
          </h3>
          <p className="text-xs text-[#52605A] leading-relaxed">
            Rigorous, independent technical advisory on sovereign debt sustainability, fiscal policy rules, trade integration, and financial sector reforms.
          </p>
        </div>
      </div>

      {/* Partnership Enquiry Form */}
      <div className="bg-white border border-[#D9DCD2] p-6 sm:p-8 rounded-md space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#192B2A]">
            Submit a Partnership Enquiry
          </h2>
          <p className="text-xs sm:text-sm text-[#52605A] mt-1">
            Enquiries are directed securely to TEFPC’s senior research and executive leadership. TEFPC does not send unsolicited correspondence.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-green-900">
              Partnership Enquiry Received
            </h3>
            <p className="text-xs text-green-800 max-w-md mx-auto leading-relaxed">
              Thank you for reaching out to TEFPC. Our research leadership will review your organization’s proposal and follow up via email.
            </p>
            <div className="pt-2">
              <Link
                href="/research"
                className="inline-block px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337]"
              >
                Explore TEFPC Publications
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Honeypot anti-spam field (hidden) */}
            <input
              type="text"
              name="website_hp"
              value={websiteHp}
              onChange={(e) => setWebsiteHp(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Organization / Institution Name *
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Ministry of Finance, University, UN Agency"
                  className="w-full p-2.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Collaboration Modality *
                </label>
                <select
                  value={collaborationType}
                  onChange={(e) => setCollaborationType(e.target.value)}
                  className="w-full p-2.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A] bg-white"
                >
                  <option value="Joint Economic Research">Joint Economic Research</option>
                  <option value="Policy Dialogue Co-Hosting">Policy Dialogue / Symposium Co-Hosting</option>
                  <option value="Technical Advisory / Evaluation">Technical Advisory / Evaluation</option>
                  <option value="Capacity Building & Training">Capacity Building & Training</option>
                  <option value="Institutional MoU / Collaboration">Institutional MoU</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Contact Person Name & Title *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe, Director of Research"
                  className="w-full p-2.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. j.doe@organization.org"
                  className="w-full p-2.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block text-[#192B2A] mb-1">
                Proposed Partnership Scope & Objectives *
              </label>
              <textarea
                value={scopeDetails}
                onChange={(e) => setScopeDetails(e.target.value)}
                placeholder="Please outline the research theme, proposed timeline, institutional alignment, and expected outputs..."
                rows={5}
                className="w-full p-2.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337] transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting Enquiry...' : 'Submit Partnership Enquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
