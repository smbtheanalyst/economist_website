import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar, ArrowLeft, Newspaper } from 'lucide-react';
import { getNewsBySlug } from '@/lib/data';

interface NewsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsBySlug(slug, false);
  if (!article) return {};

  return {
    title: `${article.title} | News | TEFPC`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.cover_image_url
        ? [{ url: article.cover_image_url, alt: article.cover_image_alt || article.title }]
        : [],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;

  // Public visitor: strictly published news only
  const article = getNewsBySlug(slug, false);
  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-[#52605A]">
        <Link href="/" className="hover:text-[#285748] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/news" className="hover:text-[#285748] transition-colors">
          News
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#192B2A] font-medium truncate">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4 border-b border-[#D9DCD2] pb-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-[#E9EDE4] text-[#285748] rounded">
            {article.category}
          </span>
          <span className="text-xs text-[#52605A] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#285748]" />
            {new Date(article.published_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#192B2A] leading-tight">
          {article.title}
        </h1>

        {article.summary && (
          <p className="text-lg text-[#52605A] leading-relaxed font-light">
            {article.summary}
          </p>
        )}
      </header>

      {/* Optional Cover Image */}
      {article.cover_image_url && (
        <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden border border-[#D9DCD2] bg-[#E9EDE4]">
          <Image
            src={article.cover_image_url}
            alt={article.cover_image_alt || article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Full Content */}
      <article
        className="prose prose-stone max-w-none text-[#192B2A] leading-relaxed prose-headings:font-serif prose-headings:text-[#192B2A] prose-a:text-[#285748] prose-a:underline"
        dangerouslySetInnerHTML={{ __html: article.content_html }}
      />

      {/* Footer Return Link */}
      <div className="pt-8 border-t border-[#D9DCD2] flex items-center justify-between">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#285748] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All News</span>
        </Link>

        <Link
          href="/events"
          className="text-xs text-[#52605A] hover:text-[#285748]"
        >
          View Upcoming Economics Events →
        </Link>
      </div>
    </div>
  );
}
