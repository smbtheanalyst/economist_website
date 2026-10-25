'use client';

import React, { useState } from 'react';
import { Database, Trash2, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminDemoDataPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleAction = async (action: 'seed' | 'clear') => {
    const confirmText =
      action === 'clear'
        ? 'Are you sure you want to remove all demonstration articles, papers, and events? This prepares the site for real client data.'
        : 'Re-seed database with demonstration articles and sample events?';

    if (!window.confirm(confirmText)) return;

    setLoading(true);
    setMsg('');
    setError('');

    try {
      const res = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setMsg(data.message || 'Operation completed successfully.');
    } catch (err: unknown) {
      setError((err as Error).message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="border-b border-[#D9DCD2] pb-4">
        <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
          Demonstration Content Tools
        </h2>
        <p className="text-xs text-[#52605A]">
          Easily populate or purge demonstration editorial articles, publications, events, and placeholder parameters.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-900 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clear Demo Content Card */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-red-100 text-red-800 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#192B2A]">
              Clear Demonstration Content
            </h3>
            <p className="text-xs text-[#52605A] leading-relaxed">
              Deletes all sample demonstration articles, working papers, events, and resets the site settings to clean production blanks ready for the client&apos;s real information.
            </p>
          </div>

          <button
            onClick={() => handleAction('clear')}
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold bg-red-700 text-white rounded hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Purge Demo Content</span>
          </button>
        </div>

        {/* Re-seed Demo Content Card */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#DCE3D7] text-[#285748] flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#192B2A]">
              Populate Demo Content
            </h3>
            <p className="text-xs text-[#52605A] leading-relaxed">
              Populates the database with demonstration economic insights, peer-reviewed papers, Tanzania conferences, and consultation services for testing and evaluation.
            </p>
          </div>

          <button
            onClick={() => handleAction('seed')}
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Seed Demo Content</span>
          </button>
        </div>
      </div>
    </div>
  );
}
