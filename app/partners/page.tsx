import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Handshake, ExternalLink, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { getPartners, type PartnerItem } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Institutional Partners & Collaborations | TEFPC',
  description: 'Verified institutional partners, academic institutions, and economic research collaborators working with TEFPC in Tanzania.',
};

export default function PartnersPage() {
  const partners = getPartners({ includeDrafts: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Institutional Relationships
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Our Partners & Collaborators
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-3xl leading-relaxed">
          TEFPC collaborates with national economic policy think tanks, universities, international research bodies, and development partners on evidence-based economic studies and policy dialogues.
        </p>

        <div className="pt-2">
          <Link
            href="/partners/partner-with-us"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#285748] hover:underline"
          >
            <span>Interested in institutional collaboration? Read our partnership framework →</span>
          </Link>
        </div>
      </div>

      {/* Partners Grid */}
      {partners.length === 0 ? (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-8 rounded text-center space-y-3">
          <Handshake className="w-10 h-10 text-[#285748] mx-auto opacity-60" />
          <h3 className="font-serif text-lg font-bold text-[#192B2A]">
            Partnership Portfolio Under Regular Review
          </h3>
          <p className="text-xs text-[#52605A] max-w-md mx-auto">
            TEFPC only publishes verified partnerships backed by active memoranda, joint research studies, or co-convened policy dialogues.
          </p>
          <div className="pt-2">
            <Link
              href="/partners/partner-with-us"
              className="px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337]"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#D9DCD2] rounded-md p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-4">
                {/* Logo / Monogram */}
                <div className="flex items-center justify-between">
                  {p.logo_url ? (
                    <div className="relative w-16 h-12 rounded border border-[#D9DCD2] overflow-hidden bg-white">
                      <Image
                        src={p.logo_url}
                        alt={p.logo_alt || p.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-[#E9EDE4] border border-[#D9DCD2] flex items-center justify-center font-serif font-bold text-lg text-[#285748]">
                      {p.name.charAt(0)}
                    </div>
                  )}

                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#E9EDE4] text-[#285748] rounded">
                    {p.relationship_type || 'Institutional Partner'}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-[#192B2A] group-hover:text-[#285748] transition-colors">
                    {p.name}
                  </h3>
                  {p.relationship_description && (
                    <p className="text-xs text-[#52605A] mt-2 leading-relaxed">
                      {p.relationship_description}
                    </p>
                  )}
                </div>
              </div>

              {p.website_url && (
                <div className="pt-4 mt-4 border-t border-[#E9EDE4]">
                  <a
                    href={p.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#285748] hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Partner With Us CTA Banner */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-8 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-[#285748]">
            <Building2 className="w-5 h-5 shrink-0" />
            <h2 className="font-serif text-xl font-bold text-[#192B2A]">
              Explore Joint Research or Policy Advisory
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed">
            We partner with multilateral institutions, government agencies, universities, and civil society on commissioned economic evaluations and technical dialogues in Tanzania.
          </p>
        </div>

        <Link
          href="/partners/partner-with-us"
          className="px-6 py-3 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337] shadow-sm transition-colors shrink-0"
        >
          Partner With Us →
        </Link>
      </div>
    </div>
  );
}
