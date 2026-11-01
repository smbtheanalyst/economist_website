import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import { getPageBySlug } from '@/lib/data';
import { isReservedSlug } from '@/lib/sanitize';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug)) {
    return {};
  }

  const page = getPageBySlug(slug, false);
  if (!page) {
    return {};
  }

  return {
    title: page.seo_title || page.title,
    description: page.seo_description || page.summary,
    openGraph: {
      title: page.seo_title || page.title,
      description: page.seo_description || page.summary,
      images: page.cover_image_url ? [{ url: page.cover_image_url, alt: page.cover_image_alt || page.title }] : [],
    },
  };
}

export default async function CustomDynamicPage({ params }: PageProps) {
  const { slug } = await params;

  if (isReservedSlug(slug)) {
    notFound();
  }

  // Public visitor: strictly published pages only
  const page = getPageBySlug(slug, false);
  if (!page) {
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
        <span className="text-[#192B2A] font-medium truncate">{page.title}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4 border-b border-[#D9DCD2] pb-6">
        <div className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-[#E9EDE4] text-[#285748] rounded">
          TEFPC Institutional Policy
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#192B2A] leading-tight">
          {page.title}
        </h1>

        {page.summary && (
          <p className="text-lg text-[#52605A] leading-relaxed font-light">
            {page.summary}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-[#52605A] pt-2">
          {page.published_at && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#285748]" />
              <span>
                Updated:{' '}
                {new Date(page.published_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Optional Cover Image */}
      {page.cover_image_url && (
        <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden border border-[#D9DCD2] bg-[#E9EDE4]">
          <Image
            src={page.cover_image_url}
            alt={page.cover_image_alt || page.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Page Sanitized Content */}
      <article
        className="prose prose-stone max-w-none text-[#192B2A] leading-relaxed prose-headings:font-serif prose-headings:text-[#192B2A] prose-a:text-[#285748] prose-a:underline"
        dangerouslySetInnerHTML={{ __html: page.content_html }}
      />

      {/* Footer Return Link */}
      <div className="pt-8 border-t border-[#D9DCD2]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#285748] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
