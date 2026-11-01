'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Globe,
  Loader2,
  X,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
} from 'lucide-react';
import type { EventItem, EventGalleryImage } from '@/lib/data';

function parseGalleryImages(jsonStr?: string | null): EventGalleryImage[] {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  } catch {}
  return [];
}

interface EventFormData {
  id?: number;
  title: string;
  slug: string;
  description: string;
  start_time: string;
  end_time: string;
  venue_or_format: string;
  is_online: number;
  organizer_type: 'tefpc' | 'external';
  organizer_name: string;
  registration_url: string;
  status: 'draft' | 'published';
  cover_image_url: string;
  cover_image_alt: string;
  gallery_images: EventGalleryImage[];
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<EventFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const fetchEvents = () => {
    setLoading(true);
    fetch('/api/admin/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('Failed to load events.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleNew = () => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekEnd = new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000);

    setEditingItem({
      title: '',
      slug: '',
      description: '',
      start_time: nextWeek.toISOString().slice(0, 16),
      end_time: nextWeekEnd.toISOString().slice(0, 16),
      venue_or_format: 'Rita Tower, 15th Floor, Posta, Dar es Salaam, Tanzania',
      is_online: 0,
      organizer_type: 'tefpc',
      organizer_name: 'Tanzania Economic and Financial Policy Consultancy (TEFPC)',
      registration_url: '',
      status: 'draft', // New events strictly default to Draft
      cover_image_url: '',
      cover_image_alt: '',
      gallery_images: [],
    });
    setErrorMsg('');
  };

  const handleEdit = (evt: EventItem) => {
    setEditingItem({
      id: evt.id,
      title: evt.title,
      slug: evt.slug,
      description: evt.description,
      start_time: evt.start_time ? evt.start_time.slice(0, 16) : '',
      end_time: evt.end_time ? evt.end_time.slice(0, 16) : '',
      venue_or_format: evt.venue_or_format || '',
      is_online: evt.is_online || 0,
      organizer_type: evt.organizer_type || (evt.is_organized_by_me ? 'tefpc' : 'external'),
      organizer_name: evt.organizer_name || 'Tanzania Economic and Financial Policy Consultancy (TEFPC)',
      registration_url: evt.registration_url || '',
      status: evt.status || 'draft',
      cover_image_url: evt.cover_image_url || '',
      cover_image_alt: evt.cover_image_alt || '',
      gallery_images: parseGalleryImages(evt.gallery_images_json),
    });
    setErrorMsg('');
  };

  // Upload utility
  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  // Cover Image Handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setUploadingCover(true);
    setErrorMsg('');
    try {
      const url = await uploadSingleFile(file);
      setEditingItem((prev) =>
        prev
          ? {
              ...prev,
              cover_image_url: url,
              cover_image_alt: prev.cover_image_alt || `${prev.title} cover`,
            }
          : null
      );
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Cover upload failed');
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Gallery Images Handlers
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingItem) return;

    setUploadingGallery(true);
    setErrorMsg('');
    try {
      const newImages: EventGalleryImage[] = [];
      const currentCount = editingItem.gallery_images.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadSingleFile(file);
        newImages.push({
          id: `img_${Date.now()}_${i}`,
          url,
          caption: `${editingItem.title} - Photo ${currentCount + i + 1}`,
          order: currentCount + i,
        });
      }

