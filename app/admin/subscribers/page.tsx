'use client';

import React, { useState, useEffect } from 'react';
import { Users, Trash2, UserX, Loader2, CheckCircle2, Shield } from 'lucide-react';

interface Subscriber {
  id: number;
  email: string;
  name: string;
  status: 'pending_verification' | 'confirmed' | 'unsubscribed';
  verified_at: string | null;
  created_at: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchSubscribers = () => {
    setLoading(true);
    fetch('/api/admin/subscribers')
      .then((res) => res.json())
      .then((data) => {
        setSubscribers(data.subscribers || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load subscribers:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleAction = async (id: number, action: 'unsubscribe' | 'delete') => {
    if (!window.confirm(`Perform ${action} on this subscriber?`)) return;
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error('Action failed');
      setMsg(`Subscriber ${action === 'unsubscribe' ? 'unsubscribed' : 'removed'}.`);
      fetchSubscribers();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const confirmedCount = subscribers.filter((s) => s.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Email Subscribers ({subscribers.length})
          </h2>
          <p className="text-xs text-[#52605A]">
            Double opt-in verified readership list for publication announcements.
          </p>
        </div>
        <div className="text-xs font-semibold bg-[#E9EDE4] px-3 py-1.5 rounded border border-[#D9DCD2] text-[#285748]">
          Confirmed Active: {confirmedCount}
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-900 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
          <span>Loading subscriber records...</span>
        </div>
      ) : (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#192B2A]">
            <thead className="bg-[#DCE3D7] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Subscriber Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Opt-In Status</th>
                <th className="p-3">Subscribed Date</th>
                <th className="p-3">Verified Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DCD2]">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#F7F5EF] transition-colors">
                  <td className="p-3 font-medium text-[#192B2A]">{sub.email}</td>
                  <td className="p-3 text-[#52605A]">{sub.name || '—'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === 'confirmed'
                          ? 'bg-green-100 text-green-900 border border-green-300'
                          : sub.status === 'pending_verification'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-[#52605A]">
                    {new Date(sub.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-3 text-[#52605A]">
                    {sub.verified_at ? new Date(sub.verified_at).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    {sub.status === 'confirmed' && (
                      <button
                        onClick={() => handleAction(sub.id, 'unsubscribe')}
                        className="p-1 text-[#52605A] hover:text-[#192B2A]"
                        title="Unsubscribe"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(sub.id, 'delete')}
                      className="p-1 text-red-700 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#52605A]">
                    No subscribers recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
