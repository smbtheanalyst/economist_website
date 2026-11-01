'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Sliders,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Upload,
  Calendar,
  MapPin,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
import type { HomepageSlideItem } from '@/lib/data';

interface ReusableImage {
  url: string;
  alt: string;
  source: string;
}

export default function HomepageSlidesAdminPage() {
  const [slides, setSlides] = useState<HomepageSlideItem[]>([]);
  const [reusableImages, setReusableImages] = useState<ReusableImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit/Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<{
    id?: number;
    title: string;
    caption: string;
    image_url: string;
    image_alt: string;
    activity_date: string;
    activity_location: string;
    link_url: string;
    link_text: string;
    focal_point: 'center' | 'top' | 'bottom' | 'left' | 'right';
    display_order: number;
    is_enabled: number;
  }>({
    title: '',
    caption: '',
    image_url: '',
    image_alt: '',
    activity_date: '',
    activity_location: '',
    link_url: '',
    link_text: '',
    focal_point: 'center',
    display_order: 0,
    is_enabled: 1,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/slides');
      const data = await res.json();
      if (res.ok) {
        setSlides(data.slides || []);
        setReusableImages(data.reusableImages || []);
      } else {
        setMessage({ text: data.error || 'Failed to load slides', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to slides API', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      caption: '',
      image_url: '',
      image_alt: '',
      activity_date: '',
      activity_location: '',
      link_url: '',
      link_text: '',
      focal_point: 'center',
      display_order: slides.length,
      is_enabled: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HomepageSlideItem) => {
    setFormData({
      id: slide.id,
      title: slide.title,
      caption: slide.caption || '',
      image_url: slide.image_url,
      image_alt: slide.image_alt,
      activity_date: slide.activity_date || '',
      activity_location: slide.activity_location || '',
      link_url: slide.link_url || '',
      link_text: slide.link_text || '',
      focal_point: slide.focal_point || 'center',
      display_order: slide.display_order,
      is_enabled: slide.is_enabled,
    });
    setIsModalOpen(true);
  };

  const handleToggleEnabled = async (id: number, currentStatus: number) => {
    try {
      const res = await fetch('/api/admin/slides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_enabled: currentStatus === 1 ? 0 : 1 }),
      });
      if (res.ok) {
        fetchSlides();
      }
    } catch {
      setMessage({ text: 'Error toggling slide status', type: 'error' });
    }
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const currentSlide = slides[index];
    const targetSlide = slides[targetIndex];

    try {
      await fetch('/api/admin/slides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentSlide.id, display_order: targetIndex }),
      });

      await fetch('/api/admin/slides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetSlide.id, display_order: index }),
      });

      fetchSlides();
    } catch {
      setMessage({ text: 'Error reordering slides', type: 'error' });
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to remove slide "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/slides?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSlides();
        setMessage({ text: 'Slide removed successfully.', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Error deleting slide', type: 'error' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({
          ...prev,
          image_url: data.url,
          image_alt: prev.image_alt || file.name.replace(/\.[^/.]+$/, ''),
        }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.image_url.trim()) {
      alert('Slide image is required');
      return;
    }
    if (!formData.image_alt.trim()) {
      alert('Image alt text is required for accessibility');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchSlides();
        setMessage({ text: 'Homepage slide saved successfully.', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Failed to save slide', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error saving slide', type: 'error' });
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
            Visual Presentation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            Homepage Activity Slideshow
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A]">
            Curate verified TEFPC policy activities, dialogues, and photo slides displayed on the homepage hero.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded shadow-sm hover:bg-[#1e4337] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Activity Slide</span>
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

      {/* Slides List */}
      {isLoading ? (
        <div className="py-12 text-center text-[#52605A]">
          <Sliders className="w-8 h-8 animate-spin mx-auto mb-2 text-[#285748]" />
          <p className="text-sm">Loading activity slides...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white border border-[#D9DCD2] rounded-sm p-8 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#192B2A]">No Activity Slides Added</h3>
          <p className="text-xs text-[#52605A] max-w-md mx-auto">
            When no verified activity slides exist, the homepage automatically displays a polished institutional text hero. You can add genuine TEFPC activity photos anytime.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337]"
          >
            Add First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`bg-white border rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                slide.is_enabled === 1 ? 'border-[#D9DCD2]' : 'border-dashed border-gray-300 opacity-60'
              }`}
            >
              {/* Left: Thumbnail & Content */}
              <div className="flex items-start gap-4">
                {/* Reorder controls */}
                <div className="flex flex-col gap-1 shrink-0 pt-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveSlide(index, 'up')}
                    className="p-1 rounded hover:bg-[#E9EDE4] disabled:opacity-20 text-[#192B2A]"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1}
                    onClick={() => handleMoveSlide(index, 'down')}
                    className="p-1 rounded hover:bg-[#E9EDE4] disabled:opacity-20 text-[#192B2A]"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Image Thumbnail */}
                <div className="relative w-28 h-20 bg-[#E9EDE4] rounded overflow-hidden border border-[#D9DCD2] shrink-0">
                  <Image
                    src={slide.image_url}
                    alt={slide.image_alt || slide.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded font-mono uppercase">
                    {slide.focal_point}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-[#192B2A] truncate">
                      {slide.title}
                    </h4>
                    {slide.is_enabled === 1 ? (
                      <span className="px-2 py-0.5 text-[9px] font-semibold bg-green-100 text-green-800 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-semibold bg-gray-200 text-gray-700 rounded">
                        Disabled
                      </span>
                    )}
                  </div>

                  {slide.caption && (
                    <p className="text-xs text-[#52605A] line-clamp-1 max-w-xl">
                      {slide.caption}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                    {(slide.activity_date || slide.activity_location) && (
                      <span>
                        {[slide.activity_date, slide.activity_location].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    {slide.link_url && (
                      <span className="text-[#285748] font-medium">Link: {slide.link_url}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(slide.id, slide.is_enabled)}
                  className="p-1.5 text-gray-600 hover:text-[#192B2A] rounded border border-[#D9DCD2] bg-white"
                  title={slide.is_enabled === 1 ? 'Disable slide' : 'Enable slide'}
                >
                  {slide.is_enabled === 1 ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(slide)}
                  className="p-1.5 text-gray-600 hover:text-[#285748] rounded border border-[#D9DCD2] bg-white"
                  title="Edit slide"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(slide.id, slide.title)}
                  className="p-1.5 text-red-600 hover:text-red-800 rounded border border-red-200 bg-red-50"
                  title="Delete slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-[#D9DCD2] shadow-xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-[#192B2A] border-b border-[#D9DCD2] pb-3">
              {formData.id ? 'Edit Activity Slide' : 'Add Activity Photo Slide'}
            </h3>

            <div className="space-y-4 text-xs">
              {/* Image Source & Upload */}
              <div className="p-4 bg-[#F7F5EF] border border-[#D9DCD2] rounded space-y-3">
                <label className="font-semibold block text-[#192B2A]">
                  Slide Image * (Upload or select existing event photo)
                </label>

                {formData.image_url ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-20 bg-gray-200 rounded overflow-hidden border">
                      <Image src={formData.image_url} alt="Slide preview" fill className="object-cover" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-gray-700 truncate max-w-xs">{formData.image_url}</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#285748] underline font-medium"
                      >
                        Replace Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-[#285748] text-white rounded font-semibold inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Reusable Image Picker */}
                {reusableImages.length > 0 && (
                  <div className="pt-2 border-t border-[#D9DCD2]">
                    <span className="block text-[11px] text-[#52605A] font-medium mb-1.5">
                      Or select from verified event photos:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {reusableImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              image_url: img.url,
                              image_alt: img.alt,
                            }))
                          }
                          className="relative w-16 h-12 rounded border shrink-0 overflow-hidden hover:ring-2 hover:ring-[#285748]"
                          title={`${img.source} (${img.alt})`}
                        >
                          <Image src={img.url} alt={img.alt} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Image Alt Text * (Required for accessibility)
                  </label>
                  <input
                    type="text"
                    value={formData.image_alt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image_alt: e.target.value }))}
                    placeholder="Descriptive text of the activity or photo"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                    required
                  />
                </div>
              </div>

              {/* Title & Caption */}
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Slide Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Tanzania Macroeconomic Dialogue 2026"
                  className="w-full p-2 border border-[#D9DCD2] rounded text-sm text-[#192B2A]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Short Caption (Optional)
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                  placeholder="Brief 1-2 sentence context for this photo..."
                  rows={2}
                  className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                />
              </div>

              {/* Activity Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Activity Date (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.activity_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, activity_date: e.target.value }))}
                    placeholder="e.g. October 2026 or 15 Nov 2026"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Activity Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.activity_location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, activity_location: e.target.value }))}
                    placeholder="e.g. Dar es Salaam, Tanzania"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
              </div>

              {/* Link URL & Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Link Destination (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, link_url: e.target.value }))}
                    placeholder="/projects/... or /events/..."
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Link Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.link_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, link_text: e.target.value }))}
                    placeholder="Learn more →"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
              </div>

              {/* Focal Point & Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9DCD2]">
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Mobile Focal Point (Image Cropping)
                  </label>
                  <select
                    value={formData.focal_point}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, focal_point: e.target.value }))}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A] bg-white"
                  >
                    <option value="center">Center (Default)</option>
                    <option value="top">Top (Preserves Faces/Heads)</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_enabled === 1}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_enabled: e.target.checked ? 1 : 0 }))}
                      className="rounded text-[#285748]"
                    />
                    <span className="font-semibold text-[#192B2A]">Enable Slide on Homepage</span>
                  </label>
                </div>
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
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold bg-[#285748] text-white rounded hover:bg-[#1e4337] shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
