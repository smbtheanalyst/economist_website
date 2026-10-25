'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setStatus('error');
      setMessage('Please check the consent box to confirm your subscription request.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, consent }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit subscription.');
      }

      setStatus('success');
      setMessage(data.message || 'Please check your email to confirm your subscription.');
      setEmail('');
      setName('');
      setConsent(false);
    } catch (err: unknown) {
      setStatus('error');
      setMessage((err as Error).message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 sm:p-8 rounded-sm">
      <div className="max-w-xl">
        <h3 className="font-serif text-2xl font-medium text-[#192B2A] tracking-tight">
          Subscribe to Economic Research & Commentary
        </h3>
        <p className="text-sm text-[#52605A] mt-2 leading-relaxed">
          Receive occasional notifications when new working papers, empirical insights, or Tanzania policy analyses are published. We practice double opt-in verification and respect your inbox privacy.
        </p>

        {status === 'success' ? (
          <div className="mt-5 p-4 bg-[#DCE3D7] border border-[#285748] rounded text-[#192B2A] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#285748] mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-[#285748]">Verification Link Dispatched</p>
              <p className="mt-1 text-[#192B2A]">{message}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="sub-name" className="block text-xs font-medium text-[#52605A] mb-1">
                  Full Name <span className="text-xs text-[#718079]">(Optional)</span>
                </label>
                <input
                  id="sub-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Mwita"
                  className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748] focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="sub-email" className="block text-xs font-medium text-[#52605A] mb-1">
                  Email Address <span className="text-red-700">*</span>
                </label>
                <input
                  id="sub-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. maria@example.tz"
                  className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="sub-consent"
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#285748] border-[#D9DCD2] rounded focus:ring-[#285748]"
              />
              <label htmlFor="sub-consent" className="text-xs text-[#52605A] leading-normal">
                I agree to receive research publication notifications. I understand I can unsubscribe anytime via the link provided in every email.
              </label>
            </div>

            {status === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Subscribe to Publications</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
