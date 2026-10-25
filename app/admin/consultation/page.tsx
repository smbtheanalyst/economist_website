'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Calendar, ShieldCheck, Loader2, X, CheckCircle2 } from 'lucide-react';

interface ConsultationService {
  id: number;
  name: string;
  slug: string;
  is_paid: number;
  price_amount: number;
  currency: string;
  duration_minutes: number;
  format: 'both' | 'online' | 'in_person';
  description: string;
  prep_instructions: string;
  is_active: number;
  order_index: number;
}

interface AvailabilityRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: number;
}

interface BlockedDate {
  id: number;
  date_str: string;
  reason: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminConsultationPage() {
  const [services, setServices] = useState<ConsultationService[]>([]);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Service Edit modal
  const [editingService, setEditingService] = useState<Partial<ConsultationService> | null>(null);

  // New blocked date input
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('Out of Office / Academic Travel');

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/consultation')
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
        setRules(data.availabilityRules || []);
        setBlockedDates(data.blockedDates || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load consultation settings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'service', ...editingService }),
      });
      if (!res.ok) throw new Error('Save failed');
      setEditingService(null);
      setMsg('Service saved successfully.');
      fetchData();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await fetch(`/api/admin/consultation?entity=service&id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'availability', rules }),
      });
      if (!res.ok) throw new Error('Save rules failed');
      setMsg('Weekly availability hours updated.');
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    try {
      const res = await fetch('/api/admin/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'blocked_date',
          date_str: newBlockedDate,
          reason: newBlockedReason,
        }),
      });
      if (!res.ok) throw new Error('Failed to block date');
      setNewBlockedDate('');
      setMsg(`Date ${newBlockedDate} blocked successfully.`);
      fetchData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDeleteBlockedDate = async (id: number) => {
    try {
      await fetch(`/api/admin/consultation?entity=blocked_date&id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Failed to remove blocked date');
    }
  };

  return (
    <div className="space-y-10">
      <div className="border-b border-[#D9DCD2] pb-4">
        <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
          Consultation Services & Availability
        </h2>
        <p className="text-xs text-[#52605A]">
          Manage advisory tiers, pricing, duration, weekly working hours, and blackout dates.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-900 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* 1. SERVICES CATALOG */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl font-medium text-[#192B2A] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#285748]" />
            <span>Consultation Services ({services.length})</span>
          </h3>
          <button
            onClick={() =>
              setEditingService({
                name: '',
                slug: '',
                is_paid: 1,
                price_amount: 150,
                currency: 'USD',
                duration_minutes: 60,
                format: 'both',
                description: '',
                prep_instructions: '',
                is_active: 1,
                order_index: services.length + 1,
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#192B2A]">
            <thead className="bg-[#DCE3D7] border-b border-[#D9DCD2] text-[#52605A] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Price / Tier</th>
                <th className="p-3">Format</th>
                <th className="p-3">Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DCD2]">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-[#F7F5EF] transition-colors">
                  <td className="p-3">
                    <p className="font-semibold text-sm">{svc.name}</p>
                    <p className="text-[11px] text-[#52605A] line-clamp-1">{svc.description}</p>
                  </td>
                  <td className="p-3">{svc.duration_minutes} Mins</td>
                  <td className="p-3">
                    <span className="font-bold">
                      {svc.is_paid ? `${svc.currency} ${svc.price_amount}` : 'Free Mentorship'}
                    </span>
                  </td>
                  <td className="p-3">
                    {svc.format === 'both' ? 'Online & In-Person' : svc.format.replace('_', ' ')}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        svc.is_active ? 'bg-green-100 text-green-900' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {svc.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setEditingService(svc)}
                      className="p-1.5 text-[#52605A] hover:text-[#285748]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-1.5 text-red-700 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. WEEKLY WORKING HOURS */}
      <section className="space-y-4 pt-6 border-t border-[#D9DCD2]">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#192B2A]">
              Weekly Working Hours (Africa/Dar_es_Salaam)
            </h3>
            <p className="text-xs text-[#52605A]">
              Set researcher consultation availability windows per day of week.
            </p>
          </div>
          <button
            onClick={handleSaveRules}
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Weekly Hours'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const rule = rules.find((r) => r.day_of_week === day) || {
              day_of_week: day,
              start_time: '09:00',
              end_time: '17:00',
              is_active: day >= 1 && day <= 5 ? 1 : 0,
            };

            return (
              <div
                key={day}
                className={`p-3 bg-[#E9EDE4] border rounded-sm space-y-2 text-xs ${
                  rule.is_active ? 'border-[#285748]' : 'border-[#D9DCD2] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-[#192B2A]">
                  <span>{DAY_NAMES[day]}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(rule.is_active)}
                    onChange={(e) => {
                      const updated = rules.filter((r) => r.day_of_week !== day);
                      updated.push({ ...rule, is_active: e.target.checked ? 1 : 0 });
                      setRules(updated);
                    }}
                    className="h-3.5 w-3.5 text-[#285748] rounded"
                  />
                </div>

                {rule.is_active ? (
                  <div className="space-y-1.5">
                    <div>
                      <span className="block text-[10px] text-[#52605A]">Start:</span>
                      <input
                        type="time"
                        value={rule.start_time}
                        onChange={(e) => {
                          const updated = rules.filter((r) => r.day_of_week !== day);
                          updated.push({ ...rule, start_time: e.target.value });
                          setRules(updated);
                        }}
                        className="w-full px-1.5 py-1 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#52605A]">End:</span>
                      <input
                        type="time"
                        value={rule.end_time}
                        onChange={(e) => {
                          const updated = rules.filter((r) => r.day_of_week !== day);
                          updated.push({ ...rule, end_time: e.target.value });
                          setRules(updated);
                        }}
                        className="w-full px-1.5 py-1 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-[#718079] italic text-[11px]">
                    Closed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. BLOCKED DATES */}
      <section className="space-y-4 pt-6 border-t border-[#D9DCD2]">
        <h3 className="font-serif text-xl font-medium text-[#192B2A]">
          Blocked Dates & Blackout Windows
        </h3>
        <p className="text-xs text-[#52605A]">
          Block specific holidays, conference travels, or personal blackout dates from accepting bookings.
        </p>

        <form onSubmit={handleAddBlockedDate} className="flex flex-wrap items-end gap-3 bg-[#E9EDE4] p-4 rounded-sm border border-[#D9DCD2]">
          <div>
            <label className="block text-xs font-semibold text-[#192B2A] mb-1">
              Select Date to Block
            </label>
            <input
              type="date"
              required
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-[#192B2A] mb-1">
              Reason / Label
            </label>
            <input
              type="text"
              required
              value={newBlockedReason}
              onChange={(e) => setNewBlockedReason(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337]"
          >
            Block Date
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {blockedDates.map((b) => (
            <div
              key={b.id}
              className="p-3 bg-[#F7F5EF] border border-[#D9DCD2] rounded flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-mono font-semibold text-[#192B2A]">{b.date_str}</p>
                <p className="text-[11px] text-[#52605A]">{b.reason}</p>
              </div>
              <button
                onClick={() => handleDeleteBlockedDate(b.id)}
                className="text-red-700 hover:text-red-900 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {blockedDates.length === 0 && (
            <p className="col-span-3 text-xs text-[#52605A] italic">No blocked dates configured.</p>
          )}
        </div>
      </section>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] w-full max-w-lg rounded-sm p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#D9DCD2] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#192B2A]">
                {editingService.id ? 'Edit Service' : 'Add Consultation Service'}
              </h3>
              <button onClick={() => setEditingService(null)} className="text-[#52605A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">Service Name</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">Duration (Mins)</label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={editingService.duration_minutes || 45}
                    onChange={(e) =>
                      setEditingService({ ...editingService, duration_minutes: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-1.5 bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#192B2A]">Tier Pricing</label>
                  <div className="flex gap-2">
                    <select
                      value={editingService.is_paid ? 'paid' : 'free'}
                      onChange={(e) =>
                        setEditingService({ ...editingService, is_paid: e.target.value === 'paid' ? 1 : 0 })
                      }
                      className="px-2 py-1.5 bg-[#F7F5EF] border border-[#D9DCD2] rounded font-medium"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                    {Boolean(editingService.is_paid) && (
                      <input
                        type="number"
                        min={0}
                        value={editingService.price_amount || 0}
                        onChange={(e) =>
                          setEditingService({ ...editingService, price_amount: parseFloat(e.target.value) })
                        }
                        className="w-20 px-2 py-1.5 bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">Format Options</label>
                <select
                  value={editingService.format || 'both'}
                  onChange={(e) =>
                    setEditingService({ ...editingService, format: e.target.value as 'both' | 'online' | 'in_person' })
                  }
                  className="w-full px-3 py-1.5 bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                >
                  <option value="both">Both Online Video & In-Person Office</option>
                  <option value="online">Online Video Only</option>
                  <option value="in_person">In-Person Office Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#192B2A]">Description</label>
                <textarea
                  rows={2}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#F7F5EF] border border-[#D9DCD2] rounded"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="svc-active"
                  type="checkbox"
                  checked={Boolean(editingService.is_active)}
                  onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 text-[#285748] rounded"
                />
                <label htmlFor="svc-active" className="font-semibold text-[#192B2A]">
                  Active and bookable on website
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D9DCD2]">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-1.5 border border-[#D9DCD2] text-[#52605A] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337]"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
