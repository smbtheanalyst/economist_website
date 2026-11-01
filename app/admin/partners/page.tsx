'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Handshake,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Upload,
  Globe,
  Home,
  Star,
} from 'lucide-react';
import type { PartnerItem } from '@/lib/data';

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    id?: number;
    name: string;
    slug: string;
    logo_url: string;
    logo_alt: string;
    website_url: string;
    relationship_description: string;
    relationship_type: string;
    display_order: number;
    is_featured_homepage: boolean;
    status: 'draft' | 'published';
  }>({
    name: '',
    slug: '',
    logo_url: '',
    logo_alt: '',
    website_url: '',
    relationship_description: '',
    relationship_type: 'Institutional Partner',
    display_order: 0,
    is_featured_homepage: true,
    status: 'draft',
  });

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/partners');
      const data = await res.json();
      if (res.ok) {
        setPartners(data.partners || []);
      } else {
        setMessage({ text: data.error || 'Failed to load partners', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to partners API', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      slug: '',
      logo_url: '',
      logo_alt: '',
      website_url: '',
      relationship_description: '',
      relationship_type: 'Institutional Partner',
      display_order: partners.length,
      is_featured_homepage: true,
      status: 'draft',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PartnerItem) => {
    setFormData({
      id: p.id,
      name: p.name,
      slug: p.slug,
      logo_url: p.logo_url || '',
      logo_alt: p.logo_alt || '',
      website_url: p.website_url || '',
      relationship_description: p.relationship_description || '',
      relationship_type: p.relationship_type || 'Institutional Partner',
      display_order: p.display_order,
      is_featured_homepage: p.is_featured_homepage === 1,
      status: p.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const action = currentStatus === 'published' ? 'unpublish' : 'publish';
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        fetchPartners();
        setMessage({
          text: `Partner organization ${action === 'publish' ? 'published' : 'reverted to draft'}.`,
          type: 'success',
        });
      }
    } catch {
      setMessage({ text: 'Error updating status', type: 'error' });
    }
  };

  const handleToggleHomepage = async (id: number) => {
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle_homepage' }),
      });
      if (res.ok) {
        fetchPartners();
      }
    } catch {
      setMessage({ text: 'Error toggling homepage status', type: 'error' });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/partners?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPartners();
        setMessage({ text: 'Partner deleted successfully.', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Error deleting partner', type: 'error' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({
          ...prev,
          logo_url: data.url,
          logo_alt: prev.logo_alt || `${prev.name || 'Partner'} Logo`,
        }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Error uploading logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    if (!formData.name.trim()) {
      alert('Organization name is required');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      status: targetStatus || formData.status,
    };

    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchPartners();
        setMessage({
          text: `Partner ${payload.status === 'published' ? 'published' : 'saved as draft'} successfully.`,
          type: 'success',
        });
      } else {
        setMessage({ text: data.error || 'Failed to save partner', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error saving partner', type: 'error' });
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
            Collaborations & Stakeholders
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            Institutional Partners
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A]">
            Manage verified institutional partner organizations, research collaborators, and implementing agencies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded shadow-sm hover:bg-[#1e4337] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Partner</span>
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

      {/* Partners Table */}
      {isLoading ? (
        <div className="py-12 text-center text-[#52605A]">
          <Handshake className="w-8 h-8 animate-spin mx-auto mb-2 text-[#285748]" />
          <p className="text-sm">Loading partners...</p>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white border border-[#D9DCD2] rounded-sm p-8 text-center space-y-3">
          <Handshake className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#192B2A]">No Partners Cataloged Yet</h3>
          <p className="text-xs text-[#52605A] max-w-md mx-auto">
            You can catalog verified institutional partners, research institutions, and development partners. When empty, partner sections on the public site hide gracefully.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337]"
          >
            Add Your First Partner
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#D9DCD2] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E9EDE4] border-b border-[#D9DCD2] text-[#192B2A] font-semibold">
                  <th className="py-3 px-4">Organization & Relationship</th>
                  <th className="py-3 px-4">Relationship Type</th>
                  <th className="py-3 px-4">Homepage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDE4]">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F5EF] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.logo_url ? (
                          <div className="relative w-10 h-10 rounded border border-[#D9DCD2] overflow-hidden bg-white shrink-0">
                            <Image src={p.logo_url} alt={p.logo_alt || p.name} fill className="object-contain p-1" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-[#E9EDE4] border border-[#D9DCD2] flex items-center justify-center font-serif font-bold text-[#285748] shrink-0">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-[#192B2A]">{p.name}</div>
                          {p.website_url && (
                            <a
                              href={p.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-gray-500 hover:text-[#285748] inline-flex items-center gap-1"
                            >
                              <span>{p.website_url.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {p.relationship_description && (
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{p.relationship_description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E9EDE4] text-[#285748]">
                        {p.relationship_type || 'Institutional Partner'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleHomepage(p.id)}
                        className={`p-1 rounded ${
                          p.is_featured_homepage === 1 ? 'text-amber-500' : 'text-gray-300 hover:text-gray-500'
                        }`}
                        title={p.is_featured_homepage === 1 ? 'Shown on homepage (click to hide)' : 'Hidden from homepage'}
                      >
                        <Star className={`w-4 h-4 ${p.is_featured_homepage === 1 ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'published' ? (
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
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                            p.status === 'published'
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                              : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          {p.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-gray-600 hover:text-[#285748] rounded hover:bg-[#E9EDE4]"
                          title="Edit Partner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                          title="Delete Partner"
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

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-[#D9DCD2] shadow-xl max-w-xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-[#192B2A] border-b border-[#D9DCD2] pb-3">
              {formData.id ? 'Edit Partner Organization' : 'Add Partner Organization'}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: prev.id
                        ? prev.slug
                        : name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, ''),
                    }));
                  }}
                  placeholder="e.g. Bank of Tanzania, ESRF, UNECA"
                  className="w-full p-2.5 border border-[#D9DCD2] rounded text-sm text-[#192B2A]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Website URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.website_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                />
              </div>

              {/* Logo Upload */}
              <div className="p-3 bg-[#F7F5EF] border border-[#D9DCD2] rounded space-y-2">
                <label className="font-semibold block text-[#192B2A]">Organization Logo (Optional)</label>
                {formData.logo_url && (
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-12 bg-white rounded border overflow-hidden">
                      <Image src={formData.logo_url} alt="Logo" fill className="object-contain p-1" />
                    </div>
                    <span className="text-xs font-mono text-gray-600 truncate max-w-xs">{formData.logo_url}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 bg-[#285748] text-white rounded font-semibold text-xs inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Logo'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">Logo Alt Text</label>
                  <input
                    type="text"
                    value={formData.logo_alt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, logo_alt: e.target.value }))}
                    placeholder="e.g. ESRF Logo"
                    className="w-full p-1.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
              </div>

              {/* Relationship Type */}
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Relationship Type
                </label>
                <select
                  value={formData.relationship_type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, relationship_type: e.target.value }))}
                  className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A] bg-white"
                >
                  <option value="Institutional Partner">Institutional Partner</option>
                  <option value="Research Partner">Research Partner</option>
                  <option value="Implementing Partner">Implementing Partner</option>
                  <option value="Academic Collaborator">Academic Collaborator</option>
                  <option value="Policy Dialogue Co-Host">Policy Dialogue Co-Host</option>
                  <option value="Advisory Client">Advisory Client</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Description of Verified Relationship
                </label>
                <textarea
                  value={formData.relationship_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, relationship_description: e.target.value }))}
                  placeholder="Summary of joint research, memorandum of understanding, symposium co-hosting, or policy advisory scope..."
                  rows={3}
                  className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-[#D9DCD2]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured_homepage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_featured_homepage: e.target.checked }))}
                    className="rounded text-[#285748]"
                  />
                  <span className="font-semibold text-[#192B2A]">Feature on Homepage Partners Bar</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-[#D9DCD2]">
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
      )}
    </div>
  );
}
