'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Globe, Loader2, X, ExternalLink } from 'lucide-react';

interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  start_time: string;
  end_time: string;
  venue_or_format: string;
  is_online: number;
  is_organized_by_me: number;
  organizer_name: string;
  registration_url: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<EventItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEvents = () => {
    setLoading(true);
    fetch('/api/admin/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg('Failed to load events');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleNew = () => {
    setEditingItem({
      title: '',
      slug: '',
      description: '',
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString().slice(0, 16),
      venue_or_format: 'Dar es Salaam, Tanzania',
      is_online: 0,
      is_organized_by_me: 1,
      organizer_name: 'Dr. Researcher',
      registration_url: '',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save event');

      setEditingItem(null);
      fetchEvents();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchEvents();
    } catch (err: unknown) {
      alert((err as Error).message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Tanzania Economics Events Management
          </h2>
          <p className="text-xs text-[#52605A]">
            Manage upcoming and past economics conferences, policy roundtables, and distinguish self-organized forums from 3rd party events.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Event</span>
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
          <span>Loading events...</span>
        </div>
      ) : (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#192B2A]">
            <thead className="bg-[#DCE3D7] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Organizer</th>
                <th className="p-3">Date & Time (EAT)</th>
                <th className="p-3">Venue / Format</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DCD2]">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#F7F5EF] transition-colors">
                  <td className="p-3 max-w-sm">
                    <div className="font-serif text-sm font-medium text-[#192B2A]">
                      {evt.title}
                    </div>
                    <p className="text-[11px] text-[#52605A] line-clamp-1">{evt.description}</p>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        evt.is_organized_by_me
                          ? 'bg-[#285748] text-[#F7F5EF]'
                          : 'bg-[#DCE3D7] text-[#192B2A]'
                      }`}
                    >
                      {evt.is_organized_by_me ? 'Self-Organized' : evt.organizer_name}
                    </span>
                  </td>
                  <td className="p-3 text-[#52605A]">
                    {new Date(evt.start_time).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-[#52605A]">
                      {evt.is_online ? <Globe className="w-3.5 h-3.5 text-[#285748]" /> : <MapPin className="w-3.5 h-3.5 text-[#285748]" />}
                      <span>{evt.venue_or_format}</span>
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setEditingItem(evt)}
                      className="p-1.5 text-[#52605A] hover:text-[#285748] inline-block"
                      title="Edit Event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="p-1.5 text-red-700 hover:text-red-900 inline-block"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#52605A]">
                    No events scheduled.
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
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] w-full max-w-2xl rounded-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center border-b border-[#D9DCD2] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#192B2A]">
                {editingItem.id ? 'Edit Event' : 'Schedule New Economics Event'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#52605A] hover:text-[#192B2A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">
                  Event Title <span className="text-red-700">*</span>
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
                  Event Description & Objective
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Start Date & Time (Africa/Dar_es_Salaam)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editingItem.start_time ? editingItem.start_time.slice(0, 16) : ''}
                    onChange={(e) => setEditingItem({ ...editingItem, start_time: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    End Date & Time (Africa/Dar_es_Salaam)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editingItem.end_time ? editingItem.end_time.slice(0, 16) : ''}
                    onChange={(e) => setEditingItem({ ...editingItem, end_time: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Venue or Format Description
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.venue_or_format || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, venue_or_format: e.target.value })}
                    placeholder="e.g. BOT Auditorium or Zoom Webinar"
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">
                    Organizer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.organizer_name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, organizer_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">
                  External Registration or Program Link (Optional)
                </label>
                <input
                  type="url"
                  value={editingItem.registration_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, registration_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="is-organized-by-me"
                    type="checkbox"
                    checked={Boolean(editingItem.is_organized_by_me)}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, is_organized_by_me: e.target.checked ? 1 : 0 })
                    }
                    className="h-4 w-4 text-[#285748] rounded"
                  />
                  <label htmlFor="is-organized-by-me" className="text-xs font-semibold text-[#192B2A]">
                    Organized by Researcher
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="is-online"
                    type="checkbox"
                    checked={Boolean(editingItem.is_online)}
                    onChange={(e) => setEditingItem({ ...editingItem, is_online: e.target.checked ? 1 : 0 })}
                    className="h-4 w-4 text-[#285748] rounded"
                  />
                  <label htmlFor="is-online" className="text-xs font-semibold text-[#192B2A]">
                    Online / Virtual Format
                  </label>
                </div>
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
                  {saving ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