      setEditingItem((prev) =>
        prev
          ? {
              ...prev,
              gallery_images: [...prev.gallery_images, ...newImages],
            }
          : null
      );
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Gallery upload failed');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleMoveGallery = (index: number, direction: 'up' | 'down') => {
    if (!editingItem) return;
    const list = [...editingItem.gallery_images];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    // Re-assign order indices
    const updated = list.map((item, idx) => ({ ...item, order: idx }));
    setEditingItem({ ...editingItem, gallery_images: updated });
  };

  const handleRemoveGallery = (index: number) => {
    if (!editingItem) return;
    const list = [...editingItem.gallery_images];
    list.splice(index, 1);
    const updated = list.map((item, idx) => ({ ...item, order: idx }));
    setEditingItem({ ...editingItem, gallery_images: updated });
  };

  const handleGalleryCaptionChange = (index: number, caption: string) => {
    if (!editingItem) return;
    const list = [...editingItem.gallery_images];
    list[index] = { ...list[index], caption };
    setEditingItem({ ...editingItem, gallery_images: list });
  };

  // Save handler (Draft or Publish)
  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (!editingItem) return;

    if (!editingItem.title.trim()) {
      setErrorMsg('Event title is required.');
      return;
    }

    if (editingItem.organizer_type === 'external' && !editingItem.organizer_name.trim()) {
      setErrorMsg('External organizer name is required when External Organizer is selected.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        ...editingItem,
        status: targetStatus,
        gallery_images_json: JSON.stringify(editingItem.gallery_images),
      };

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save event.');

      setSuccessMsg(`Event successfully saved as ${targetStatus.toUpperCase()}.`);
      setEditingItem(null);
      fetchEvents();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Status Toggle (Publish / Unpublish)
  const handleToggleStatus = async (evt: EventItem) => {
    const nextStatus = evt.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: evt.id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed.');
      fetchEvents();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed.');
      fetchEvents();
    } catch (err: unknown) {
      alert((err as Error).message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Tanzania Economics Events Management
          </h2>
          <p className="text-xs text-[#52605A]">
            Manage symposiums, roundtables, cover photos, gallery images, and draft/published workflow.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Event</span>
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Events Table */}
      {loading ? (
        <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
          <span>Loading events...</span>
        </div>
      ) : (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs text-[#192B2A]">
            <thead className="bg-[#DCE3D7] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Event & Media</th>
                <th className="p-3">Status</th>
                <th className="p-3">Organizer</th>
                <th className="p-3">Date & Format</th>
                <th className="p-3">Public Link</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DCD2]">
              {events.map((evt) => {
                const isTefpc = evt.organizer_type === 'tefpc' || evt.is_organized_by_me === 1;
                const isPublished = evt.status === 'published';
                const galleryCount = parseGalleryImages(evt.gallery_images_json).length;

                return (
                  <tr key={evt.id} className="hover:bg-[#F7F5EF] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {evt.cover_image_url ? (
                          <img
                            src={evt.cover_image_url}
                            alt=""
                            className="w-12 h-10 object-cover rounded bg-[#192B2A] shrink-0 border border-[#D9DCD2]"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded bg-[#DCE3D7] flex items-center justify-center text-[#718079] shrink-0 border border-[#D9DCD2]">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-[#192B2A]">{evt.title}</p>
                          <p className="text-[11px] text-[#52605A]">
                            Slug: <span className="font-mono">{evt.slug}</span>
                            {galleryCount > 0 && ` • ${galleryCount} gallery photo${galleryCount > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Organizer Clarity */}
                    <td className="p-3">
                      {isTefpc ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#285748] text-[#F7F5EF]">
                          <Building2 className="w-3 h-3" />
                          <span>Organized by TEFPC</span>
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DCE3D7] text-[#192B2A]">
                            <Users className="w-3 h-3" />
                            <span>External</span>
                          </span>
                          <p className="text-[11px] text-[#52605A] font-medium">{evt.organizer_name}</p>
                        </div>
                      )}
                    </td>

                    {/* Date & Format */}
                    <td className="p-3 text-[11px] text-[#52605A]">
                      <div className="space-y-0.5">
                        <div className="font-medium text-[#192B2A]">
                          {new Date(evt.start_time).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'Africa/Dar_es_Salaam',
                          })}
                        </div>
                        <div>{evt.is_online ? 'Virtual' : evt.venue_or_format}</div>
                      </div>
                    </td>

                    {/* View Public Event Link */}
                    <td className="p-3">
                      {isPublished ? (
                        <Link
                          href={`/events/${evt.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285748] hover:underline"
                        >
                          <span>View Public Event</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/events/${evt.slug}?preview=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:underline"
                        >
                          <Eye className="w-3 h-3 text-amber-600" />
                          <span>Preview Draft</span>
                        </Link>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Publish / Unpublish button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(evt)}
                          title={isPublished ? 'Unpublish to Draft' : 'Publish Event'}
                          className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                            isPublished
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {isPublished ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          onClick={() => handleEdit(evt)}
                          title="Edit Event"
                          className="p-1.5 hover:bg-[#DCE3D7] rounded text-[#52605A] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id)}
                          title="Delete Event"
                          className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#52605A]">
                    No events configured yet. Click "+ New Event" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#D9DCD2] pb-3">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#192B2A]">
                  {editingItem.id ? 'Edit Economics Event' : 'Create New Economics Event'}
                </h3>
                <p className="text-xs text-[#52605A]">
                  Current Status: <strong className={editingItem.status === 'published' ? 'text-emerald-700' : 'text-amber-700'}>
                    {editingItem.status.toUpperCase()}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                aria-label="Close modal"
                className="p-1 hover:bg-[#DCE3D7] rounded text-[#52605A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* SECTION 1: Basic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#285748] border-b border-[#D9DCD2] pb-1">
                  1. Event Information
                </h4>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#192B2A]">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setEditingItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              title: newTitle,
                              slug: prev.id ? prev.slug : newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                            }
                          : null
                      );
                    }}
                    placeholder="e.g. TEFPC Policy Roundtable: Macroeconomic Outlook for Tanzania 2027"
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#192B2A]">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.slug}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F7F5EF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                  />
                  <p className="text-[11px] text-[#52605A] mt-0.5">
                    Public URL: /events/{editingItem.slug || 'your-slug'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#192B2A]">
                    Description & Program Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Comprehensive overview of forum themes, speakers, venue access, and research topics..."
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748] leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION 2: Organizer Clarity */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#285748] border-b border-[#D9DCD2] pb-1">
                  2. Organizer Clarity
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
                      editingItem.organizer_type === 'tefpc'
                        ? 'bg-[#F7F5EF] border-[#285748] ring-1 ring-[#285748]'
                        : 'bg-[#E9EDE4] border-[#D9DCD2] hover:bg-[#F7F5EF]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="organizer_type"
                      checked={editingItem.organizer_type === 'tefpc'}
                      onChange={() =>
                        setEditingItem({
                          ...editingItem,
                          organizer_type: 'tefpc',
                          organizer_name: 'Tanzania Economic and Financial Policy Consultancy (TEFPC)',
                        })
                      }
                      className="mt-0.5 text-[#285748]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#192B2A] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#285748]" />
                        <span>Organized by TEFPC</span>
                      </p>
                      <p className="text-[11px] text-[#52605A] mt-0.5">
                        Official forum, symposium or conference convened by Dr. Simba / TEFPC.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
                      editingItem.organizer_type === 'external'
                        ? 'bg-[#F7F5EF] border-[#285748] ring-1 ring-[#285748]'
                        : 'bg-[#E9EDE4] border-[#D9DCD2] hover:bg-[#F7F5EF]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="organizer_type"
                      checked={editingItem.organizer_type === 'external'}
                      onChange={() =>
                        setEditingItem({
                          ...editingItem,
                          organizer_type: 'external',
                          organizer_name:
                            editingItem.organizer_name === 'Tanzania Economic and Financial Policy Consultancy (TEFPC)'
                              ? ''
                              : editingItem.organizer_name,
                        })
                      }
                      className="mt-0.5 text-[#285748]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#192B2A] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#52605A]" />
                        <span>External Organizer</span>
                      </p>
                      <p className="text-[11px] text-[#52605A] mt-0.5">
                        Academic institution, central bank, ministry, or partner organization.
                      </p>
                    </div>
                  </label>
                </div>

                {editingItem.organizer_type === 'external' && (
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#192B2A]">
                      External Organizer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.organizer_name}
                      onChange={(e) => setEditingItem({ ...editingItem, organizer_name: e.target.value })}
                      placeholder="e.g. Bank of Tanzania (BOT), University of Dar es Salaam, REPOA"
                      className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 3: Date, Time & Location */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#285748] border-b border-[#D9DCD2] pb-1">
                  3. Date, Time & Location (Africa/Dar_es_Salaam - EAT)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#192B2A]">
                      Start Date & Time (EAT) *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editingItem.start_time}
                      onChange={(e) => setEditingItem({ ...editingItem, start_time: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#192B2A]">
                      End Date & Time (EAT) *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editingItem.end_time}
                      onChange={(e) => setEditingItem({ ...editingItem, end_time: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#192B2A]">
                      Venue / Physical Location or Platform
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.venue_or_format}
                      onChange={(e) => setEditingItem({ ...editingItem, venue_or_format: e.target.value })}
                      placeholder="e.g. Rita Tower, 15th Floor, Posta, Dar es Salaam or Zoom Webinar"
                      className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#192B2A]">
                      External Registration URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={editingItem.registration_url}
                      onChange={(e) => setEditingItem({ ...editingItem, registration_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="is-online-checkbox"
                    type="checkbox"
                    checked={Boolean(editingItem.is_online)}
                    onChange={(e) => setEditingItem({ ...editingItem, is_online: e.target.checked ? 1 : 0 })}
                    className="h-4 w-4 text-[#285748] rounded border-[#D9DCD2]"
                  />
                  <label htmlFor="is-online-checkbox" className="text-xs font-semibold text-[#192B2A]">
                    Virtual / Online Event Format
                  </label>
                </div>
              </div>

              {/* SECTION 4: Event Cover Image */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#285748]">
                    4. Event Cover Image
                  </h4>
                  <span className="text-[11px] text-[#52605A]">Displayed on public cards and slideshow</span>
                </div>

                {editingItem.cover_image_url ? (
                  <div className="bg-[#F7F5EF] border border-[#D9DCD2] p-4 rounded flex flex-col sm:flex-row gap-4 items-start">
                    <img
                      src={editingItem.cover_image_url}
                      alt={editingItem.cover_image_alt || 'Cover preview'}
                      className="w-36 h-24 object-cover rounded bg-[#192B2A] border border-[#D9DCD2] shrink-0"
                    />
                    <div className="flex-1 space-y-2 w-full">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#192B2A] mb-1">
                          Cover Image Caption & Alt Text
                        </label>
                        <input
                          type="text"
                          value={editingItem.cover_image_alt}
                          onChange={(e) => setEditingItem({ ...editingItem, cover_image_alt: e.target.value })}
                          placeholder="e.g. Keynote presentation at TEFPC Macroeconomic Symposium"
                          className="w-full px-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={uploadingCover}
                          className="px-3 py-1 text-xs font-medium border border-[#D9DCD2] bg-[#FFFFFF] hover:bg-[#E9EDE4] rounded transition-colors"
                        >
                          {uploadingCover ? 'Uploading...' : 'Replace Cover'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, cover_image_url: '', cover_image_alt: '' })}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Remove Cover
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#D9DCD2] rounded p-6 text-center space-y-2 bg-[#F7F5EF]">
                    <ImageIcon className="w-8 h-8 mx-auto text-[#718079]" />
                    <p className="text-xs font-semibold text-[#192B2A]">Upload Event Cover Photo</p>
                    <p className="text-[11px] text-[#52605A]">
                      High-resolution JPG, PNG or WebP image. Stored in persistent volume.
                    </p>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingCover ? 'Uploading...' : 'Select Cover Image'}</span>
                    </button>
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>

              {/* SECTION 5: Gallery Images */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-1">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#285748]">
                      5. Event Gallery Images ({editingItem.gallery_images.length})
                    </h4>
                    <p className="text-[11px] text-[#52605A]">
                      Featured in the responsive slideshow with captions and mobile swipe navigation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingGallery}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{uploadingGallery ? 'Uploading...' : 'Add Photos'}</span>
                  </button>
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />

                {editingItem.gallery_images.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {editingItem.gallery_images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="bg-[#F7F5EF] border border-[#D9DCD2] p-2.5 rounded flex items-center gap-3"
                      >
                        <span className="text-xs font-mono font-bold text-[#718079] w-5 text-center">
                          {idx + 1}
                        </span>

                        <img
                          src={img.url}
                          alt=""
                          className="w-16 h-12 object-cover rounded bg-[#192B2A] border border-[#D9DCD2] shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={(e) => handleGalleryCaptionChange(idx, e.target.value)}
                            placeholder="Add descriptive caption or alt text..."
                            className="w-full px-2 py-1 text-xs bg-[#FFFFFF] border border-[#D9DCD2] rounded focus:outline-none focus:border-[#285748]"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveGallery(idx, 'up')}
                            disabled={idx === 0}
                            title="Move earlier"
                            className="p-1 hover:bg-[#DCE3D7] rounded text-[#52605A] disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveGallery(idx, 'down')}
                            disabled={idx === editingItem.gallery_images.length - 1}
                            title="Move later"
                            className="p-1 hover:bg-[#DCE3D7] rounded text-[#52605A] disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGallery(idx)}
                            title="Remove photo"
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#718079] italic py-2">
                    No gallery photos added yet. Click "Add Photos" to upload symposium photos or slide screenshots.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-[#D9DCD2]">
              <div>
                {editingItem.id && editingItem.slug && (
                  <Link
                    href={`/events/${editingItem.slug}?preview=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#285748] hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview in New Tab</span>
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={saving}
                  className="px-4 py-2 border border-[#D9DCD2] text-[#52605A] text-xs font-semibold rounded hover:bg-[#DCE3D7] transition-colors"
                >
                  Cancel
                </button>

                {/* Save Draft Action */}
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="px-4 py-2 border border-amber-300 bg-amber-100 text-amber-900 text-xs font-semibold rounded hover:bg-amber-200 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>

                {/* Publish Action */}
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="px-5 py-2 font-semibold bg-[#285748] text-[#F7F5EF] text-xs rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Publish Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
