import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Subscription Verification',
};

interface VerifyPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifySubscriptionPage({ searchParams }: VerifyPageProps) {
  const { token } = await searchParams;
  const settings = getSiteSettings();
  let success = false;
  let message = '';

  if (!token || token.length < 20) {
    message = 'Invalid or missing verification token.';
  } else {
    const db = getDb();
    const subscriber = db.prepare(`SELECT * FROM subscribers WHERE verification_token = ?`).get(token) as {
      id: number;
      email: string;
      status: string;
    } | undefined;

    if (!subscriber) {
      message = 'Verification token is invalid or has already been used.';
    } else {
      db.prepare(`
        UPDATE subscribers
        SET status = 'confirmed', verified_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).run(subscriber.id);
      success = true;
      message = `Your email (${subscriber.email}) is now verified and active. You will receive notifications when new research or insights are published.`;
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-8 rounded-sm space-y-6">
        <div className="flex items-center gap-3">
          {success ? (
            <CheckCircle2 className="w-8 h-8 text-[#285748] shrink-0" />
          ) : (
            <AlertCircle className="w-8 h-8 text-amber-700 shrink-0" />
          )}
          <h1 className="font-serif text-3xl font-medium text-[#192B2A]">
            {success ? 'Subscription Confirmed' : 'Verification Status'}
          </h1>
        </div>

        <p className="text-sm text-[#192B2A] leading-relaxed">
          {message}
        </p>

        <div className="pt-4 border-t border-[#D9DCD2] flex gap-4">
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <span>Explore Ideas & Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#DCE3D7] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
