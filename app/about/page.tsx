import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Download, GraduationCap, Award, BookOpen, Building2, Mail, MapPin, Calendar } from 'lucide-react';
import { getSiteSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Biography & Academic Background',
  description: 'Curriculum Vitae, academic qualifications, affiliations, and research interests of Dr. Juma M. Mwangi.',
};

export default function AboutPage() {
  const settings = getSiteSettings();

  const qualifications: string[] = JSON.parse(settings.qualifications_json || '[]');
  const researchInterests: string[] = JSON.parse(settings.research_interests_json || '[]');
  const affiliations: string[] = JSON.parse(settings.affiliations_json || '[]');

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="border-b border-[#D9DCD2] pb-8 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Academic & Professional Profile
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          About {settings.researcher_name}
        </h1>
        <p className="text-lg text-[#52605A] font-light">
          {settings.professional_title}
        </p>
      </div>

      {/* Main Grid: Portrait + Biography */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 space-y-4">
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm">
            <div className="w-full aspect-[4/5] bg-[#DCE3D7] rounded-sm overflow-hidden border border-[#D9DCD2]">
              {settings.portrait_url ? (
                <img
                  src={settings.portrait_url}
                  alt={settings.researcher_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-[#285748]">
                  {settings.researcher_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#D9DCD2] space-y-2 text-xs text-[#52605A]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#285748] shrink-0" />
                <span>{settings.office_address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#285748] shrink-0" />
                <span>{settings.contact_email}</span>
              </div>
            </div>

            {settings.cv_url && (
              <div className="mt-4 pt-3 border-t border-[#D9DCD2]">
                <a
                  href={settings.cv_url}
                  download
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Curriculum Vitae (PDF)</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Biography Content */}
        <div className="md:col-span-8 space-y-6">
          <div className="prose-editorial">
            <h2 className="font-serif text-2xl font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2 mb-4">
              Biographical Overview
            </h2>
            <div className="text-base text-[#192B2A] leading-relaxed whitespace-pre-line space-y-4">
              {settings.biography || 'Biography details to be provided.'}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book an Advisory Session</span>
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-[#285748] text-[#285748] rounded hover:bg-[#E9EDE4] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Publications</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Qualifications & Research Interests Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#D9DCD2]">
        {/* Qualifications */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-[#285748]">
            <GraduationCap className="w-5 h-5" />
            <h3 className="font-serif text-xl font-medium text-[#192B2A]">
              Academic Qualifications
            </h3>
          </div>
          <ul className="space-y-3">
            {qualifications.map((q, idx) => (
              <li key={idx} className="text-sm text-[#192B2A] flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#285748] mt-2 shrink-0" />
                <span>{q}</span>
              </li>
            ))}
            {qualifications.length === 0 && (
              <li className="text-sm text-[#52605A] italic">Qualifications to be configured.</li>
            )}
          </ul>
        </div>

        {/* Research Interests */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-[#285748]">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-serif text-xl font-medium text-[#192B2A]">
              Primary Research Interests
            </h3>
          </div>
          <ul className="space-y-3">
            {researchInterests.map((interest, idx) => (
              <li key={idx} className="text-sm text-[#192B2A] flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#285748] mt-2 shrink-0" />
                <span>{interest}</span>
              </li>
            ))}
            {researchInterests.length === 0 && (
              <li className="text-sm text-[#52605A] italic">Research interests to be configured.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Professional Affiliations */}
      <div className="bg-[#F7F5EF] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
        <div className="flex items-center gap-2 text-[#285748]">
          <Building2 className="w-5 h-5" />
          <h3 className="font-serif text-xl font-medium text-[#192B2A]">
            Institutional & Professional Affiliations
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {affiliations.map((aff, idx) => (
            <div key={idx} className="p-3 bg-[#E9EDE4] border border-[#DCE3D7] rounded text-sm text-[#192B2A] flex items-start gap-2">
              <Award className="w-4 h-4 text-[#285748] mt-0.5 shrink-0" />
              <span>{aff}</span>
            </div>
          ))}
          {affiliations.length === 0 && (
            <p className="text-sm text-[#52605A] italic">Affiliations to be configured.</p>
          )}
        </div>
      </div>
    </div>
  );
}
