'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Clock, Archive, Loader2, X, MessageSquare, Trash2 } from 'lucide-react';

interface Question {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'answered' | 'archived';
  admin_notes: string;
  email_delivery_status: string;
  created_at: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'all' | 'new' | 'read' | 'answered' | 'archived'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchQuestions = (status = currentTab) => {
    setLoading(true);
    fetch(`/api/admin/questions?status=${status}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load questions:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions(currentTab);
  }, [currentTab]);

  const handleOpenModal = (q: Question) => {
    setSelectedQuestion(q);
    setAdminNotes(q.admin_notes || '');
    // If it was 'new', automatically mark as 'read'
    if (q.status === 'new') {
      fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: q.id, status: 'read' }),
      }).then(() => {
        q.status = 'read';
        setQuestions([...questions]);
      });
    }
  };

  const handleUpdateStatus = async (status: 'new' | 'read' | 'answered' | 'archived') => {
    if (!selectedQuestion) return;
    setSaving(true);
    try {
      await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedQuestion.id,
          status,
          admin_notes: adminNotes,
        }),
      });
      setSelectedQuestion({ ...selectedQuestion, status, admin_notes: adminNotes });
      fetchQuestions();
    } catch (err) {
      alert('Failed to update question status');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this question inquiry permanently?')) return;
    try {
      await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Inquiries & Questions Inbox
          </h2>
          <p className="text-xs text-[#52605A]">
            Visitor questions on macroeconomic trends, research methodologies, and policy evaluations.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9DCD2] pb-2 text-xs font-medium">
        {(['all', 'new', 'read', 'answered', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`px-3 py-1.5 rounded transition-colors uppercase tracking-wider text-[11px] ${
              currentTab === tab
                ? 'bg-[#285748] text-[#F7F5EF] font-bold'
                : 'bg-[#E9EDE4] text-[#52605A] hover:bg-[#DCE3D7]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
          <span>Loading inquiries...</span>
        </div>
      ) : (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#192B2A]">
            <thead className="bg-[#DCE3D7] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Visitor Name & Email</th>
                <th className="p-3">Message Excerpt</th>
                <th className="p-3">Received (EAT)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DCD2]">
              {questions.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => handleOpenModal(q)}
                  className="hover:bg-[#F7F5EF] transition-colors cursor-pointer"
                >
                  <td className="p-3">
                    <p className="font-semibold text-[#192B2A]">{q.name}</p>
                    <p className="text-[11px] text-[#52605A]">{q.email}</p>
                  </td>
                  <td className="p-3 max-w-md">
                    <p className="text-[#52605A] line-clamp-2">{q.message}</p>
                    {q.admin_notes && (
                      <span className="text-[10px] text-[#285748] font-semibold">
                        Notes: {q.admin_notes}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[#52605A] whitespace-nowrap">
                    {new Date(q.created_at).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        q.status === 'new'
                          ? 'bg-emerald-700 text-white'
                          : q.status === 'read'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : q.status === 'answered'
                          ? 'bg-green-100 text-green-900 border border-green-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#52605A]">
                    No inquiries found in this tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] w-full max-w-2xl rounded-sm p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#D9DCD2] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#285748]">
                  Visitor Question #{selectedQuestion.id}
                </span>
                <h3 className="font-serif text-xl font-medium text-[#192B2A]">
                  From: {selectedQuestion.name}
                </h3>
              </div>
              <button onClick={() => setSelectedQuestion(null)} className="text-[#52605A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#52605A] bg-[#F7F5EF] p-3 rounded border border-[#D9DCD2]">
              <div>
                <span className="font-semibold text-[#192B2A]">Email:</span>{' '}
                <a href={`mailto:${selectedQuestion.email}`} className="text-[#285748] underline">
                  {selectedQuestion.email}
                </a>
              </div>
              <div>
                <span className="font-semibold text-[#192B2A]">Received:</span>{' '}
                {new Date(selectedQuestion.created_at).toLocaleString('en-GB')}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#192B2A]">Message:</span>
              <div className="p-4 bg-[#F7F5EF] border border-[#D9DCD2] rounded text-sm text-[#192B2A] leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                {selectedQuestion.message}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#192B2A]">Private Admin Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes regarding response or background research..."
                className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]"
              />
            </div>

            {/* Status Actions */}
            <div className="pt-3 border-t border-[#D9DCD2] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#192B2A]">Mark As:</span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('read')}
                  className="px-2.5 py-1 bg-[#DCE3D7] rounded hover:bg-[#c8cfc2]"
                >
                  Read
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('answered')}
                  className="px-2.5 py-1 bg-green-200 text-green-900 rounded font-semibold hover:bg-green-300"
                >
                  Answered
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('archived')}
                  className="px-2.5 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Archived
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedQuestion.email}?subject=RE: Your Question to the Economist`}
                  className="px-3 py-1.5 bg-[#285748] text-white rounded font-semibold hover:bg-[#1e4337] inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
                <button
                  onClick={() => handleDelete(selectedQuestion.id)}
                  className="p-1.5 text-red-700 hover:text-red-900"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
