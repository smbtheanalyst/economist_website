'use client';

import React, { useState, useEffect } from 'react';
import { Save, Upload, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [researcherName, setResearcherName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [portraitUrl, setPortraitUrl] = useState('');
  const [biography, setBiography] = useState('');
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [cvUrl, setCvUrl] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroIntro, setHeroIntro] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [officeInstructions, setOfficeInstructions] = useState('');
  const [onlineInstructions, setOnlineInstructions] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ label: string; url: string }[]>([]);

  // Temp item inputs
  const [newQual, setNewQual] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newAff, setNewAff] = useState('');
  const [newSocialLabel, setNewSocialLabel] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/profile')
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setResearcherName(s.researcher_name || '');
          setProfessionalTitle(s.professional_title || '');
          setPortraitUrl(s.portrait_url || '');
          setBiography(s.biography || '');
          setQualifications(JSON.parse(s.qualifications_json || '[]'));
          setResearchInterests(JSON.parse(s.research_interests_json || '[]'));
          setAffiliations(JSON.parse(s.affiliations_json || '[]'));
          setCvUrl(s.cv_url || '');
          setHeroHeadline(s.hero_headline || '');
          setHeroIntro(s.hero_intro || '');
          setContactEmail(s.contact_email || '');
          setOfficeAddress(s.office_address || '');
          setOfficeInstructions(s.office_instructions || '');
          setOnlineInstructions(s.online_instructions || '');
          setPaymentInstructions(s.payment_instructions || '');
          setSocialLinks(JSON.parse(s.social_links_json || '[]'));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'portrait' | 'cv') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (target === 'portrait') setPortraitUrl(data.url);
      if (target === 'cv') setCvUrl(data.url);
      setMessage(`${target === 'portrait' ? 'Portrait' : 'CV'} uploaded successfully.`);
    } catch (err: unknown) {
      setError((err as Error).message || 'File upload failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researcher_name: researcherName,
          professional_title: professionalTitle,
          portrait_url: portraitUrl,
          biography,
          qualifications_json: qualifications,
          research_interests_json: researchInterests,
          affiliations_json: affiliations,
          cv_url: cvUrl,
          hero_headline: heroHeadline,
          hero_intro: heroIntro,
          contact_email: contactEmail,
          office_address: officeAddress,
          office_instructions: officeInstructions,
          online_instructions: onlineInstructions,
          payment_instructions: paymentInstructions,
          social_links_json: socialLinks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setMessage('Profile and site settings saved successfully.');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-[#52605A] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#285748]" />
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#D9DCD2] pb-4 gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#192B2A]">
            Profile & Operational Settings
          </h2>
          <p className="text-xs text-[#52605A]">
            Configure the researcher&apos;s professional identity, biography, qualifications, CV, and instructions.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-900 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Identity & Portrait */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
          1. Professional Identity & Portrait
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#192B2A] mb-1">
              Full Researcher Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              value={researcherName}
              onChange={(e) => setResearcherName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#192B2A] mb-1">
              Professional Title <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#192B2A] mb-1">
              Portrait Image Asset
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={portraitUrl}
                onChange={(e) => setPortraitUrl(e.target.value)}
                placeholder="/uploads/portrait.jpg"
                className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded font-mono"
              />
              <label className="px-3 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded cursor-pointer shrink-0 hover:bg-[#1e4337]">
                <Upload className="w-3.5 h-3.5 inline mr-1" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'portrait')}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-[#52605A] mt-1">Recommended size: 600x750px JPG or PNG.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#192B2A] mb-1">
              Curriculum Vitae (PDF)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                placeholder="/uploads/cv.pdf"
                className="w-full px-3 py-2 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded font-mono"
              />
              <label className="px-3 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded cursor-pointer shrink-0 hover:bg-[#1e4337]">
                <Upload className="w-3.5 h-3.5 inline mr-1" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e, 'cv')}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-[#52605A] mt-1">Visitors can download this PDF on the About page.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#192B2A] mb-1">
            Biographical Statement
          </label>
          <textarea
            rows={5}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]"
          />
        </div>
      </div>

      {/* 2. Hero Headline & Intro */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
          2. Homepage Hero Section
        </h3>
        <div>
          <label className="block text-xs font-semibold text-[#192B2A] mb-1">
            Hero Headline (Serif Heading)
          </label>
          <textarea
            rows={2}
            value={heroHeadline}
            onChange={(e) => setHeroHeadline(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded font-serif text-lg text-[#192B2A]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#192B2A] mb-1">
            Hero Introduction (Subheadline)
          </label>
          <textarea
            rows={2}
            value={heroIntro}
            onChange={(e) => setHeroIntro(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]"
          />
        </div>
      </div>

      {/* 3. Qualifications, Interests & Affiliations */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-6">
        <h3 className="font-serif text-lg font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
          3. Academic Lists
        </h3>

        {/* Qualifications */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#192B2A]">
            Academic Qualifications
          </label>
          <div className="space-y-1.5">
            {qualifications.map((q, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#F7F5EF] p-2 rounded text-xs">
                <span className="flex-1">{q}</span>
                <button
                  type="button"
                  onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                  className="text-red-700 hover:text-red-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="e.g. Ph.D. in Economics, University of Dar es Salaam"
              value={newQual}
              onChange={(e) => setNewQual(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
            />
            <button
              type="button"
              onClick={() => {
                if (newQual.trim()) {
                  setQualifications([...qualifications, newQual.trim()]);
                  setNewQual('');
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-[#285748] text-white rounded"
            >
              Add
            </button>
          </div>
        </div>

        {/* Research Interests */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#192B2A]">
            Research Interests
          </label>
          <div className="space-y-1.5">
            {researchInterests.map((interest, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#F7F5EF] p-2 rounded text-xs">
                <span className="flex-1">{interest}</span>
                <button
                  type="button"
                  onClick={() => setResearchInterests(researchInterests.filter((_, i) => i !== idx))}
                  className="text-red-700 hover:text-red-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="e.g. Fiscal Policy & Sovereign Debt Sustainability"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
            />
            <button
              type="button"
              onClick={() => {
                if (newInterest.trim()) {
                  setResearchInterests([...researchInterests, newInterest.trim()]);
                  setNewInterest('');
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-[#285748] text-white rounded"
            >
              Add
            </button>
          </div>
        </div>

        {/* Affiliations */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#192B2A]">
            Institutional Affiliations
          </label>
          <div className="space-y-1.5">
            {affiliations.map((aff, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#F7F5EF] p-2 rounded text-xs">
                <span className="flex-1">{aff}</span>
                <button
                  type="button"
                  onClick={() => setAffiliations(affiliations.filter((_, i) => i !== idx))}
                  className="text-red-700 hover:text-red-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="e.g. Fellow, Tanzania Economic Association (TEA)"
              value={newAff}
              onChange={(e) => setNewAff(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded"
            />
            <button
              type="button"
              onClick={() => {
                if (newAff.trim()) {
                  setAffiliations([...affiliations, newAff.trim()]);
                  setNewAff('');
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-[#285748] text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* 4. Contact, Office & Consultation Policies */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
          4. Contact, Office & Consultation Instructions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#192B2A] mb-1">
              Official Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#192B2A] mb-1">
              Office Address in Dar es Salaam
            </label>
            <input
              type="text"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#192B2A] mb-1">
            In-Person Office Arrival Instructions
          </label>
          <textarea
            rows={2}
            value={officeInstructions}
            onChange={(e) => setOfficeInstructions(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#192B2A] mb-1">
            Online Video Meeting Instructions
          </label>
          <textarea
            rows={2}
            value={onlineInstructions}
            onChange={(e) => setOnlineInstructions(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#192B2A] mb-1">
            External Payment Instructions (For Paid Advisory Services)
          </label>
          <textarea
            rows={3}
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]"
          />
          <p className="text-[11px] text-[#52605A] mt-1">
            Specify bank details (CRDB, NMB) or mobile money numbers (M-Pesa) shown to guests with paid bookings.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>
    </form>
  );
}
