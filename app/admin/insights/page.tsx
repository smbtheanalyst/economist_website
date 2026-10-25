'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, Send, CheckCircle2, AlertCircle, Loader2, X, Star } from 'lucide-react';

interface Insight {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  topic: string;
  cover_image_url: string;
  read_time_minutes: number;
  is_featured: number;
  status: 'draft' | 'published';
  published_at: string | null;
  is_demo: number;
  created_at: string;
}

export default function AdminInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Insight> | null>(null);
  const [saving, setSaving] = useState(false);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInsights = () => {
    setLoading(true);
    fetch('/api/admin/insights')
      .then((res) => res.json())
      .then((data) => {
        setInsights(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg('Failed to load insights');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');

      setEditingItem(null);
      fetchInsights();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/admin/insights?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchInsights();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete');
    }
  };

  const handleNotifySubscribers = async (insight: Insight) => {
    if (!window.confirm(`Dispatch email notification to confirmed subscribers for "${insight.title}"?`)) return;

    setNotifyingId(insight.id);
    setNotificationMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/insights/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId: insight.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch notification');

      setNotificationMsg(data.message || `Dispatched to ${data.sentCount} subscribers.`);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Notification dispatch failed');
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Ideas & Insights Management
          </h2>
          <p className="text-xs text-[#52605A]">
            Publish economic analysis, macroeconomic commentary, and dispatch subscriber alerts.
          </p>
        </div>
        <button
          onClick={() =>
            setEditingItem({
              title: '',
              slug: '',
              summary: '',
              content_html: '<p class="lead">Article introduction...</p>\n<h2>Section Heading</h2>\n<p>Body text...</p>',
              topic: 'Macroeconomics',
              read_time_minutes: 5,
              is_featured: 0,
              status: 'draft',
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Article</span>
        </button>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-900 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Articles Table */}
      {loading ? (
        <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
          <span>Loading articles...</span>
        </div>
      ) : (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#192B2A]">
            <thead className="bg-[#DCE3D7] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Title & Summary</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DCD2]">
              {insights.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F5EF] transition-colors">
                  <td className="p-3 max-w-sm">
                    <div className="font-serif text-sm font-medium text-[#192B2A] flex items-center gap-1.5">
                      {item.is_featured === 1 && (
                        <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[#52605A] line-clamp-1 mt-0.5">{item.summary}</p>
                    <span className="text-[10px] text-[#718079] font-mono">/insights/{item.slug}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#F7F5EF] rounded border border-[#DCE3D7] font-medium">
                      {item.topic}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.status === 'published'
                          ? 'bg-green-100 text-green-900 border border-green-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-[#52605A]">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Draft'}
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <Link
                      href={`/insights/${item.slug}?preview=true`}
                      target="_blank"
                      className="p-1.5 text-[#52605A] hover:text-[#285748] inline-block"
                      title="Preview Article"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-[#52605A] hover:text-[#285748] inline-block"
                      title="Edit Article"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {item.status === 'published' && (
                      <button
                        onClick={() => handleNotifySubscribers(item)}
                        disabled={notifyingId === item.id}
                        className="p-1.5 text-[#285748] hover:text-[#1e4337] inline-block disabled:opacity-50"
                        title="Dispatch Subscriber Alert"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-700 hover:text-red-900 inline-block"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {insights.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#52605A]">
                    No articles found. Click New Article to create your first publication.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] w-full max-w-3xl rounded-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center border-b border-[#D9DCD2] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#192B2A]">
                {editingItem.id ? 'Edit Article' : 'Create New Insight Article'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#52605A] hover:text-[#192B2A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Article Title <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Headline"
                    className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Slug / URL identifier
                  </label>
                  <input
                    type="text"
                    value={editingItem.slug || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                    className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Topic / Category
                  </label>
                  <input
                    type="text"
                    value={editingItem.topic || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, topic: e.target.value })}
                    placeholder="e.g. Fiscal Policy"
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Estimated Read Time (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={editingItem.read_time_minutes || 5}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, read_time_minutes: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Publication State
                  </label>
                  <select
                    value={editingItem.status || 'draft'}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, status: e.target.value as 'draft' | 'published' })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded font-medium"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">
                  Editorial Summary / Standfirst
                </label>
                <textarea
                  rows={2}
                  value={editingItem.summary || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  placeholder="Concise 1-2 sentence lead summary..."
                  className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">
                  Full Rich-Text Content (HTML)
                </label>
                <textarea
                  rows={10}
                  value={editingItem.content_html || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, content_html: e.target.value })}
                  placeholder="<p>Article paragraphs, <h2>headings, <blockquote>quotes...</p>"
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="is-featured"
                  type="checkbox"
                  checked={Boolean(editingItem.is_featured)}
                  onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 text-[#285748] rounded"
                />
                <label htmlFor="is-featured" className="text-xs font-medium text-[#192B2A]">
                  Featured Lead Article (Highlight prominently on homepage & insights top)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D9DCD2]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-[#D9DCD2] text-[#52605A] rounded hover:bg-[#DCE3D7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
