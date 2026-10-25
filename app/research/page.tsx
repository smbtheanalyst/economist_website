import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, ExternalLink, FileText, Search } from 'lucide-react';
import { getPublishedResearch } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Research & Academic Publications',
  description: 'Peer-reviewed articles, policy briefs, and working papers on Tanzanian macroeconomic policy, sovereign debt, and regional trade integration.',
};

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentType = resolvedParams.type || 'all';
  const searchQuery = resolvedParams.q || '';

  const papers = getPublishedResearch({
    type: currentType,
    search: searchQuery,
  });

  const publicationTypes = [
    'Journal Article',
    'Working Paper',
    'Policy Brief',
    'Book Chapter',
    'Report',
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Scholarly Output
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Research & Publications
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-2xl">
          Peer-reviewed journal papers, institutional policy briefs, and working papers contributing to evidence-based economic policymaking in Tanzania and the EAC.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#E9EDE4] p-4 border border-[#D9DCD2] rounded-sm">
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/research${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              currentType === 'all'
                ? 'bg-[#285748] text-[#F7F5EF] font-semibold'
                : 'bg-[#F7F5EF] text-[#192B2A] hover:bg-[#DCE3D7]'
            }`}
          >
            All Publications ({papers.length})
          </Link>
          {publicationTypes.map((t) => (
            <Link
              key={t}
              href={`/research?type=${encodeURIComponent(t)}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''
              }`}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                currentType === t
                  ? 'bg-[#285748] text-[#F7F5EF] font-semibold'
                  : 'bg-[#F7F5EF] text-[#192B2A] hover:bg-[#DCE3D7]'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/research" className="relative shrink-0 sm:w-64">
          <input type="hidden" name="type" value={currentType} />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search papers or authors..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748] focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-[#52605A] absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Papers List */}
      <div className="space-y-6">
        {papers.map((paper) => {
          const topics: string[] = JSON.parse(paper.topics_json || '[]');

          return (
            <div
              key={paper.id}
              className="bg-[#F7F5EF] border border-[#D9DCD2] p-6 sm:p-8 rounded-sm space-y-4 hover:border-[#285748] transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#52605A]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#E9EDE4] text-[#285748] font-semibold">
                    {paper.publication_type}
                  </span>
                  <span>•</span>
                  <span>Year: {paper.year}</span>
                  {paper.journal_publisher && (
                    <>
                      <span>•</span>
                      <span className="italic">{paper.journal_publisher}</span>
                    </>
                  )}
                </div>

                {paper.is_featured === 1 && (
                  <span className="px-2 py-0.5 rounded bg-[#285748] text-[#F7F5EF] text-[10px] font-semibold uppercase tracking-wider">
                    Selected Publication
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl font-medium text-[#192B2A] hover:text-[#285748] leading-snug">
                <Link href={`/research/${paper.slug}`}>
                  {paper.title}
                </Link>
              </h2>

              <p className="text-xs font-medium text-[#52605A]">
                Authors: <span className="text-[#192B2A]">{paper.authors}</span>
              </p>

              <p className="text-sm text-[#52605A] leading-relaxed line-clamp-3 font-light">
                {paper.abstract}
              </p>

              {topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-[#E9EDE4] text-[#52605A]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-[#D9DCD2] flex flex-wrap items-center justify-between gap-3 text-xs">
                <Link
                  href={`/research/${paper.slug}`}
                  className="font-medium text-[#285748] hover:underline inline-flex items-center gap-1"
                >
                  View Paper Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-3">
                  {paper.doi_url && (
                    <a
                      href={paper.doi_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#52605A] hover:text-[#285748] inline-flex items-center gap-1 underline"
                    >
                      <span>Journal DOI</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {paper.pdf_url && (
                    <a
                      href={paper.pdf_url}
                      download
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#E9EDE4] text-[#285748] font-medium hover:bg-[#DCE3D7] transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF Document</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {papers.length === 0 && (
          <div className="p-12 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center space-y-2">
            <p className="font-serif text-lg text-[#192B2A]">No publications found matching your search.</p>
            <p className="text-xs text-[#52605A]">Try resetting your filter options.</p>
          </div>
        )}
      </div>
    </div>
  );
}
