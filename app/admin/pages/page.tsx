'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Upload,
  Globe,
  Clock,
} from 'lucide-react';
import type { PageItem } from '@/lib/data';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function PagesAdminPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit/Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    id?: number;
    title: string;
    slug: string;
    summary: string;
    content_html: string;
    cover_image_url: string;
    cover_image_alt: string;
    seo_title: string;
    seo_description: string;
    status: 'draft' | 'published';
  }>({
    title: '',
    slug: '',
    summary: '',
    content_html: '',
    cover_image_url: '',
    cover_image_alt: '',
    seo_title: '',
    seo_description: '',
    status: 'draft',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      if (res.ok) {
        setPages(data.pages || []);
      } else {
        setMessage({ text: data.error || 'Failed to load pages', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to pages API', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content_html: '',
      cover_image_url: '',
      cover_image_alt: '',
      seo_title: '',
      seo_description: '',
      status: 'draft',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (page: PageItem) => {
    setFormData({
      id: page.id,
      title: page.title,
      slug: page.slug,
      summary: page.summary || '',
      content_html: page.content_html || '',
      cover_image_url: page.cover_image_url || '',
      cover_image_alt: page.cover_image_alt || '',
      seo_title: page.seo_title || '',
      seo_description: page.seo_description || '',
      status: page.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const action = currentStatus === 'published' ? 'unpublish' : 'publish';
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        fetchPages();
        setMessage({
          text: `Page ${action === 'publish' ? 'published' : 'reverted to draft'}.`,
          type: 'success',
        });
      }
    } catch {
      setMessage({ text: 'Error updating status', type: 'error' });
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the page "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPages();
        setMessage({ text: 'Page deleted successfully.', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Error deleting page', type: 'error' });
    }
  };

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      status: targetStatus || formData.status,
    };

    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchPages();
        setMessage({
          text: `Page ${payload.status === 'published' ? 'published' : 'saved as draft'} successfully.`,
          type: 'success',
        });
      } else {
        setMessage({ text: data.error || 'Failed to save page', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error saving page', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
            Content Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            Website Pages
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A]">
            Create and edit custom institutional pages, policy summaries, and institutional documentation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded shadow-sm hover:bg-[#1e4337] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Page</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-3 rounded text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Pages Table */}
      {isLoading ? (
        <div className="py-12 text-center text-[#52605A]">
          <FileText className="w-8 h-8 animate-spin mx-auto mb-2 text-[#285748]" />
          <p className="text-sm">Loading pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white border border-[#D9DCD2] rounded-sm p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#192B2A]">No Custom Pages Created Yet</h3>
          <p className="text-xs text-[#52605A] max-w-md mx-auto">
            You can create custom institutional pages (e.g. Terms of Reference, Specific Policy Briefs, Institutional Documentation) and link them directly to the website navigation.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337]"
          >
            Create Your First Page
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#D9DCD2] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E9EDE4] border-b border-[#D9DCD2] text-[#192B2A] font-semibold">
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDE4]">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-[#F7F5EF] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#192B2A] text-sm">{page.title}</div>
                      <div className="text-gray-500 font-mono text-[11px]">/{page.slug}</div>
                      {page.summary && (
                        <div className="text-gray-500 line-clamp-1 mt-0.5 text-[11px]">{page.summary}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {page.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px]">
                      {new Date(page.updated_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {page.status === 'published' ? (
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-600 hover:text-[#285748] rounded hover:bg-[#E9EDE4]"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <a
                            href={`/admin/preview/pages/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-amber-700 hover:text-amber-900 rounded hover:bg-amber-100"
                            title="Preview Draft Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(page.id, page.status)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                            page.status === 'published'
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                              : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          {page.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(page)}
                          className="p-1 text-gray-600 hover:text-[#285748] rounded hover:bg-[#E9EDE4]"
                          title="Edit Page"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(page.id, page.title)}
                          className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                          title="Delete Page"
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
        </div>
      )}

      {/* Page Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-[#D9DCD2] shadow-xl max-w-4xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#192B2A]">
                {formData.id ? 'Edit Institutional Page' : 'Create New Institutional Page'}
              </h3>
              <span className="text-xs text-[#52605A]">
                Status: <strong className="uppercase">{formData.status}</strong>
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title,
                        // Auto-generate slug if new and slug hasn't been manually edited
                        slug: prev.id
                          ? prev.slug
                          : title
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, ''),
                      }));
                    }}
                    placeholder="e.g. Terms of Engagement"
                    className="w-full p-2.5 border border-[#D9DCD2] rounded text-sm text-[#192B2A]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Unique URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="p-2.5 bg-[#E9EDE4] border border-r-0 border-[#D9DCD2] rounded-l text-[#52605A] text-xs font-mono">
                      /
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().trim() }))
                      }
                      placeholder="terms-of-engagement"
                      className="w-full p-2.5 border border-[#D9DCD2] rounded-r text-xs font-mono text-[#192B2A]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Summary / Excerpt (Optional)
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Concise 1-2 sentence summary of this page..."
                  rows={2}
                  className="w-full p-2.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <RichTextEditor
                  value={formData.content_html}
                  onChange={(val) => setFormData((prev) => ({ ...prev, content_html: val }))}
                  label="Page Content (Rich Text)"
                  placeholder="Draft institutional content, policy statements, terms, or documentation..."
                  rows={12}
                />
              </div>

              {/* Cover Image & Alt */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#D9DCD2]">
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Cover Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }))}
                    placeholder="/uploads/... or https://..."
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Cover Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.cover_image_alt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cover_image_alt: e.target.value }))}
                    placeholder="Accessibility description for image"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
              </div>

              {/* SEO Title & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    SEO Meta Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="Defaults to Page Title"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    SEO Meta Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.seo_description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Brief description for search engines"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#D9DCD2]">
              <div>
                {formData.slug && (
                  <a
                    href={`/admin/preview/pages/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#285748] hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview in Admin Host</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#E9EDE4]"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold bg-[#285748] text-white rounded hover:bg-[#1e4337] shadow-sm"
                >
                  Publish Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
