import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Share2, Tag } from 'lucide-react';
import { getInsightBySlug, getSiteSettings } from '@/lib/data';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const allowDraft = preview === 'true';
  const insight = getInsightBySlug(slug, allowDraft);

  if (!insight) {
    return { title: 'Article Not Found' };
  }

  return {
    title: insight.title,
    description: insight.summary,
    openGraph: {
      title: insight.title,
      description: insight.summary,
      type: 'article',
      publishedTime: insight.published_at || undefined,
    },
  };
}

export default async function InsightDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const allowDraft = preview === 'true';
  const insight = getInsightBySlug(slug, allowDraft);
  const settings = getSiteSettings();

  if (!insight) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto space-y-10">
      {/* Draft Alert if viewing preview */}
      {insight.status === 'draft' && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded flex items-center justify-between">
          <span className="font-semibold uppercase tracking-wider">
            Draft Preview Mode — This article is not yet visible to the public.
          </span>
          <Link href="/admin/insights" className="underline font-medium">
            Back to Admin
          </Link>
        </div>
      )}

      {/* Back link */}
      <div>
        <Link
          href="/insights"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#285748] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ideas & Insights</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="border-b border-[#D9DCD2] pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#52605A]">
          <span className="px-2.5 py-0.5 rounded bg-[#E9EDE4] text-[#285748] font-semibold">
            {insight.topic}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {insight.read_time_minutes} min read
          </span>
          <span>•</span>
          <span>
            {insight.published_at
              ? new Date(insight.published_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Draft'}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#192B2A] leading-[1.2]">
          {insight.title}
        </h1>

        <p className="text-lg text-[#52605A] leading-relaxed font-light italic">
          {insight.summary}
        </p>

        <div className="pt-2 flex items-center justify-between text-xs text-[#52605A]">
          <div>
            By <span className="font-semibold text-[#192B2A]">{settings.researcher_name}</span>
          </div>
        </div>
      </header>

      {/* Optional Cover Image */}
      {insight.cover_image_url && (
        <div className="rounded-sm overflow-hidden border border-[#D9DCD2]">
          <img
            src={insight.cover_image_url}
            alt={insight.title}
            className="w-full max-h-[450px] object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <div
        className="prose-editorial max-w-none text-[#192B2A]"
        dangerouslySetInnerHTML={{ __html: insight.content_html }}
      />

      {/* Bottom Author Box & CTA */}
      <div className="border-t border-[#D9DCD2] pt-8 mt-12 space-y-6">
        <div className="p-6 bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[#DCE3D7] flex items-center justify-center shrink-0 border border-[#D9DCD2]">
            <span className="font-serif text-2xl font-bold text-[#285748]">
              {settings.researcher_name.charAt(0)}
            </span>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-serif text-lg font-medium text-[#192B2A]">{settings.researcher_name}</p>
            <p className="text-xs text-[#52605A] leading-relaxed">
              {settings.professional_title} based in Dar es Salaam. Specializing in macroeconomic policy, regional integration, and empirical fiscal research across East Africa.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 text-xs">
              <Link href="/consultation" className="text-[#285748] font-medium hover:underline">
                Book Consultation →
              </Link>
              <Link href="/ask" className="text-[#52605A] hover:underline">
                Ask a Question →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
