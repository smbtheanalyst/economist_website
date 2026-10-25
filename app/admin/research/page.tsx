'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Download, ExternalLink, Loader2, X, Star, Upload } from 'lucide-react';

interface ResearchPaper {
  id: number;
  title: string;
  slug: string;
  abstract: string;
  authors: string;
  year: number;
  publication_type: string;
  topics_json: string;
  journal_publisher: string;
  doi_url: string;
  pdf_url: string;
  is_featured: number;
  status: 'draft' | 'published';
  is_demo: number;
}

export default function AdminResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<ResearchPaper> | null>(null);
  const [topicsInput, setTopicsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPapers = () => {
    setLoading(true);
    fetch('/api/admin/research')
      .then((res) => res.json())
      .then((data) => {
        setPapers(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg('Failed to load research papers');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleEdit = (p: ResearchPaper) => {
    setEditingItem(p);
    const topics: string[] = JSON.parse(p.topics_json || '[]');
    setTopicsInput(topics.join(', '));
  };

  const handleNew = () => {
    setEditingItem({
      title: '',
      slug: '',
      abstract: '',
      authors: 'Dr. Researcher',
      year: new Date().getFullYear(),
      publication_type: 'Journal Article',
      journal_publisher: '',
      doi_url: '',
      pdf_url: '',
      is_featured: 0,
      status: 'published',
    });
    setTopicsInput('Macroeconomics, Tanzania');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setEditingItem({ ...editingItem, pdf_url: data.url });
    } catch (err: unknown) {
      alert((err as Error).message || 'PDF upload failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const topicsArr = topicsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...editingItem,
        topics_json: JSON.stringify(topicsArr),
      };

      const res = await fetch('/api/admin/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save publication');

      setEditingItem(null);
      fetchPapers();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this publication?')) return;
    try {
      const res = await fetch(`/api/admin/research?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchPapers();
    } catch (err: unknown) {
      alert((err as Error).message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Research & Publications Management
          </h2>
          <p className="text-xs text-[#52605A]">
            Catalog peer-reviewed papers, policy briefs, upload PDFs, and manage DOI references.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Publication</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
          <span>Loading publications...</span>
        </div>
      ) : (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#192B2A]">
            <thead className="bg-[#DCE3D7] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Title & Authors</th>
                <th className="p-3">Type</th>
                <th className="p-3">Year</th>
                <th className="p-3">Links & PDF</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DCD2]">
              {papers.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F5EF] transition-colors">
                  <td className="p-3 max-w-sm">
                    <div className="font-serif text-sm font-medium text-[#192B2A] flex items-center gap-1.5">
                      {item.is_featured === 1 && (
                        <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[#52605A] mt-0.5">{item.authors}</p>
                    {item.journal_publisher && (
                      <p className="text-[10px] text-[#718079] italic">{item.journal_publisher}</p>
                    )}
                  </td>
                  <td className="p-3 font-medium">{item.publication_type}</td>
                  <td className="p-3 text-[#52605A]">{item.year}</td>
                  <td className="p-3 space-y-1">
                    {item.pdf_url && (
                      <a
                        href={item.pdf_url}
                        download
                        className="text-[11px] text-[#285748] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF Available</span>
                      </a>
                    )}
                    {item.doi_url && (
                      <a
                        href={item.doi_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#52605A] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>DOI Record</span>
                      </a>
                    )}
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
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-[#52605A] hover:text-[#285748] inline-block"
                      title="Edit Paper"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-700 hover:text-red-900 inline-block"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {papers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#52605A]">
                    No research publications cataloged.
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
                {editingItem.id ? 'Edit Research Paper' : 'Catalog New Research Publication'}
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
                    Paper Title <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
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
                    Publication Type
                  </label>
                  <select
                    value={editingItem.publication_type || 'Journal Article'}
                    onChange={(e) => setEditingItem({ ...editingItem, publication_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded font-medium"
                  >
                    <option value="Journal Article">Journal Article</option>
                    <option value="Working Paper">Working Paper</option>
                    <option value="Policy Brief">Policy Brief</option>
                    <option value="Book Chapter">Book Chapter</option>
                    <option value="Report">Report</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Year of Publication
                  </label>
                  <input
                    type="number"
                    min={1990}
                    max={2030}
                    value={editingItem.year || 2026}
                    onChange={(e) => setEditingItem({ ...editingItem, year: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Status
                  </label>
                  <select
                    value={editingItem.status || 'published'}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, status: e.target.value as 'draft' | 'published' })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded font-medium"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Authors List
                  </label>
                  <input
                    type="text"
                    value={editingItem.authors || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, authors: e.target.value })}
                    placeholder="e.g. Dr. Juma M. Mwangi, Prof. A. K. Luwano"
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Journal / Publisher Citation
                  </label>
                  <input
                    type="text"
                    value={editingItem.journal_publisher || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, journal_publisher: e.target.value })}
                    placeholder="e.g. Journal of African Economies"
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">
                  Abstract / Executive Summary
                </label>
                <textarea
                  rows={4}
                  value={editingItem.abstract || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, abstract: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">
                  Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  placeholder="e.g. Debt Policy, Fiscal Space, EAC Integration"
                  className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    DOI / External Publication URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.doi_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, doi_url: e.target.value })}
                    placeholder="https://doi.org/10.xxxx/..."
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Upload Full Paper PDF
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingItem.pdf_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, pdf_url: e.target.value })}
                      placeholder="/uploads/paper.pdf"
                      className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded font-mono"
                    />
                    <label className="px-3 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded cursor-pointer shrink-0 hover:bg-[#1e4337]">
                      <Upload className="w-3.5 h-3.5 inline mr-1" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="featured-paper"
                  type="checkbox"
                  checked={Boolean(editingItem.is_featured)}
                  onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 text-[#285748] rounded"
                />
                <label htmlFor="featured-paper" className="text-xs font-medium text-[#192B2A]">
                  Mark as Selected Featured Publication
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
                  {saving ? 'Saving...' : 'Save Publication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
