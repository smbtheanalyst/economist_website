'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  UploadCloud,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface NavItemUI {
  id: string;
  label: string;
  path: string;
  is_external?: boolean;
  visible: boolean;
  order: number;
  children?: NavItemUI[];
}

interface DestinationOption {
  label: string;
  path: string;
}

export default function NavigationAdminPage() {
  const [draftItems, setDraftItems] = useState<NavItemUI[]>([]);
  const [publishedItems, setPublishedItems] = useState<NavItemUI[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<DestinationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit / Add modal state
  const [editingItem, setEditingItem] = useState<{
    parentId?: string | null;
    item: NavItemUI;
    isNew: boolean;
  } | null>(null);

  const fetchNavigation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/navigation');
      const data = await res.json();
      if (res.ok) {
        setDraftItems(data.draft || []);
        setPublishedItems(data.published || []);
        setAvailableDestinations(data.availableDestinations || []);
      } else {
        setMessage({ text: data.error || 'Failed to load navigation', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to navigation API', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

  const hasUnpublishedChanges =
    JSON.stringify(draftItems) !== JSON.stringify(publishedItems);

  const handleSaveDraft = async (itemsToSave: NavItemUI[] = draftItems) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSave }),
      });
      const data = await res.json();
      if (res.ok) {
        setDraftItems(data.items);
        setMessage({ text: 'Draft navigation saved successfully.', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Failed to save draft', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error saving draft', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      // Save draft first to be safe
      await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: draftItems }),
      });

      const res = await fetch('/api/admin/navigation', { method: 'PUT' });
      const data = await res.json();
      if (res.ok) {
        setPublishedItems(JSON.parse(JSON.stringify(draftItems)));
        setMessage({ text: 'Navigation published to live public website!', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Failed to publish', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error publishing navigation', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = async () => {
    if (!confirm('Discard all unpublished draft navigation changes and revert to live published menu?')) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/navigation', { method: 'DELETE' });
      if (res.ok) {
        setDraftItems(JSON.parse(JSON.stringify(publishedItems)));
        setMessage({ text: 'Draft changes reverted to live menu.', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Network error reverting changes', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder top level
  const moveTopItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...draftItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // re-index order
    newItems.forEach((it, i) => (it.order = i));
    setDraftItems(newItems);
  };

  // Reorder child item
  const moveChildItem = (parentIndex: number, childIndex: number, direction: 'up' | 'down') => {
    const newItems = [...draftItems];
    const children = [...(newItems[parentIndex].children || [])];
    const targetIndex = direction === 'up' ? childIndex - 1 : childIndex + 1;
    if (targetIndex < 0 || targetIndex >= children.length) return;

    const temp = children[childIndex];
    children[childIndex] = children[targetIndex];
    children[targetIndex] = temp;

    children.forEach((c, i) => (c.order = i));
    newItems[parentIndex].children = children;
    setDraftItems(newItems);
  };

  // Toggle visibility
  const toggleVisibility = (parentId: string | null, itemId: string) => {
    const newItems = [...draftItems];
    if (!parentId) {
      const it = newItems.find((i) => i.id === itemId);
      if (it) it.visible = !it.visible;
    } else {
      const parent = newItems.find((i) => i.id === parentId);
      if (parent && parent.children) {
        const child = parent.children.find((c) => c.id === itemId);
        if (child) child.visible = !child.visible;
      }
    }
    setDraftItems(newItems);
  };

  // Delete item
  const deleteItem = (parentId: string | null, itemId: string) => {
    if (!confirm('Are you sure you want to remove this navigation item?')) return;
    const newItems = [...draftItems];
    if (!parentId) {
      setDraftItems(newItems.filter((i) => i.id !== itemId));
    } else {
      const parent = newItems.find((i) => i.id === parentId);
      if (parent && parent.children) {
        parent.children = parent.children.filter((c) => c.id !== itemId);
        setDraftItems(newItems);
      }
    }
  };

  // Save Modal
  const saveModalItem = () => {
    if (!editingItem) return;
    const { parentId, item, isNew } = editingItem;

    if (!item.label.trim()) {
      alert('Label is required');
      return;
    }

    const newItems = [...draftItems];

    if (!parentId) {
      // Top-level item
      if (isNew) {
        newItems.push({
          ...item,
          order: newItems.length,
          children: item.children || [],
        });
      } else {
        const idx = newItems.findIndex((i) => i.id === item.id);
        if (idx !== -1) {
          newItems[idx] = { ...item, children: newItems[idx].children || [] };
        }
      }
    } else {
      // Child item
      const parent = newItems.find((i) => i.id === parentId);
      if (parent) {
        parent.children = parent.children || [];
        if (isNew) {
          parent.children.push({
            ...item,
            order: parent.children.length,
          });
        } else {
          const idx = parent.children.findIndex((c) => c.id === item.id);
          if (idx !== -1) {
            parent.children[idx] = item;
          }
        }
      }
    }

    setDraftItems(newItems);
    setEditingItem(null);
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-[#52605A]">
        <Compass className="w-8 h-8 animate-spin mx-auto mb-2 text-[#285748]" />
        <p className="text-sm">Loading navigation structure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#D9DCD2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
            Website Architecture
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            Configurable Navigation Menus
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A]">
            Manage the primary header navigation and 1-level dropdown menus. Changes remain in draft until published.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {hasUnpublishedChanges && (
            <button
              type="button"
              onClick={handleRevert}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSaveDraft()}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#285748] text-[#285748] hover:bg-[#E9EDE4] rounded transition-colors"
          >
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#285748] text-white hover:bg-[#1e4337] rounded shadow-sm transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Publish to Live Site</span>
          </button>
        </div>
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

      {/* Status Banner */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              hasUnpublishedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-600'
            }`}
          />
          <div>
            <span className="font-bold text-[#192B2A]">
              {hasUnpublishedChanges ? 'Unpublished Draft Changes' : 'Draft In Sync with Live Site'}
            </span>
            <p className="text-[#52605A]">
              {hasUnpublishedChanges
                ? 'You have pending navigation changes. Click "Publish to Live Site" to update the public menu.'
                : 'The published navigation on tefpc.or.tz matches this configuration.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingItem({
              parentId: null,
              item: {
                id: `nav-${Date.now()}`,
                label: '',
                path: '/',
                visible: true,
                order: draftItems.length,
                children: [],
              },
              isNew: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#285748] text-white font-semibold rounded text-xs hover:bg-[#1e4337]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Top-Level Item</span>
        </button>
      </div>

      {/* Navigation Items List */}
      <div className="space-y-4">
        {draftItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-md overflow-hidden transition-all ${
                item.visible ? 'border-[#D9DCD2]' : 'border-dashed border-gray-300 opacity-60'
              }`}
            >
              {/* Top-Level Item Row */}
              <div className="p-3 sm:p-4 bg-[#F7F5EF] border-b border-[#D9DCD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Order controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveTopItem(index, 'up')}
                      className="p-1 rounded hover:bg-[#E9EDE4] disabled:opacity-30 text-[#192B2A]"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === draftItems.length - 1}
                      onClick={() => moveTopItem(index, 'down')}
                      className="p-1 rounded hover:bg-[#E9EDE4] disabled:opacity-30 text-[#192B2A]"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-[#192B2A]">
                        {item.label}
                      </span>
                      {!item.visible && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-200 text-gray-700 rounded">
                          Hidden
                        </span>
                      )}
                      {item.is_external && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded inline-flex items-center gap-0.5">
                          External <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#52605A] font-mono mt-0.5">{item.path}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        parentId: item.id,
                        item: {
                          id: `${item.id}-child-${Date.now()}`,
                          label: '',
                          path: item.path,
                          visible: true,
                          order: (item.children || []).length,
                        },
                        isNew: true,
                      })
                    }
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#D9DCD2] hover:bg-[#E9EDE4] rounded text-[#285748] inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Dropdown Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVisibility(null, item.id)}
                    className="p-1.5 text-gray-600 hover:text-[#192B2A] rounded border border-[#D9DCD2] bg-white"
                    title={item.visible ? 'Hide from navigation' : 'Make visible'}
                  >
                    {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingItem({ parentId: null, item: { ...item }, isNew: false })}
                    className="p-1.5 text-gray-600 hover:text-[#285748] rounded border border-[#D9DCD2] bg-white"
                    title="Edit item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteItem(null, item.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 rounded border border-red-200 bg-red-50"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dropdown Children */}
              {hasChildren ? (
                <div className="divide-y divide-[#E9EDE4] bg-white pl-8 sm:pl-12 pr-4">
                  {item.children?.map((child, cIndex) => (
                    <div
                      key={child.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#192B2A]">{child.label}</span>
                            {!child.visible && (
                              <span className="px-1.5 py-0.2 text-[9px] bg-gray-200 text-gray-600 rounded">
                                Hidden
                              </span>
                            )}
                            {child.is_external && (
                              <span className="text-[10px] text-blue-700">↗</span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">{child.path}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={cIndex === 0}
                          onClick={() => moveChildItem(index, cIndex, 'up')}
                          className="p-1 text-gray-500 hover:text-black disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={cIndex === (item.children?.length || 0) - 1}
                          onClick={() => moveChildItem(index, cIndex, 'down')}
                          className="p-1 text-gray-500 hover:text-black disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleVisibility(item.id, child.id)}
                          className="p-1 text-gray-500 hover:text-black"
                          title={child.visible ? 'Hide' : 'Show'}
                        >
                          {child.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-gray-300" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem({ parentId: item.id, item: { ...child }, isNew: false })}
                          className="p-1 text-gray-500 hover:text-[#285748]"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id, child.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-8 py-2 text-[11px] text-gray-400 italic bg-white">
                  Direct link (no dropdown items).
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Item Edit/Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#D9DCD2] shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif text-lg font-bold text-[#192B2A]">
              {editingItem.isNew ? 'Add Navigation Item' : 'Edit Navigation Item'}
              {editingItem.parentId && <span className="block text-xs font-normal text-[#52605A]">Adding dropdown sub-item</span>}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Item Label (English)
                </label>
                <input
                  type="text"
                  value={editingItem.item.label}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, label: e.target.value },
                    })
                  }
                  placeholder="e.g. Research Areas, Our Partners"
                  className="w-full p-2 border border-[#D9DCD2] rounded text-sm text-[#192B2A]"
                />
              </div>

              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Select Existing Destination (Recommended)
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, path: e.target.value },
                      });
                    }
                  }}
                  className="w-full p-2 border border-[#D9DCD2] rounded text-xs text-[#192B2A] bg-white"
                >
                  <option value="">-- Choose from existing site pages & routes --</option>
                  {availableDestinations.map((dest, i) => (
                    <option key={i} value={dest.path}>
                      {dest.label} ({dest.path})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-[#192B2A] mb-1">
                  Destination URL / Path
                </label>
                <input
                  type="text"
                  value={editingItem.item.path}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, path: e.target.value },
                    })
                  }
                  placeholder="/about, /projects, or https://..."
                  className="w-full p-2 border border-[#D9DCD2] rounded text-xs font-mono text-[#192B2A]"
                />
                <span className="text-[11px] text-gray-500">
                  Internal routes start with <code>/</code>. External links start with <code>https://</code>.
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.item.visible}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, visible: e.target.checked },
                      })
                    }
                    className="rounded text-[#285748]"
                  />
                  <span className="font-medium text-[#192B2A]">Visible in Navigation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.item.is_external)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, is_external: e.target.checked },
                      })
                    }
                    className="rounded text-[#285748]"
                  />
                  <span className="font-medium text-[#192B2A]">Open in New Tab (External)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#D9DCD2]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-medium border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveModalItem}
                className="px-4 py-2 text-xs font-semibold bg-[#285748] text-white rounded hover:bg-[#1e4337]"
              >
                Apply to Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
