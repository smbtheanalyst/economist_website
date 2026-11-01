import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, ExternalLink, Shield } from 'lucide-react';
import type { SiteSettings } from '@/lib/data';

export default function Footer({ settings }: { settings: SiteSettings }) {
  let socialLinks: { label: string; url: string }[] = [];
  try {
    socialLinks = JSON.parse(settings.social_links_json || '[]');
  } catch {}

  return (
    <footer className="border-t border-[#D9DCD2] bg-[#E9EDE4] text-[#192B2A] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Institutional Identity & Office */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="font-serif text-2xl font-bold text-[#285748]">
                TEFPC
              </span>
              <p className="text-xs uppercase tracking-wider text-[#52605A] font-semibold mt-0.5">
                Tanzania Economic and Financial Policy Consultancy
              </p>
            </div>

            <p className="text-sm text-[#52605A] max-w-md leading-relaxed">
              An independent consultancy and policy research institution providing evidence-based economic analysis, macroeconomic modelling, financial sector evaluation, and strategic advisory services in Tanzania.
            </p>

            <div className="pt-2 space-y-2 text-sm text-[#52605A]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#285748] mt-0.5 shrink-0" />
                <span>{settings.office_address}</span>
              </div>
              {settings.contact_email ? (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#285748] shrink-0" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-[#285748] underline">
                    {settings.contact_email}
                  </a>
                </div>
              ) : (
                <div className="text-xs text-[#52605A] italic">
                  Inquiries and communications are received via our{' '}
                  <Link href="/ask" className="text-[#285748] underline font-medium">
                    Direct Inquiry Form
                  </Link>.
                </div>
              )}
            </div>
          </div>

          {/* Institutional Overview */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Institution & Research
            </h4>
            <ul className="space-y-2 text-sm text-[#52605A]">
              <li>
                <Link href="/about" className="hover:text-[#285748]">
                  Who We Are
                </Link>
              </li>
              <li>
                <Link href="/about#mission" className="hover:text-[#285748]">
                  Mission & Vision
                </Link>
              </li>
              <li>
                <Link href="/about#leadership" className="hover:text-[#285748]">
                  Leadership & Team
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-[#285748]">
                  Research & Publications
                </Link>
              </li>
              <li>
                <Link href="/research?type=Policy+Brief" className="hover:text-[#285748]">
                  Policy Briefs
                </Link>
              </li>
            </ul>
          </div>

          {/* Projects & Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Projects & Engagements
            </h4>
            <ul className="space-y-2 text-sm text-[#52605A]">
              <li>
                <Link href="/projects" className="hover:text-[#285748]">
                  Projects Portfolio
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-[#285748]">
                  Our Partners
                </Link>
              </li>
              <li>
                <Link href="/partners/partner-with-us" className="hover:text-[#285748]">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#285748]">
                  Latest News
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#285748]">
                  Events & Dialogues
                </Link>
              </li>
              <li>
                <Link href="/news/media-gallery" className="hover:text-[#285748]">
                  Media Gallery
                </Link>
              </li>
              <li>
                <Link href="/insights" className="hover:text-[#285748]">
                  Insights & Commentary
                </Link>
              </li>
            </ul>
          </div>

          {/* Advisory & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Advisory & Contact
            </h4>
            <ul className="space-y-2 text-sm text-[#52605A]">
              <li>
                <Link href="/consultation" className="hover:text-[#285748] font-medium text-[#285748]">
                  Book a Consultation
                </Link>
              </li>
              <li>
                <Link href="/ask" className="hover:text-[#285748]">
                  Ask a Question
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="hover:text-[#285748]">
                  Subscribe to Briefs
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#285748]">
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#285748] text-xs opacity-75 inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>TEFPC Admin Portal</span>
                </Link>
              </li>
            </ul>

            {socialLinks.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium text-[#192B2A] mb-1.5">Profiles</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {socialLinks.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#285748] hover:underline inline-flex items-center gap-1"
                    >
                      {s.label}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Rule & Metadata */}
        <div className="border-t border-[#D9DCD2] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#52605A] gap-4">
          <p>
            © {new Date().getFullYear()} Tanzania Economic and Financial Policy Consultancy (TEFPC). All rights reserved.
          </p>
          <p>
            Rita Tower, 15th Floor, Posta, Dar es Salaam • Timezone: Africa/Dar_es_Salaam (EAT, UTC+3)
          </p>
        </div>
      </div>
    </footer>
  );
}
