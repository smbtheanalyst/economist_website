import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar, ArrowLeft, Newspaper, Camera, Briefcase, MapPin } from 'lucide-react';
import { getNewsBySlug, getProjectsByIds, getEventsByIds } from '@/lib/data';

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

  let galleryImages: { url: string; caption?: string }[] = [];
  let relatedProjectIds: number[] = [];
  let relatedEventIds: number[] = [];

  try { galleryImages = JSON.parse(article.gallery_images_json || '[]'); } catch {}
  try { relatedProjectIds = JSON.parse(article.related_project_ids_json || '[]'); } catch {}
  try { relatedEventIds = JSON.parse(article.related_event_ids_json || '[]'); } catch {}

  const relatedProjects = getProjectsByIds(relatedProjectIds);
  const relatedEvents = getEventsByIds(relatedEventIds);

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

      {/* News Photo Gallery */}
      {galleryImages.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#D9DCD2]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#285748]" />
            <h3 className="font-serif font-bold text-xl text-[#192B2A]">
              Announcement Photo Gallery
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <div key={i} className="group rounded-md overflow-hidden border border-[#D9DCD2] bg-white shadow-sm space-y-2 pb-2">
                <div className="relative aspect-[4/3] w-full bg-[#E9EDE4] overflow-hidden">
                  <Image
                    src={img.url}
                    alt={img.caption || `News image #${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {img.caption && (
                  <p className="text-xs text-[#52605A] px-3 line-clamp-2">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Institutional Projects */}
      {relatedProjects.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#D9DCD2]">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#285748]" />
            <h3 className="font-serif font-bold text-xl text-[#192B2A]">
              Related Institutional Projects
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group block p-4 bg-[#F7F5EF] border border-[#D9DCD2] rounded-md hover:border-[#285748] hover:bg-white transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded font-semibold bg-[#E9EDE4] text-[#285748]">
                    {p.research_theme || 'Policy Project'}
                  </span>
                  <span className="text-gray-500 capitalize">{p.project_status}</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#192B2A] group-hover:text-[#285748] transition-colors line-clamp-2">
                  {p.title}
                </h4>
                {p.summary && (
                  <p className="text-xs text-[#52605A] line-clamp-2">
                    {p.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Economics Events */}
      {relatedEvents.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#D9DCD2]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#285748]" />
            <h3 className="font-serif font-bold text-xl text-[#192B2A]">
              Related Economics Events & Dialogues
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.slug}`}
                className="group block p-4 bg-white border border-[#D9DCD2] rounded-md hover:border-[#285748] hover:shadow-sm transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded font-semibold bg-[#E9EDE4] text-[#285748]">
                    {ev.organizer_type === 'tefpc' ? 'TEFPC Event' : 'Partner Event'}
                  </span>
                  <span className="text-gray-500">
                    {new Date(ev.start_time).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#192B2A] group-hover:text-[#285748] transition-colors line-clamp-2">
                  {ev.title}
                </h4>
                {ev.venue_or_format && (
                  <p className="text-xs text-[#52605A] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#285748]" />
                    <span>{ev.venue_or_format}</span>
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

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
