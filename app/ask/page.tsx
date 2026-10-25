'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Send, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';

export default function AskPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [websiteHp, setWebsiteHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<{ message: string; deliveryStatus?: string; disclaimer?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          website_hp: websiteHp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setStatus('success');
      setFeedback(data);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Direct Inquiry
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Ask a Question
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light">
          Have an inquiry regarding Tanzanian macroeconomic policy, research methodologies, or regional trade data? Inquiries are delivered directly to the researcher.
        </p>
      </div>

      {/* Honest Scope Clarification Alert */}
      <div className="p-4 sm:p-5 bg-[#E9EDE4] border-l-4 border-[#285748] rounded-r text-[#192B2A] text-sm space-y-2">
        <p className="font-medium text-[#285748]">Consultation & Scope Notice:</p>
        <p className="text-xs text-[#52605A] leading-relaxed">
          Questions are reviewed periodically and answered when schedule permits. <strong>Submitting a question does not guarantee a free detailed consultation, thesis proofreading, or data modeling assistance.</strong> If your organization requires dedicated advisory time, please{' '}
          <Link href="/consultation" className="text-[#285748] underline font-semibold">
            book a formal consultation session
          </Link>.
        </p>
      </div>

      {status === 'success' && feedback ? (
        <div className="p-8 bg-[#E9EDE4] border border-[#285748] rounded-sm space-y-4">
          <div className="flex items-center gap-3 text-[#285748]">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <h3 className="font-serif text-2xl font-medium text-[#192B2A]">
              Question Recorded Successfully
            </h3>
          </div>

          <p className="text-sm text-[#192B2A] leading-relaxed">
            {feedback.message}
          </p>

          <div className="p-4 bg-[#F7F5EF] rounded border border-[#D9DCD2] text-xs text-[#52605A] space-y-1.5">
            <p>
              <strong>Email dispatch status:</strong>{' '}
              {feedback.deliveryStatus === 'captured_local'
                ? 'Logged in local outbox (Local Development Mode)'
                : feedback.deliveryStatus === 'sent_smtp'
                ? 'Sent via SMTP server'
                : 'Delivery recorded'}
            </p>
            <p className="text-[#718079] italic">{feedback.disclaimer}</p>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => setStatus('idle')}
              className="px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
            >
              Submit Another Inquiry
            </button>
            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#DCE3D7] transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 sm:p-8 rounded-sm space-y-6">
          {/* Honeypot field (hidden from real users) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_hp">Leave this empty</label>
            <input
              type="text"
              id="website_hp"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={websiteHp}
              onChange={(e) => setWebsiteHp(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ask-name" className="block text-xs font-semibold text-[#192B2A] mb-1">
                Your Full Name <span className="text-red-700">*</span>
              </label>
              <input
                id="ask-name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Baraka Mwita"
                className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="ask-email" className="block text-xs font-semibold text-[#192B2A] mb-1">
                Email Address <span className="text-red-700">*</span>
              </label>
              <input
                id="ask-email"
                type="email"
                required
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. baraka@example.tz"
                className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ask-message" className="block text-xs font-semibold text-[#192B2A] mb-1">
              Your Question or Research Inquiry <span className="text-red-700">*</span>
            </label>
            <textarea
              id="ask-message"
              required
              rows={6}
              minLength={10}
              maxLength={3000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="State your specific question or context clearly..."
              className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748] focus:bg-white"
            />
            <div className="flex justify-between items-center text-[11px] text-[#52605A] mt-1">
              <span>Minimum 10 characters</span>
              <span>{message.length} / 3000</span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-[#F7F5EF] rounded border border-[#D9DCD2] text-xs text-[#52605A] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#285748] shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Guarantee:</strong> Your email address and message are stored securely in the researcher&apos;s administration inbox. You will not be automatically enrolled in publication mailings.
            </p>
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Question</span>
                </>
              )}
            </button>

            <Link
              href="/consultation"
              className="text-xs text-[#285748] font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Need scheduled 1-on-1 advisory?</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
