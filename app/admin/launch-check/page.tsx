'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

interface CheckItem {
  id: string;
  category: string;
  label: string;
  status: 'pass' | 'warning' | 'pending';
  detail: string;
}

export default function AdminLaunchCheckPage() {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallReady, setOverallReady] = useState(false);

  const runChecks = () => {
    setLoading(true);
    fetch('/api/admin/launch-check')
      .then((res) => res.json())
      .then((data) => {
        setChecks(data.checks || []);
        setOverallReady(Boolean(data.overallReady));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to run launch checks:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    runChecks();
  }, []);

  const categories = Array.from(new Set(checks.map((c) => c.category)));

  const passCount = checks.filter((c) => c.status === 'pass').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;
  const pendingCount = checks.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Production Launch Readiness Checks
          </h2>
          <p className="text-xs text-[#52605A]">
            Automated evaluation of remaining placeholders, demonstration content, email credentials, and client assets.
          </p>
        </div>

        <button
          onClick={runChecks}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#D9DCD2] bg-[#E9EDE4] text-[#192B2A] rounded hover:bg-[#DCE3D7]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-run Checks</span>
        </button>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
          <span className="text-2xl font-serif font-bold text-green-900">{passCount}</span>
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mt-1">Ready / Passed</p>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-center">
          <span className="text-2xl font-serif font-bold text-amber-900">{warningCount}</span>
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mt-1">Review Recommended</p>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
          <span className="text-2xl font-serif font-bold text-red-900">{pendingCount}</span>
          <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mt-1">Pending Assets</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
          <span>Evaluating site components...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const items = checks.filter((c) => c.category === cat);
            return (
              <div key={cat} className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm p-5 space-y-3">
                <h3 className="font-serif text-lg font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
                  {cat}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#F7F5EF] border border-[#D9DCD2] rounded flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {item.status === 'pass' && (
                            <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                          )}
                          {item.status === 'warning' && (
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          )}
                          {item.status === 'pending' && (
                            <XCircle className="w-4 h-4 text-red-700 shrink-0" />
                          )}
                          <span className="font-semibold text-[#192B2A]">{item.label}</span>
                        </div>
                        <p className="text-[#52605A] pl-6 leading-relaxed">{item.detail}</p>
                      </div>

                      <div className="shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'pass'
                              ? 'bg-green-100 text-green-900'
                              : item.status === 'warning'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action links */}
      <div className="pt-4 border-t border-[#D9DCD2] flex flex-wrap gap-4">
        <Link
          href="/admin/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337]"
        >
          <span>Update Client Profile & Upload Assets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/admin/demo-data"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#E9EDE4]"
        >
          <span>Clear Demonstration Data Tool</span>
        </Link>
      </div>
    </div>
  );
}
