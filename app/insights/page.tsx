import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search, Tag, Clock } from 'lucide-react';
import { getPublishedInsights, getInsightTopics } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Ideas & Insights | Economic Commentary',
  description: 'Macroeconomic analysis, fiscal commentary, and empirical insights on Tanzania and East Africa.',
};

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentTopic = resolvedParams.topic || 'all';
  const searchQuery = resolvedParams.q || '';
  const currentPage = parseInt(resolvedParams.page || '1', 10);
  const pageSize = 6;
  const offset = (currentPage - 1) * pageSize;

  const topics = getInsightTopics();
  const { items, total } = getPublishedInsights({
    topic: currentTopic,
    search: searchQuery,
    limit: pageSize,
    offset,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Public Commentary & Analysis
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Ideas & Insights
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-2xl">
          Timely economic commentary, structural evaluations, and data-driven perspectives on fiscal policies and regional markets.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#E9EDE4] p-4 border border-[#D9DCD2] rounded-sm">
        {/* Topic Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/insights${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              currentTopic === 'all'
                ? 'bg-[#285748] text-[#F7F5EF] font-semibold'
                : 'bg-[#F7F5EF] text-[#192B2A] hover:bg-[#DCE3D7]'
            }`}
          >
            All Topics ({total})
          </Link>
          {topics.map((t) => (
            <Link
              key={t}
              href={`/insights?topic=${encodeURIComponent(t)}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''
              }`}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                currentTopic === t
                  ? 'bg-[#285748] text-[#F7F5EF] font-semibold'
                  : 'bg-[#F7F5EF] text-[#192B2A] hover:bg-[#DCE3D7]'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Search Form */}
        <form method="GET" action="/insights" className="relative shrink-0 sm:w-64">
          <input type="hidden" name="topic" value={currentTopic} />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search insights..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F5EF] border border-[#D9DCD2] rounded text-[#192B2A] focus:border-[#285748] focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-[#52605A] absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((insight) => (
          <article
            key={insight.id}
            className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm flex flex-col justify-between hover:border-[#285748] transition-colors group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#52605A]">
                <span className="font-semibold text-[#285748]">{insight.topic}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {insight.read_time_minutes} min read
                </span>
                {insight.is_featured === 1 && (
                  <span className="ml-auto px-2 py-0.5 rounded bg-[#285748] text-[#F7F5EF] text-[10px] font-semibold uppercase tracking-wider">
                    Featured
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl font-medium text-[#192B2A] group-hover:text-[#285748] transition-colors leading-snug">
                <Link href={`/insights/${insight.slug}`}>
                  {insight.title}
                </Link>
              </h2>

              <p className="text-sm text-[#52605A] leading-relaxed line-clamp-3 font-light">
                {insight.summary}
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-[#D9DCD2] flex items-center justify-between text-xs text-[#52605A]">
              <span>
                {insight.published_at
                  ? new Date(insight.published_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Published'}
              </span>
              <Link
                href={`/insights/${insight.slug}`}
                className="font-medium text-[#285748] group-hover:underline inline-flex items-center gap-1"
              >
                Read Article <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <div className="col-span-2 p-12 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center space-y-3">
            <p className="font-serif text-lg text-[#192B2A]">No insights found matching your criteria.</p>
            <p className="text-xs text-[#52605A]">
              Try resetting your topic filter or using different search terms.
            </p>
            <div className="pt-2">
              <Link
                href="/insights"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#285748] underline"
              >
                Clear all filters
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6 border-t border-[#D9DCD2]">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/insights?page=${pageNum}${currentTopic !== 'all' ? `&topic=${encodeURIComponent(currentTopic)}` : ''}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''
              }`}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                currentPage === pageNum
                  ? 'bg-[#285748] text-[#F7F5EF] font-semibold'
                  : 'bg-[#E9EDE4] text-[#192B2A] hover:bg-[#DCE3D7]'
              }`}
            >
              {pageNum}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
