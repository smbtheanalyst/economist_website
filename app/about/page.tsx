import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Download,
  GraduationCap,
  Award,
  BookOpen,
  Building2,
  Mail,
  MapPin,
  Calendar,
  Compass,
  Target,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { getSiteSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'About TEFPC | Mission, Structure & Leadership',
  description: 'Learn about Tanzania Economic and Financial Policy Consultancy (TEFPC), our institutional mission, research focus, and executive leadership led by Dr. Hamis Miraji Ally Simba.',
};

export default function AboutPage() {
  const settings = getSiteSettings();

  const qualifications: string[] = JSON.parse(settings.qualifications_json || '[]');
  const researchInterests: string[] = JSON.parse(settings.research_interests_json || '[]');
  const affiliations: string[] = JSON.parse(settings.affiliations_json || '[]');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. INSTITUTIONAL HEADER & SUBNAV */}
      <div className="border-b border-[#D9DCD2] pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9EDE4] text-[#285748] rounded text-xs font-semibold uppercase tracking-wider">
          Institutional Profile & Governance
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A] leading-tight">
          About Tanzania Economic and Financial Policy Consultancy (TEFPC)
        </h1>

        <p className="text-lg text-[#52605A] font-light max-w-3xl leading-relaxed">
          An independent research institution and economic consultancy headquartered in Dar es Salaam, dedicated to rigorous empirical analysis, financial sector policy evaluation, and sovereign advisory in Tanzania and East Africa.
        </p>

        {/* Section Quick Jump Links */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <a
            href="#who-we-are"
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#E9EDE4] text-[#285748] hover:bg-[#DCE3D7] transition-colors"
          >
            Who We Are
          </a>
          <a
            href="#mission"
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#E9EDE4] text-[#285748] hover:bg-[#DCE3D7] transition-colors"
          >
            Mission & Vision
          </a>
          <a
            href="#leadership"
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#285748] text-white hover:bg-[#1e4337] transition-colors"
          >
            Leadership & Team
          </a>
        </div>
      </div>

      {/* 2. WHO WE ARE */}
      <section id="who-we-are" className="space-y-6 scroll-mt-24">
        <div className="border-b border-[#D9DCD2] pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
            01. Background & Scope
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            Who We Are
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-8 space-y-4 text-sm sm:text-base text-[#192B2A] leading-relaxed">
            <p>
              Tanzania Economic and Financial Policy Consultancy (TEFPC) was established to bridge academic economic research and real-world policymaking. Operating from the commercial center of Dar es Salaam, TEFPC provides evidence-based analysis, advanced econometric modeling, and technical policy advisory to national ministries, development partners, regional economic bodies, and private sector stakeholders.
            </p>
            <p>
              Our institutional work emphasizes structural transformation, macroeconomic stability, sovereign debt sustainability, financial deepening, and trade facilitation across the East African Community (EAC) and the Southern African Development Community (SADC).
            </p>
            <p className="text-xs sm:text-sm text-[#52605A] bg-[#E9EDE4] p-4 rounded border-l-4 border-[#285748]">
              <strong>Headquarters:</strong> Rita Tower, 15th Floor, Simu 4 Street, Makunganya Road, Posta, Dar es Salaam, Tanzania. Consultations and stakeholder working sessions are hosted both in-person and via secure video conferences.
            </p>
          </div>

          <div className="md:col-span-4 bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm space-y-3">
            <h3 className="font-serif font-bold text-base text-[#192B2A]">
              Core Areas of Engagement
            </h3>
            <ul className="space-y-2 text-xs text-[#52605A]">
              <li className="flex items-start gap-2">
                <span className="text-[#285748] font-bold mt-0.5">•</span>
                <span>Macroeconomic policy & forecasting models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#285748] font-bold mt-0.5">•</span>
                <span>Fiscal policy rules & debt sustainability analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#285748] font-bold mt-0.5">•</span>
                <span>Financial sector evaluation & credit market access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#285748] font-bold mt-0.5">•</span>
                <span>Trade integration & regional value chains</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#285748] font-bold mt-0.5">•</span>
                <span>Agricultural policy & industrialization strategies</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. MISSION, VISION & PRINCIPLES */}
      <section id="mission" className="space-y-6 scroll-mt-24 pt-6 border-t border-[#D9DCD2]">
        <div className="border-b border-[#D9DCD2] pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
            02. Institutional Direction
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            Mission, Vision & Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-[#285748]">
              <Target className="w-5 h-5" />
              <h3 className="font-serif text-xl font-bold text-[#192B2A]">
                Our Mission
              </h3>
            </div>
            <p className="text-sm text-[#192B2A] leading-relaxed">
              To deliver rigorous, objective, and empirical economic and financial policy research that guides strategic decision-making, informs legislative and executive debates, and drives inclusive, sustainable economic growth in Tanzania.
            </p>
          </div>

          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-[#285748]">
              <Compass className="w-5 h-5" />
              <h3 className="font-serif text-xl font-bold text-[#192B2A]">
                Our Vision
              </h3>
            </div>
            <p className="text-sm text-[#192B2A] leading-relaxed">
              To be Tanzania’s foremost independent policy research consultancy and a globally respected center of excellence for applied macroeconomics and financial sector studies across Sub-Saharan Africa.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-4 bg-white border border-[#D9DCD2] rounded space-y-1.5">
            <h4 className="font-serif font-bold text-base text-[#192B2A]">Empirical Rigor</h4>
            <p className="text-xs text-[#52605A] leading-relaxed">
              All findings are grounded in validated datasets, replicable econometric methodology, and peer-reviewed literature.
            </p>
          </div>
          <div className="p-4 bg-white border border-[#D9DCD2] rounded space-y-1.5">
            <h4 className="font-serif font-bold text-base text-[#192B2A]">Policy Relevance</h4>
            <p className="text-xs text-[#52605A] leading-relaxed">
              Research questions address pressing structural challenges, fiscal trade-offs, and practical economic reform opportunities.
            </p>
          </div>
          <div className="p-4 bg-white border border-[#D9DCD2] rounded space-y-1.5">
            <h4 className="font-serif font-bold text-base text-[#192B2A]">Institutional Integrity</h4>
            <p className="text-xs text-[#52605A] leading-relaxed">
              Complete analytical independence, transparent peer review, and non-partisan evaluation of economic alternatives.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LEADERSHIP & TEAM: DR. HAMIS MIRAJI ALLY SIMBA */}
      <section id="leadership" className="space-y-8 scroll-mt-24 pt-6 border-t border-[#D9DCD2]">
        <div className="border-b border-[#D9DCD2] pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
            03. Leadership & Research Directorate
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] mt-1">
            Executive Leadership & Senior Team
          </h2>
          <p className="text-xs sm:text-sm text-[#52605A]">
            TEFPC is directed by senior Tanzanian economists and researchers with deep academic grounding and advisory experience.
          </p>
        </div>

        {/* Leader Profile Card: Dr. Hamis Simba */}
        <div className="bg-white border border-[#D9DCD2] rounded-md p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Portrait & Info Sidebar */}
            <div className="md:col-span-4 space-y-4">
              <div className="w-full aspect-[4/5] bg-[#E9EDE4] rounded overflow-hidden border border-[#D9DCD2] relative">
                {settings.portrait_url ? (
                  <Image
                    src={settings.portrait_url}
                    alt={settings.researcher_name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-[#285748]">
                    {settings.researcher_name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#192B2A]">
                  {settings.researcher_name}
                </h3>
                <p className="text-xs text-[#285748] font-semibold">
                  Senior Economist · Lead Consultant · Director
                </p>
                <p className="text-[11px] text-[#52605A]">
                  {settings.professional_title}
                </p>
              </div>

              {settings.cv_url && (
                <div className="pt-2">
                  <a
                    href={settings.cv_url}
                    download
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Public CV (PDF)</span>
                  </a>
                </div>
              )}
            </div>

            {/* Biography & Editorial Text */}
            <div className="md:col-span-8 space-y-5">
              <h4 className="font-serif text-lg font-bold text-[#192B2A] border-b border-[#D9DCD2] pb-2">
                Academic & Professional Biography
              </h4>
              <div className="text-sm sm:text-base text-[#192B2A] leading-relaxed whitespace-pre-line space-y-3 font-light">
                {settings.biography || 'Biography details to be configured.'}
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-white rounded hover:bg-[#1e4337] transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation Session</span>
                </Link>
                <Link
                  href="/research"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#E9EDE4] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Published Papers & Studies</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Qualifications & Research Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#D9DCD2]">
            {/* Qualifications */}
            <div className="bg-[#E9EDE4] p-5 rounded space-y-3">
              <div className="flex items-center gap-2 text-[#285748]">
                <GraduationCap className="w-4 h-4" />
                <h5 className="font-serif font-bold text-sm text-[#192B2A]">
                  Academic Qualifications
                </h5>
              </div>
              <ul className="space-y-2 text-xs text-[#192B2A]">
                {qualifications.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285748] mt-1.5 shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Primary Research Interests */}
            <div className="bg-[#E9EDE4] p-5 rounded space-y-3">
              <div className="flex items-center gap-2 text-[#285748]">
                <BookOpen className="w-4 h-4" />
                <h5 className="font-serif font-bold text-sm text-[#192B2A]">
                  Primary Research Interests
                </h5>
              </div>
              <ul className="space-y-2 text-xs text-[#192B2A]">
                {researchInterests.map((interest, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285748] mt-1.5 shrink-0" />
                    <span>{interest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Affiliations */}
          {affiliations.length > 0 && (
            <div className="pt-4 border-t border-[#D9DCD2] space-y-3">
              <div className="flex items-center gap-2 text-[#285748]">
                <Award className="w-4 h-4" />
                <h5 className="font-serif font-bold text-sm text-[#192B2A]">
                  Professional Affiliations & Editorial Roles
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {affiliations.map((aff, idx) => (
                  <div key={idx} className="p-2.5 bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A]">
                    {aff}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
