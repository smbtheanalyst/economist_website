import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, Calendar, MapPin, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { getProjects, type ProjectItem, type ProjectPartnerRole } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Projects Portfolio & Policy Studies',
  description: 'Ongoing and completed economic research, financial sector studies, and policy advisory projects by TEFPC in Tanzania and East Africa.',
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await paramsStatus(await searchParams);

  const projects = getProjects({
    status: status === 'completed' ? 'completed' : status === 'ongoing' ? 'ongoing' : 'all',
    includeDrafts: false,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Institutional Portfolio
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Projects & Policy Engagements
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-3xl leading-relaxed">
          Applied economic research, sovereign debt analysis, macroeconomic modelling, and financial policy advisory initiatives conducted by TEFPC and partner institutions.
        </p>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-4">
          <Link
            href="/projects"
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
              !status || status === 'all'
                ? 'bg-[#285748] text-white'
                : 'bg-[#E9EDE4] text-[#192B2A] hover:bg-[#DCE3D7]'
            }`}
          >
            All Projects
          </Link>
          <Link
            href="/projects?status=ongoing"
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
              status === 'ongoing'
                ? 'bg-[#285748] text-white'
                : 'bg-[#E9EDE4] text-[#192B2A] hover:bg-[#DCE3D7]'
            }`}
          >
            Ongoing
          </Link>
          <Link
            href="/projects?status=completed"
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
              status === 'completed'
                ? 'bg-[#285748] text-white'
                : 'bg-[#E9EDE4] text-[#192B2A] hover:bg-[#DCE3D7]'
            }`}
          >
            Completed
          </Link>
        </div>
      </div>

      {/* Projects Listing */}
      {projects.length === 0 ? (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-8 rounded text-center space-y-3">
          <Briefcase className="w-10 h-10 text-[#285748] mx-auto opacity-60" />
          <h3 className="font-serif text-lg font-bold text-[#192B2A]">
            No Published Projects in this Category
          </h3>
          <p className="text-xs text-[#52605A] max-w-md mx-auto">
            TEFPC’s project portfolio is updated as research initiatives and formal policy advisory studies complete review and publication.
          </p>
          <Link
            href="/consultation"
            className="inline-block mt-2 px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337]"
          >
            Inquire About Commissioned Studies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p) => {
            let partners: ProjectPartnerRole[] = [];
            try {
              partners = JSON.parse(p.partner_organizations_json || '[]');
            } catch {}

            return (
              <div
                key={p.id}
                className="bg-white border border-[#D9DCD2] rounded-md overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  {/* Optional Cover */}
                  {p.cover_image_url ? (
                    <div className="relative w-full aspect-[16/9] bg-[#E9EDE4] border-b border-[#D9DCD2]">
                      <Image
                        src={p.cover_image_url}
                        alt={p.cover_image_alt || p.title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-3 bg-gradient-to-r from-[#285748] to-[#192B2A]" />
                  )}

                  <div className="p-6 space-y-3">
                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#E9EDE4] text-[#285748] rounded">
                        {p.research_theme || 'Economic Policy'}
                      </span>
                      {p.project_status === 'completed' ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-800 rounded inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Ongoing
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif text-xl font-bold text-[#192B2A] group-hover:text-[#285748] transition-colors leading-snug">
                      <Link href={`/projects/${p.slug}`}>
                        {p.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed line-clamp-3">
                      {p.summary}
                    </p>

                    {/* Timeline & Location */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                      {(p.start_date || p.end_date) && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#285748]" />
                          {[p.start_date, p.end_date].filter(Boolean).join(' – ')}
                        </span>
                      )}
                      {p.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#285748]" />
                          {p.location}
                        </span>
                      )}
                    </div>

                    {/* Partner attribution tags */}
                    {partners.length > 0 && (
                      <div className="pt-2 border-t border-[#E9EDE4] flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">In Collaboration with:</span>
                        {partners.slice(0, 2).map((part, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium"
                          >
                            {part.name}
                          </span>
                        ))}
                        {partners.length > 2 && (
                          <span className="text-[10px] text-gray-500">+{partners.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-3 bg-[#F7F5EF] border-t border-[#D9DCD2] flex items-center justify-between">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Project Details & Outputs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

async function paramsStatus(params: { status?: string }) {
  return { status: params?.status };
}
