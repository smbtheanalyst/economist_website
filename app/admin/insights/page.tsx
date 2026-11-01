'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Star,
  Newspaper,
  MessageSquare,
  ExternalLink,
  Calendar,
  Upload,
} from 'lucide-react';
import type { NewsArticleItem } from '@/lib/data';
import { RichTextEditor } from '@/components/RichTextEditor';

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

export default function AdminNewsAndInsightsPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'insights'>('news');

  // News State
  const [newsList, setNewsList] = useState<NewsArticleItem[]>([]);
  const [availableProjects, setAvailableProjects] = useState<{ id: number; title: string; slug: string }[]>([]);
  const [availableEvents, setAvailableEvents] = useState<{ id: number; title: string; slug: string }[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [editingNews, setEditingNews] = useState<Partial<NewsArticleItem> | null>(null);
  const [savingNews, setSavingNews] = useState(false);
  const [isUploadingNewsGallery, setIsUploadingNewsGallery] = useState(false);

  // Insights State
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [editingInsight, setEditingInsight] = useState<Partial<Insight> | null>(null);
  const [savingInsight, setSavingInsight] = useState(false);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  const [notificationMsg, setNotificationMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchNews = () => {
    setLoadingNews(true);
    fetch('/api/admin/news')
      .then((res) => res.json())
      .then((data) => {
        setNewsList(data.news || []);
        setAvailableProjects(data.availableProjects || []);
        setAvailableEvents(data.availableEvents || []);
        setLoadingNews(false);
      })
      .catch(() => {
        setErrorMsg('Failed to load institutional news');
        setLoadingNews(false);
      });
  };

  const fetchInsights = () => {
    setLoadingInsights(true);
    fetch('/api/admin/insights')
      .then((res) => res.json())
      .then((data) => {
        setInsights(data.items || []);
        setLoadingInsights(false);
      })
      .catch(() => {
        setErrorMsg('Failed to load commentary insights');
        setLoadingInsights(false);
      });
  };

  useEffect(() => {
    fetchNews();
    fetchInsights();
  }, []);

  const handleOpenCreateNews = () => {
    setEditingNews({
      title: '',
      slug: '',
      summary: '',
      content_html: '',
      category: 'Institutional News',
      published_date: new Date().toISOString().split('T')[0],
      status: 'draft',
      is_featured: 0,
      cover_image_url: '',
      cover_image_alt: '',
      gallery_images: [],
      related_project_ids: [],
      related_event_ids: [],
    } as any);
  };

  const handleOpenEditNews = (item: NewsArticleItem) => {
    let gallery_images: { url: string; caption?: string }[] = [];
    let related_project_ids: number[] = [];
    let related_event_ids: number[] = [];
    try { gallery_images = JSON.parse(item.gallery_images_json || '[]'); } catch {}
    try { related_project_ids = JSON.parse(item.related_project_ids_json || '[]'); } catch {}
    try { related_event_ids = JSON.parse(item.related_event_ids_json || '[]'); } catch {}

    setEditingNews({
      ...item,
      gallery_images,
      related_project_ids,
      related_event_ids,
    } as any);
  };

  // News Handlers
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    setSavingNews(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingNews),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save news article');

      setEditingNews(null);
      fetchNews();
      setNotificationMsg('News article saved successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Save failed');
    } finally {
      setSavingNews(false);
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchNews();
      setNotificationMsg('News article deleted.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleToggleNewsStatus = async (id: number, currentStatus: string) => {
    const action = currentStatus === 'published' ? 'unpublish' : 'publish';
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        fetchNews();
      }
    } catch {
      setErrorMsg('Error updating status');
    }
  };

  // Insights Handlers
  const handleSaveInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInsight) return;
    setSavingInsight(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingInsight),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');

      setEditingInsight(null);
      fetchInsights();
      setNotificationMsg('Insight article saved successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Save failed');
    } finally {
      setSavingInsight(false);
    }
  };

  const handleDeleteInsight = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/admin/insights?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchInsights();
      setNotificationMsg('Insight article deleted.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Notification dispatch failed');
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
            Editorial & Public Announcements
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            News & Editorial Insights
          </h1>
          <p className="text-xs text-[#52605A]">
            Manage institutional announcements, policy dialogue updates, and economic research insights.
          </p>
        </div>

        {activeTab === 'news' ? (
          <button
            type="button"
            onClick={handleOpenCreateNews}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Announcement</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              setEditingInsight({
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
            <span>New Insight Article</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9DCD2]">
        <button
          type="button"
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'news'
              ? 'border-[#285748] text-[#285748] bg-[#E9EDE4]/40'
              : 'border-transparent text-[#52605A] hover:text-[#192B2A]'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Institutional News & Announcements ({newsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'insights'
              ? 'border-[#285748] text-[#285748] bg-[#E9EDE4]/40'
              : 'border-transparent text-[#52605A] hover:text-[#192B2A]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Economic Commentary & Insights ({insights.length})</span>
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

      {/* TAB 1: Institutional News */}
      {activeTab === 'news' && (
        <>
          {loadingNews ? (
            <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
              <span>Loading news announcements...</span>
            </div>
          ) : newsList.length === 0 ? (
            <div className="bg-white border border-[#D9DCD2] p-8 text-center rounded space-y-2">
              <Newspaper className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm font-semibold text-[#192B2A]">No institutional news announcements yet</p>
              <p className="text-xs text-[#52605A]">Publish official updates, policy dialogue notices, or project releases.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#D9DCD2] rounded-md overflow-hidden">
              <table className="w-full text-left text-xs text-[#192B2A]">
                <thead className="bg-[#E9EDE4] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Title & Category</th>
                    <th className="p-3">Published Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDE4]">
                  {newsList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F7F5EF] transition-colors">
                      <td className="p-3">
                        <div className="font-serif font-bold text-sm text-[#192B2A]">{item.title}</div>
                        <div className="text-[11px] text-gray-500 font-mono">/news/{item.slug}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] bg-[#E9EDE4] text-[#285748] rounded font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">
                        {new Date(item.published_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3">
                        {item.status === 'published' ? (
                          <span className="px-2 py-0.5 text-[10px] bg-green-100 text-green-800 rounded font-semibold">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-semibold">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {item.status === 'published' ? (
                            <a
                              href={`/news/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-gray-600 hover:text-[#285748]"
                              title="View Public Announcement"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <a
                              href={`/admin/preview/news/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-amber-700 hover:text-amber-900"
                              title="Preview Draft Announcement"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleNewsStatus(item.id, item.status)}
                            className={`px-2 py-1 text-[10px] font-semibold rounded ${
                              item.status === 'published'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-green-50 text-green-800 border border-green-200'
                            }`}
                          >
                            {item.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditNews(item)}
                            className="p-1 text-gray-600 hover:text-[#285748]"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* TAB 2: Ideas & Insights Commentary */}
      {activeTab === 'insights' && (
        <>
          {loadingInsights ? (
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
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-white border border-[#D9DCD2] rounded text-[11px]">
                          {item.topic}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            item.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#52605A]">
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Draft'}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {item.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => handleNotifySubscribers(item)}
                            disabled={notifyingId === item.id}
                            className="px-2 py-1 bg-[#285748] text-white rounded hover:bg-[#1e4337] inline-flex items-center gap-1 text-[11px] disabled:opacity-50"
                            title="Dispatch email notification to verified subscribers"
                          >
                            <Send className="w-3 h-3" />
                            <span>{notifyingId === item.id ? 'Sending...' : 'Notify'}</span>
                          </button>
                        )}
                        <a
                          href={`/insights/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#52605A] hover:text-[#285748] inline-block"
                          title="View public page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setEditingInsight(item)}
                          className="p-1.5 text-[#52605A] hover:text-[#285748] inline-block"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInsight(item.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 inline-block"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal: Edit News Article */}
      {editingNews && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D9DCD2] rounded-md shadow-xl max-w-3xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#192B2A]">
                {editingNews.id ? 'Edit News Announcement' : 'New Institutional Announcement'}
              </h3>
              <button onClick={() => setEditingNews(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editingNews.title || ''}
                    onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                    placeholder="e.g. TEFPC Releases 2026 Economic Outlook"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category *</label>
                  <select
                    value={editingNews.category || 'Institutional News'}
                    onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs bg-white"
                  >
                    <option value="Institutional News">Institutional News</option>
                    <option value="Project Updates">Project Updates</option>
                    <option value="Policy Dialogues">Policy Dialogues</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Publication Date *</label>
                  <input
                    type="date"
                    required
                    value={editingNews.published_date || ''}
                    onChange={(e) => setEditingNews({ ...editingNews, published_date: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status *</label>
                  <select
                    value={editingNews.status || 'draft'}
                    onChange={(e: any) => setEditingNews({ ...editingNews, status: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs bg-white"
                  >
                    <option value="draft">Draft (Unpublished)</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Summary / Excerpt</label>
                <textarea
                  rows={2}
                  value={editingNews.summary || ''}
                  onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                  className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                  placeholder="Concise overview..."
                />
              </div>

              <div>
                <RichTextEditor
                  value={editingNews.content_html || ''}
                  onChange={(val) => setEditingNews({ ...editingNews, content_html: val })}
                  label="Announcement Body"
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9DCD2]">
                <div>
                  <label className="font-semibold block mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={editingNews.cover_image_url || ''}
                    onChange={(e) => setEditingNews({ ...editingNews, cover_image_url: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                    placeholder="/uploads/... or https://..."
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Cover Image Alt Text</label>
                  <input
                    type="text"
                    value={editingNews.cover_image_alt || ''}
                    onChange={(e) => setEditingNews({ ...editingNews, cover_image_alt: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                    placeholder="Accessibility description"
                  />
                </div>
              </div>

              {/* News Photo Gallery */}
              <div className="bg-[#F7F5EF] p-4 rounded border border-[#D9DCD2] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-serif font-bold text-sm text-[#192B2A] block">
                      News Photo Gallery
                    </span>
                    <span className="text-[11px] text-[#52605A]">
                      Upload event photos, press conference stills, or field pictures.
                    </span>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 bg-[#285748] text-white rounded text-xs font-semibold hover:bg-[#1e4337] transition-colors inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingNewsGallery ? 'Uploading...' : 'Add Gallery Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingNewsGallery}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingNewsGallery(true);
                        try {
                          const body = new FormData();
                          body.append('file', file);
                          const res = await fetch('/api/admin/upload', { method: 'POST', body });
                          const json = await res.json();
                          if (res.ok && json.url) {
                            const current = (editingNews as any).gallery_images || [];
                            setEditingNews({
                              ...editingNews,
                              gallery_images: [...current, { url: json.url, caption: '', order: current.length }],
                            } as any);
                          } else {
                            alert(json.error || 'Upload failed');
                          }
                        } catch {
                          alert('Upload failed');
                        } finally {
                          setIsUploadingNewsGallery(false);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {(!((editingNews as any).gallery_images) || (editingNews as any).gallery_images.length === 0) ? (
                  <p className="text-xs text-[#52605A] italic py-1">No gallery photos added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {(editingNews as any).gallery_images.map((img: any, i: number) => (
                      <div key={i} className="flex gap-2 p-2 bg-white rounded border border-[#D9DCD2] items-center">
                        <div className="relative w-14 h-14 rounded overflow-hidden shrink-0 border border-[#D9DCD2] bg-gray-50">
                          <Image src={img.url} alt={img.caption || 'News gallery image'} fill className="object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={(e) => {
                              const newImages = [...(editingNews as any).gallery_images];
                              newImages[i].caption = e.target.value;
                              setEditingNews({ ...editingNews, gallery_images: newImages } as any);
                            }}
                            placeholder="Photo caption / context..."
                            className="w-full p-1 text-xs border border-[#D9DCD2] rounded text-[#192B2A]"
                          />
                          <p className="text-[10px] text-gray-400 font-mono truncate">{img.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = (editingNews as any).gallery_images.filter((_: any, idx: number) => idx !== i);
                            setEditingNews({ ...editingNews, gallery_images: newImages } as any);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Projects & Related Events */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9DCD2]">
                {/* Related Projects */}
                <div className="bg-[#E9EDE4] p-3 rounded border border-[#D9DCD2] space-y-2">
                  <span className="font-serif font-bold text-xs text-[#285748] block">
                    Link Related Institutional Projects
                  </span>
                  <span className="text-[11px] text-[#52605A] block">
                    Select projects associated with this announcement:
                  </span>
                  {availableProjects.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic">No published projects available to link.</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 bg-white p-2 rounded border border-[#D9DCD2]">
                      {availableProjects.map((p) => {
                        const currentIds = (editingNews as any).related_project_ids || [];
                        const isChecked = currentIds.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center gap-2 text-xs text-[#192B2A] cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingNews({ ...editingNews, related_project_ids: [...currentIds, p.id] } as any);
                                } else {
                                  setEditingNews({ ...editingNews, related_project_ids: currentIds.filter((id: number) => id !== p.id) } as any);
                                }
                              }}
                              className="rounded text-[#285748] focus:ring-[#285748]"
                            />
                            <span className="truncate">{p.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Related Events */}
                <div className="bg-[#E9EDE4] p-3 rounded border border-[#D9DCD2] space-y-2">
                  <span className="font-serif font-bold text-xs text-[#285748] block">
                    Link Related Economics Events
                  </span>
                  <span className="text-[11px] text-[#52605A] block">
                    Select dialogue sessions or conferences linked to this news:
                  </span>
                  {availableEvents.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic">No events available to link.</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 bg-white p-2 rounded border border-[#D9DCD2]">
                      {availableEvents.map((ev) => {
                        const currentIds = (editingNews as any).related_event_ids || [];
                        const isChecked = currentIds.includes(ev.id);
                        return (
                          <label key={ev.id} className="flex items-center gap-2 text-xs text-[#192B2A] cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingNews({ ...editingNews, related_event_ids: [...currentIds, ev.id] } as any);
                                } else {
                                  setEditingNews({ ...editingNews, related_event_ids: currentIds.filter((id: number) => id !== ev.id) } as any);
                                }
                              }}
                              className="rounded text-[#285748] focus:ring-[#285748]"
                            />
                            <span className="truncate">{ev.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#D9DCD2]">
                <button
                  type="button"
                  onClick={() => setEditingNews(null)}
                  className="px-4 py-2 border rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNews}
                  className="px-4 py-2 bg-[#285748] text-white rounded text-xs font-semibold hover:bg-[#1e4337]"
                >
                  {savingNews ? 'Saving...' : 'Save Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Insight Article */}
      {editingInsight && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D9DCD2] rounded-md shadow-xl max-w-3xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#192B2A]">
                {editingInsight.id ? 'Edit Economic Insight' : 'New Economic Insight'}
              </h3>
              <button onClick={() => setEditingInsight(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInsight} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editingInsight.title || ''}
                    onChange={(e) => setEditingInsight({ ...editingInsight, title: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                    placeholder="Article title"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Topic *</label>
                  <input
                    type="text"
                    required
                    value={editingInsight.topic || ''}
                    onChange={(e) => setEditingInsight({ ...editingInsight, topic: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                    placeholder="e.g. Macroeconomics, Trade, Debt"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Read Time (Minutes)</label>
                  <input
                    type="number"
                    value={editingInsight.read_time_minutes || 5}
                    onChange={(e) => setEditingInsight({ ...editingInsight, read_time_minutes: Number(e.target.value) })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Publication Status *</label>
                  <select
                    value={editingInsight.status || 'draft'}
                    onChange={(e: any) => setEditingInsight({ ...editingInsight, status: e.target.value })}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs bg-white"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={editingInsight.summary || ''}
                  onChange={(e) => setEditingInsight({ ...editingInsight, summary: e.target.value })}
                  className="w-full p-2 border border-[#D9DCD2] rounded text-xs"
                />
              </div>

              <div>
                <RichTextEditor
                  value={editingInsight.content_html || ''}
                  onChange={(val) => setEditingInsight({ ...editingInsight, content_html: val })}
                  label="Article Content"
                  rows={8}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="insight_featured"
                  checked={editingInsight.is_featured === 1}
                  onChange={(e) => setEditingInsight({ ...editingInsight, is_featured: e.target.checked ? 1 : 0 })}
                  className="rounded text-[#285748]"
                />
                <label htmlFor="insight_featured" className="font-semibold text-xs text-[#192B2A]">
                  Feature on Homepage
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#D9DCD2]">
                <button
                  type="button"
                  onClick={() => setEditingInsight(null)}
                  className="px-4 py-2 border rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInsight}
                  className="px-4 py-2 bg-[#285748] text-white rounded text-xs font-semibold hover:bg-[#1e4337]"
                >
                  {savingInsight ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
