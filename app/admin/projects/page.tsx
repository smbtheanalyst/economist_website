'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Star,
  Calendar,
  MapPin,
  Upload,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import type { ProjectItem, ProjectPartnerRole } from '@/lib/data';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [availableResearch, setAvailableResearch] = useState<{ id: number; title: string; slug: string }[]>([]);
  const [availableNews, setAvailableNews] = useState<{ id: number; title: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    id?: number;
    title: string;
    slug: string;
    summary: string;
    description_html: string;
    research_theme: string;
    project_status: 'ongoing' | 'completed';
    status: 'draft' | 'published';
    start_date: string;
    end_date: string;
    location: string;
    objectives: string[];
    activities: string[];
    outputs: string[];
    outcomes: string[];
    partner_organizations: ProjectPartnerRole[];
    cover_image_url: string;
    cover_image_alt: string;
    gallery_images: { url: string; caption: string; order: number }[];
    related_research_ids: number[];
    related_news_ids: number[];
    is_featured: boolean;
  }>({
    title: '',
    slug: '',
    summary: '',
    description_html: '',
    research_theme: 'Macroeconomic Policy',
    project_status: 'ongoing',
    status: 'draft',
    start_date: '',
    end_date: '',
    location: 'Tanzania',
    objectives: [''],
    activities: [''],
    outputs: [''],
    outcomes: [''],
    partner_organizations: [],
    cover_image_url: '',
    cover_image_alt: '',
    gallery_images: [],
    related_research_ids: [],
    related_news_ids: [],
    is_featured: false,
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
        setAvailableResearch(data.availableResearch || []);
        setAvailableNews(data.availableNews || []);
      } else {
        setMessage({ text: data.error || 'Failed to load projects', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to projects API', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      slug: '',
      summary: '',
      description_html: '',
      research_theme: 'Macroeconomic Policy',
      project_status: 'ongoing',
      status: 'draft',
      start_date: '',
      end_date: '',
      location: 'Tanzania',
      objectives: [''],
      activities: [''],
      outputs: [''],
      outcomes: [''],
      partner_organizations: [],
      cover_image_url: '',
      cover_image_alt: '',
      gallery_images: [],
      related_research_ids: [],
      related_news_ids: [],
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProjectItem) => {
    let objectives: string[] = [''];
    let activities: string[] = [''];
    let outputs: string[] = [''];
    let outcomes: string[] = [''];
    let partner_organizations: ProjectPartnerRole[] = [];
    let gallery_images: { url: string; caption: string; order: number }[] = [];
    let related_research_ids: number[] = [];
    let related_news_ids: number[] = [];

    try { objectives = JSON.parse(p.objectives_json); } catch {}
    try { activities = JSON.parse(p.activities_json); } catch {}
    try { outputs = JSON.parse(p.outputs_json); } catch {}
    try { outcomes = JSON.parse(p.outcomes_json); } catch {}
    try { partner_organizations = JSON.parse(p.partner_organizations_json); } catch {}
    try { gallery_images = JSON.parse(p.gallery_images_json); } catch {}
    try { related_research_ids = JSON.parse(p.related_research_ids_json); } catch {}
    try { related_news_ids = JSON.parse(p.related_news_ids_json); } catch {}

    setFormData({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      description_html: p.description_html || '',
      research_theme: p.research_theme || 'Macroeconomic Policy',
      project_status: p.project_status,
      status: p.status,
      start_date: p.start_date || '',
      end_date: p.end_date || '',
      location: p.location || '',
      objectives: objectives.length > 0 ? objectives : [''],
      activities: activities.length > 0 ? activities : [''],
      outputs: outputs.length > 0 ? outputs : [''],
      outcomes: outcomes.length > 0 ? outcomes : [''],
      partner_organizations,
      cover_image_url: p.cover_image_url || '',
      cover_image_alt: p.cover_image_alt || '',
      gallery_images,
      related_research_ids,
      related_news_ids,
      is_featured: p.is_featured === 1,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const action = currentStatus === 'published' ? 'unpublish' : 'publish';
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        fetchProjects();
        setMessage({
          text: `Project ${action === 'publish' ? 'published' : 'reverted to draft'}.`,
          type: 'success',
        });
      }
    } catch {
      setMessage({ text: 'Error updating project status', type: 'error' });
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle_featured' }),
      });
      if (res.ok) {
        fetchProjects();
      }
    } catch {
      setMessage({ text: 'Error updating featured status', type: 'error' });
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the project "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProjects();
        setMessage({ text: 'Project deleted successfully.', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Error deleting project', type: 'error' });
    }
  };

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      alert('Project title is required');
      return;
    }
    if (!formData.summary.trim()) {
      alert('Project summary is required');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      status: targetStatus || formData.status,
      objectives: formData.objectives.filter((s) => s.trim().length > 0),
      activities: formData.activities.filter((s) => s.trim().length > 0),
      outputs: formData.outputs.filter((s) => s.trim().length > 0),
      outcomes: formData.outcomes.filter((s) => s.trim().length > 0),
    };

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchProjects();
        setMessage({
          text: `Project ${payload.status === 'published' ? 'published' : 'saved as draft'} successfully.`,
          type: 'success',
        });
      } else {
        setMessage({ text: data.error || 'Failed to save project', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error saving project', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for dynamic string arrays (objectives, activities, outputs, outcomes)
  const updateListItem = (
    key: 'objectives' | 'activities' | 'outputs' | 'outcomes',
    idx: number,
    val: string
  ) => {
    setFormData((prev) => {
      const copy = [...prev[key]];
      copy[idx] = val;
      return { ...prev, [key]: copy };
    });
  };

  const addListItem = (key: 'objectives' | 'activities' | 'outputs' | 'outcomes') => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], ''],
    }));
  };

  const removeListItem = (key: 'objectives' | 'activities' | 'outputs' | 'outcomes', idx: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx),
    }));
  };

  // Helper for Partner Organizations
  const addPartnerOrg = () => {
    setFormData((prev) => ({
      ...prev,
      partner_organizations: [
        ...prev.partner_organizations,
        { name: '', role: 'implementing_partner', role_label: 'Implementing Partner', url: '' },
      ],
    }));
  };

  const updatePartnerOrg = (idx: number, field: keyof ProjectPartnerRole, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.partner_organizations];
      copy[idx] = { ...copy[idx], [field]: val };
      if (field === 'role') {
        const labels: Record<string, string> = {
          funder: 'Funder / Granting Agency',
          implementing_partner: 'Implementing Partner',
          research_partner: 'Research Partner',
          other: 'Collaborating Institution',
        };
        copy[idx].role_label = labels[val] || 'Partner';
      }
      return { ...prev, partner_organizations: copy };
    });
  };

  const removePartnerOrg = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      partner_organizations: prev.partner_organizations.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
            Portfolio & Initiatives
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            Projects & Policy Studies
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A]">
            Manage TEFPC’s ongoing and completed research and advisory projects, partners, outputs, and outcomes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded shadow-sm hover:bg-[#1e4337] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Project</span>
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

      {/* Projects Table */}
      {isLoading ? (
        <div className="py-12 text-center text-[#52605A]">
          <Briefcase className="w-8 h-8 animate-spin mx-auto mb-2 text-[#285748]" />
          <p className="text-sm">Loading projects portfolio...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-[#D9DCD2] rounded-sm p-8 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#192B2A]">No Projects Cataloged Yet</h3>
          <p className="text-xs text-[#52605A] max-w-md mx-auto">
            You can catalog ongoing and completed institutional projects, research initiatives, and policy advisory engagements with verified partner attributions.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337]"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#D9DCD2] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E9EDE4] border-b border-[#D9DCD2] text-[#192B2A] font-semibold">
                  <th className="py-3 px-4">Project Title & Theme</th>
                  <th className="py-3 px-4">Execution Status</th>
                  <th className="py-3 px-4">Publishing</th>
                  <th className="py-3 px-4">Homepage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDE4]">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F5EF] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#192B2A] text-sm">{p.title}</div>
                      <div className="text-gray-500 font-mono text-[11px]">/projects/{p.slug}</div>
                      <div className="inline-block px-2 py-0.5 mt-1 text-[10px] bg-[#E9EDE4] text-[#285748] rounded">
                        {p.research_theme || 'Economic Policy'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {p.project_status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                          Ongoing
                        </span>
                      )}
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
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(p.id)}
                        className={`p-1 rounded ${
                          p.is_featured === 1
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-gray-300 hover:text-gray-500'
                        }`}
                        title={p.is_featured === 1 ? 'Featured on Homepage (Click to unfeature)' : 'Click to feature on homepage'}
                      >
                        <Star className={`w-4 h-4 ${p.is_featured === 1 ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {p.status === 'published' ? (
                          <a
                            href={`/projects/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-600 hover:text-[#285748] rounded hover:bg-[#E9EDE4]"
                            title="View Public Project"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <a
                            href={`/admin/preview/projects/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-amber-700 hover:text-amber-900 rounded hover:bg-amber-100"
                            title="Preview Draft Project"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}

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
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                          title="Delete Project"
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
          <div className="bg-white rounded-md border border-[#D9DCD2] shadow-xl max-w-4xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#192B2A]">
                {formData.id ? 'Edit Institutional Project' : 'Add Institutional Project'}
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
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title,
                        slug: prev.id
                          ? prev.slug
                          : title
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, ''),
                      }));
                    }}
                    placeholder="e.g. Tanzania Public Debt Sustainability Assessment"
                    className="w-full p-2.5 border border-[#D9DCD2] rounded text-sm text-[#192B2A]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Project URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="p-2.5 bg-[#E9EDE4] border border-r-0 border-[#D9DCD2] rounded-l text-[#52605A] text-xs font-mono">
                      /projects/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().trim() }))
                      }
                      placeholder="public-debt-sustainability-assessment"
                      className="w-full p-2.5 border border-[#D9DCD2] rounded-r text-xs font-mono text-[#192B2A]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Theme & Project Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Research / Theme Area
                  </label>
                  <select
                    value={formData.research_theme}
                    onChange={(e) => setFormData((prev) => ({ ...prev, research_theme: e.target.value }))}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A] bg-white"
                  >
                    <option value="Macroeconomic Policy">Macroeconomic Policy</option>
                    <option value="Fiscal Policy & Debt Management">Fiscal Policy & Debt Management</option>
                    <option value="Financial Sector Development">Financial Sector Development</option>
                    <option value="Trade Facilitation & Regional Integration">Trade Facilitation & Regional Integration</option>
                    <option value="Agricultural Economics & Food Security">Agricultural Economics & Food Security</option>
                    <option value="Industrialization & Mining Economics">Industrialization & Mining Economics</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Execution Status
                  </label>
                  <select
                    value={formData.project_status}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, project_status: e.target.value }))}
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A] bg-white"
                  >
                    <option value="ongoing">Ongoing Project</option>
                    <option value="completed">Completed Project</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded text-[#285748]"
                    />
                    <span className="font-semibold text-[#192B2A]">Feature on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Dates & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.start_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                    placeholder="e.g. Jan 2026 or 2025"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.end_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                    placeholder="e.g. Ongoing or Dec 2026"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-[#192B2A] mb-1">
                    Location / Coverage (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Dar es Salaam, Dodoma & EAC"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Executive Summary *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Concise overview of project objectives, scope, and key policy relevance..."
                  rows={3}
                  className="w-full p-2.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  required
                />
              </div>

              {/* Rich Text Full Description */}
              <div>
                <RichTextEditor
                  value={formData.description_html}
                  onChange={(val) => setFormData((prev) => ({ ...prev, description_html: val }))}
                  label="Detailed Project Narrative (Rich Text)"
                  placeholder="In-depth methodology, background context, policy alignment..."
                  rows={8}
                />
              </div>

              {/* Objectives, Activities, Outputs & Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#D9DCD2]">
                {/* Objectives */}
                <div className="bg-[#F7F5EF] p-3 rounded border border-[#D9DCD2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#285748]">Project Objectives</span>
                    <button
                      type="button"
                      onClick={() => addListItem('objectives')}
                      className="text-[10px] text-[#285748] font-bold underline"
                    >
                      + Add Objective
                    </button>
                  </div>
                  {formData.objectives.map((obj, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => updateListItem('objectives', i, e.target.value)}
                        placeholder={`Objective #${i + 1}`}
                        className="flex-1 p-1.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                      />
                      {formData.objectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem('objectives', i)}
                          className="text-red-500 hover:text-red-700 px-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Outputs */}
                <div className="bg-[#F7F5EF] p-3 rounded border border-[#D9DCD2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#285748]">Deliverables & Outputs</span>
                    <button
                      type="button"
                      onClick={() => addListItem('outputs')}
                      className="text-[10px] text-[#285748] font-bold underline"
                    >
                      + Add Output
                    </button>
                  </div>
                  {formData.outputs.map((out, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input
                        type="text"
                        value={out}
                        onChange={(e) => updateListItem('outputs', i, e.target.value)}
                        placeholder={`e.g. Policy Brief, Econometric Model, Dataset`}
                        className="flex-1 p-1.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                      />
                      {formData.outputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem('outputs', i)}
                          className="text-red-500 hover:text-red-700 px-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Documented Outcomes & Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Activities */}
                <div className="bg-[#F7F5EF] p-3 rounded border border-[#D9DCD2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#285748]">Key Activities</span>
                    <button
                      type="button"
                      onClick={() => addListItem('activities')}
                      className="text-[10px] text-[#285748] font-bold underline"
                    >
                      + Add Activity
                    </button>
                  </div>
                  {formData.activities.map((act, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input
                        type="text"
                        value={act}
                        onChange={(e) => updateListItem('activities', i, e.target.value)}
                        placeholder={`Activity #${i + 1}`}
                        className="flex-1 p-1.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                      />
                      {formData.activities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem('activities', i)}
                          className="text-red-500 hover:text-red-700 px-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Outcomes */}
                <div className="bg-[#F7F5EF] p-3 rounded border border-[#D9DCD2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#285748]">Documented Outcomes</span>
                    <button
                      type="button"
                      onClick={() => addListItem('outcomes')}
                      className="text-[10px] text-[#285748] font-bold underline"
                    >
                      + Add Outcome
                    </button>
                  </div>
                  {formData.outcomes.map((otc, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input
                        type="text"
                        value={otc}
                        onChange={(e) => updateListItem('outcomes', i, e.target.value)}
                        placeholder={`Verified outcome or policy adoption`}
                        className="flex-1 p-1.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                      />
                      {formData.outcomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem('outcomes', i)}
                          className="text-red-500 hover:text-red-700 px-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Partner Organizations */}
              <div className="p-3 bg-[#E9EDE4] rounded border border-[#D9DCD2] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#285748] block">Partner Organizations & Explicit Roles</span>
                    <span className="text-[11px] text-gray-500">
                      Attribute verified institutional partnerships with explicit roles (funder, implementing, research).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addPartnerOrg}
                    className="px-2.5 py-1 text-xs bg-white text-[#285748] border border-[#D9DCD2] rounded font-semibold hover:bg-gray-50"
                  >
                    + Add Partner
                  </button>
                </div>

                {formData.partner_organizations.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic py-1">No partner organizations added to this project.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {formData.partner_organizations.map((org, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded border border-[#D9DCD2]">
                        <input
                          type="text"
                          value={org.name}
                          onChange={(e) => updatePartnerOrg(i, 'name', e.target.value)}
                          placeholder="Organization Name"
                          className="flex-1 p-1.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                        />
                        <select
                          value={org.role}
                          onChange={(e) => updatePartnerOrg(i, 'role', e.target.value)}
                          className="p-1.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A] bg-white"
                        >
                          <option value="funder">Funder / Granting Agency</option>
                          <option value="implementing_partner">Implementing Partner</option>
                          <option value="research_partner">Research Partner</option>
                          <option value="other">Collaborating Institution</option>
                        </select>
                        <input
                          type="text"
                          value={org.url || ''}
                          onChange={(e) => updatePartnerOrg(i, 'url', e.target.value)}
                          placeholder="Website (Optional)"
                          className="w-full sm:w-44 p-1.5 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                        />
                        <button
                          type="button"
                          onClick={() => removePartnerOrg(i)}
                          className="text-red-500 hover:text-red-700 px-2 self-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9DCD2]">
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
                    placeholder="Accessibility description"
                    className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A]"
                  />
                </div>
              </div>

              {/* Project Photo Gallery */}
              <div className="bg-[#F7F5EF] p-4 rounded border border-[#D9DCD2] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-serif font-bold text-sm text-[#192B2A] block">
                      Project Photo Gallery
                    </span>
                    <span className="text-[11px] text-[#52605A]">
                      Add field photos, workshop captures, or policy presentation images.
                    </span>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 bg-[#285748] text-white rounded text-xs font-semibold hover:bg-[#1e4337] transition-colors inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingGallery ? 'Uploading...' : 'Add Gallery Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingGallery}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingGallery(true);
                        try {
                          const body = new FormData();
                          body.append('file', file);
                          const res = await fetch('/api/admin/upload', { method: 'POST', body });
                          const json = await res.json();
                          if (res.ok && json.url) {
                            setFormData((prev) => ({
                              ...prev,
                              gallery_images: [
                                ...prev.gallery_images,
                                { url: json.url, caption: '', order: prev.gallery_images.length },
                              ],
                            }));
                          } else {
                            alert(json.error || 'Upload failed');
                          }
                        } catch {
                          alert('Upload failed');
                        } finally {
                          setIsUploadingGallery(false);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.gallery_images.length === 0 ? (
                  <p className="text-xs text-[#52605A] italic py-1">No gallery photos added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {formData.gallery_images.map((img, i) => (
                      <div key={i} className="flex gap-2 p-2 bg-white rounded border border-[#D9DCD2] items-center">
                        <div className="relative w-14 h-14 rounded overflow-hidden shrink-0 border border-[#D9DCD2] bg-gray-50">
                          <Image src={img.url} alt={img.caption || 'Project gallery image'} fill className="object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={img.caption}
                            onChange={(e) => {
                              const newImages = [...formData.gallery_images];
                              newImages[i].caption = e.target.value;
                              setFormData((prev) => ({ ...prev, gallery_images: newImages }));
                            }}
                            placeholder="Photo caption / context..."
                            className="w-full p-1 text-xs border border-[#D9DCD2] rounded text-[#192B2A]"
                          />
                          <p className="text-[10px] text-gray-400 font-mono truncate">{img.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              gallery_images: prev.gallery_images.filter((_, idx) => idx !== i),
                            }));
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

              {/* Related Research Publications & Related Institutional News */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9DCD2]">
                {/* Related Research */}
                <div className="bg-[#E9EDE4] p-3 rounded border border-[#D9DCD2] space-y-2">
                  <span className="font-serif font-bold text-xs text-[#285748] block">
                    Link Related Research Publications
                  </span>
                  <span className="text-[11px] text-[#52605A] block">
                    Select published papers or policy briefs produced from this project:
                  </span>
                  {availableResearch.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic">No published research available to link.</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 bg-white p-2 rounded border border-[#D9DCD2]">
                      {availableResearch.map((res) => {
                        const isChecked = formData.related_research_ids.includes(res.id);
                        return (
                          <label key={res.id} className="flex items-center gap-2 text-xs text-[#192B2A] cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    related_research_ids: [...prev.related_research_ids, res.id],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    related_research_ids: prev.related_research_ids.filter((id) => id !== res.id),
                                  }));
                                }
                              }}
                              className="rounded text-[#285748] focus:ring-[#285748]"
                            />
                            <span className="truncate">{res.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Related News */}
                <div className="bg-[#E9EDE4] p-3 rounded border border-[#D9DCD2] space-y-2">
                  <span className="font-serif font-bold text-xs text-[#285748] block">
                    Link Related Institutional News
                  </span>
                  <span className="text-[11px] text-[#52605A] block">
                    Select press releases or announcements covering this project:
                  </span>
                  {availableNews.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic">No news articles available to link.</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 bg-white p-2 rounded border border-[#D9DCD2]">
                      {availableNews.map((news) => {
                        const isChecked = formData.related_news_ids.includes(news.id);
                        return (
                          <label key={news.id} className="flex items-center gap-2 text-xs text-[#192B2A] cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    related_news_ids: [...prev.related_news_ids, news.id],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    related_news_ids: prev.related_news_ids.filter((id) => id !== news.id),
                                  }));
                                }
                              }}
                              className="rounded text-[#285748] focus:ring-[#285748]"
                            />
                            <span className="truncate">{news.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#D9DCD2]">
              <div>
                {formData.slug && (
                  <a
                    href={`/admin/preview/projects/${formData.slug}`}
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
