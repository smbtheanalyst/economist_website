import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, FileText, Bookmark, Share2 } from 'lucide-react';
import { getResearchBySlug, getSiteSettings } from '@/lib/data';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const allowDraft = preview === 'true';
  const paper = getResearchBySlug(slug, allowDraft);

  if (!paper) {
    return { title: 'Publication Not Found' };
  }

  return {
    title: paper.title,
    description: paper.abstract.substring(0, 160),
    openGraph: {
      title: paper.title,
      description: paper.abstract.substring(0, 160),
      type: 'article',
    },
  };
}

export default async function ResearchDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const allowDraft = preview === 'true';
  const paper = getResearchBySlug(slug, allowDraft);
  const settings = getSiteSettings();

  if (!paper) {
    notFound();
  }

  const topics: string[] = JSON.parse(paper.topics_json || '[]');

  // Generate suggested citation
  const apaCitation = `${paper.authors} (${paper.year}). ${paper.title}. ${
    paper.journal_publisher ? `${paper.journal_publisher}. ` : ''
  }${paper.doi_url ? paper.doi_url : ''}`;

  return (
    <article className="max-w-3xl mx-auto space-y-10">
      {/* Draft Notice if preview */}
      {paper.status === 'draft' && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded flex items-center justify-between">
          <span className="font-semibold uppercase tracking-wider">
            Draft Preview Mode — This paper is currently unpublished.
          </span>
          <Link href="/admin/research" className="underline font-medium">
            Back to Admin
          </Link>
        </div>
      )}

      {/* Back link */}
      <div>
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#285748] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Research & Publications</span>
        </Link>
      </div>

      {/* Header */}
      <header className="border-b border-[#D9DCD2] pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#52605A]">
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

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#192B2A] leading-[1.2]">
          {paper.title}
        </h1>

        <div className="pt-2 text-sm text-[#52605A] space-y-1">
          <p>
            <span className="font-semibold text-[#192B2A]">Authors:</span> {paper.authors}
          </p>
        </div>

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {topics.map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded text-xs bg-[#E9EDE4] text-[#285748]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Action Buttons: PDF & External DOI */}
      <div className="p-6 bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-serif text-lg font-medium text-[#192B2A]">Access Paper Resources</p>
          <p className="text-xs text-[#52605A]">Download the official preprint or navigate to the journal catalog.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {paper.pdf_url && (
            <a
              href={paper.pdf_url}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Paper (PDF)</span>
            </a>
          )}

          {paper.doi_url && (
            <a
              href={paper.doi_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#DCE3D7] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Publisher Record / DOI</span>
            </a>
          )}
        </div>
      </div>

      {/* Abstract Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
          Abstract
        </h2>
        <div className="prose-editorial text-base text-[#192B2A] leading-relaxed font-light">
          <p>{paper.abstract}</p>
        </div>
      </div>

      {/* Citation Box */}
      <div className="p-5 bg-[#F7F5EF] border border-[#D9DCD2] rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-[#285748] text-xs font-semibold uppercase tracking-wider">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Recommended Citation (APA)</span>
        </div>
        <p className="text-xs text-[#52605A] font-mono leading-relaxed bg-[#E9EDE4] p-3 rounded border border-[#DCE3D7]">
          {apaCitation}
        </p>
      </div>

      {/* Author Consultation CTA */}
      <div className="border-t border-[#D9DCD2] pt-8 mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#E9EDE4] p-6 rounded-sm">
        <div>
          <h3 className="font-serif text-xl font-medium text-[#192B2A]">
            Inquire About This Research
          </h3>
          <p className="text-xs text-[#52605A] mt-1">
            Need methodology clarification, dataset consultation, or institutional policy advisory?
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/consultation"
            className="px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            Book Consultation
          </Link>
          <Link
            href="/ask"
            className="px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#DCE3D7] transition-colors"
          >
            Ask a Question
          </Link>
        </div>
      </div>
    </article>
  );
}
