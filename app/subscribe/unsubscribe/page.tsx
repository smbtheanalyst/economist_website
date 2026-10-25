import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { getDb } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Unsubscribe from Publications',
};

interface UnsubPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubPageProps) {
  const { token } = await searchParams;
  let success = false;
  let message = '';

  if (!token || token.length < 20) {
    message = 'Invalid unsubscribe token provided.';
  } else {
    const db = getDb();
    const subscriber = db.prepare(`SELECT * FROM subscribers WHERE unsubscribe_token = ?`).get(token) as {
      id: number;
      email: string;
      status: string;
    } | undefined;

    if (!subscriber) {
      message = 'Unsubscribe token not found or already processed.';
    } else {
      db.prepare(`
        UPDATE subscribers
        SET status = 'unsubscribed', updated_at = datetime('now')
        WHERE id = ?
      `).run(subscriber.id);
      success = true;
      message = `You have been successfully unsubscribed. (${subscriber.email}) will no longer receive publication notifications.`;
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
            {success ? 'Unsubscribed' : 'Unsubscribe Request'}
          </h1>
        </div>

        <p className="text-sm text-[#192B2A] leading-relaxed">
          {message}
        </p>

        <div className="pt-4 border-t border-[#D9DCD2]">
          <Link
            href="/"
            className="px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
