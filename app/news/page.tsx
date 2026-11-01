import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Calendar, ArrowRight, Camera, MessageSquare } from 'lucide-react';
import { getNewsArticles, type NewsArticleItem } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Institutional News & Policy Dialogues | TEFPC',
  description: 'Official announcements, symposium updates, project milestones, and policy dialogues from Tanzania Economic and Financial Policy Consultancy.',
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await paramsCategory(await searchParams);

  const articles = getNewsArticles({
    category: category && category !== 'all' ? category : undefined,
    includeDrafts: false,
  });

  const categories = [
    'All',
    'Institutional News',
    'Project Updates',
    'Policy Dialogues',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Institutional Communications
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          News & Institutional Updates
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-3xl leading-relaxed">
          Official announcements, policy forum proceedings, research project releases, and institutional engagements from TEFPC.
        </p>

        {/* Quick Links Subnav */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
          <Link
            href="/events"
            className="text-[#285748] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>View Events in Tanzania →</span>
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            href="/insights"
            className="text-[#285748] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Read Economic Insights & Opinion Commentary →</span>
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            href="/news/media-gallery"
            className="text-[#285748] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Explore Media Gallery →</span>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          {categories.map((cat) => {
            const isSelected = (!category && cat === 'All') || category === cat;
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/news' : `/news?category=${encodeURIComponent(cat)}`}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                  isSelected
                    ? 'bg-[#285748] text-white'
                    : 'bg-[#E9EDE4] text-[#192B2A] hover:bg-[#DCE3D7]'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* News Listing */}
      {articles.length === 0 ? (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-8 rounded text-center space-y-3">
          <Newspaper className="w-10 h-10 text-[#285748] mx-auto opacity-60" />
          <h3 className="font-serif text-lg font-bold text-[#192B2A]">
            No Published Announcements in this Category
          </h3>
          <p className="text-xs text-[#52605A] max-w-md mx-auto">
            Official announcements and dialogue proceedings will be published here upon release. In the meantime, you can review our economic commentary and publications.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/insights"
              className="px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337]"
            >
              Ideas & Insights
            </Link>
            <Link
              href="/events"
              className="px-4 py-2 border border-[#285748] text-[#285748] text-xs font-semibold rounded hover:bg-[#E9EDE4]"
            >
              Economics Events
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <article
              key={art.id}
              className="bg-white border border-[#D9DCD2] rounded-md overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {art.cover_image_url ? (
                  <div className="relative w-full aspect-[16/10] bg-[#E9EDE4] overflow-hidden border-b border-[#D9DCD2]">
                    <Image
                      src={art.cover_image_url}
                      alt={art.cover_image_alt || art.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-3 bg-gradient-to-r from-[#285748] to-[#192B2A]" />
                )}

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#52605A]">
                    <span className="px-2 py-0.5 rounded font-semibold bg-[#E9EDE4] text-[#285748]">
                      {art.category}
                    </span>
                    <span>
                      {new Date(art.published_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h2 className="font-serif text-lg font-bold text-[#192B2A] group-hover:text-[#285748] transition-colors leading-snug">
                    <Link href={`/news/${art.slug}`}>
                      {art.title}
                    </Link>
                  </h2>

                  {art.summary && (
                    <p className="text-xs text-[#52605A] leading-relaxed line-clamp-3">
                      {art.summary}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-5 py-3 bg-[#F7F5EF] border-t border-[#D9DCD2]">
                <Link
                  href={`/news/${art.slug}`}
                  className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1"
                >
                  <span>Read Announcement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

async function paramsCategory(params: { category?: string }) {
  return { category: params?.category };
}
