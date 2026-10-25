import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar, HelpCircle, FileText, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';
import { getSiteSettings, getPublishedInsights, getPublishedResearch, getEvents } from '@/lib/data';
import SubscribeForm from '@/components/SubscribeForm';

export default function HomePage() {
  const settings = getSiteSettings();
  const { items: allInsights } = getPublishedInsights({ limit: 4 });
  const researchPapers = getPublishedResearch({ limit: 3 });
  const { upcoming: upcomingEvents } = getEvents();

  const featuredInsight = allInsights.find((i) => i.is_featured === 1) || allInsights[0];
  const supportingInsights = allInsights.filter((i) => i.id !== featuredInsight?.id).slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <section className="border-b border-[#D9DCD2] pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Text */}
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E9EDE4] text-[#285748] border border-[#DCE3D7]">
              <span>Tanzania Economic and Financial Policy Consultancy (TEFPC)</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#192B2A] leading-[1.15] whitespace-pre-line">
              {settings.hero_headline}
            </h1>

            <p className="text-lg sm:text-xl text-[#52605A] leading-relaxed max-w-2xl font-light">
              {settings.hero_intro}
            </p>

            <div className="pt-1">
              <p className="font-serif text-lg font-medium text-[#192B2A]">
                {settings.researcher_name}
              </p>
              <p className="text-sm text-[#52605A] font-sans">
                {settings.professional_title}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/research"
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium bg-[#285748] text-[#F7F5EF] hover:bg-[#1e4337] transition-all shadow-sm"
              >
                <span>Explore Research & Papers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/consultation"
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium border border-[#285748] text-[#285748] hover:bg-[#E9EDE4] transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Consultation</span>
              </Link>
            </div>
          </div>

          {/* Portrait & Identity Card (Prominently featuring real photograph) */}
          <div className="lg:col-span-4">
            <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm space-y-4">
              <div className="relative w-full aspect-[4/5] bg-[#DCE3D7] rounded-sm overflow-hidden border border-[#D9DCD2] shadow-sm">
                <img
                  src={settings.portrait_url || '/portrait-dr-hamis-simba-card.jpg'}
                  alt={settings.researcher_name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-1">
                <p className="font-serif text-lg font-medium text-[#192B2A] leading-snug">
                  {settings.researcher_name}
                </p>
                <p className="text-xs text-[#52605A] leading-snug">
                  {settings.professional_title}
                </p>
              </div>

              <div className="border-t border-[#D9DCD2] pt-3 text-xs text-[#52605A] flex items-center justify-between">
                <span>Posta, Dar es Salaam</span>
                <Link href="/about" className="text-[#285748] font-medium hover:underline inline-flex items-center gap-1">
                  Full Bio & CV <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL PUBLICATIONS: FEATURED + RECENT */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-[#D9DCD2] pb-3 gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Editorial Commentary</span>
            <h2 className="font-serif text-3xl font-medium text-[#192B2A]">Ideas & Insights</h2>
          </div>
          <Link
            href="/insights"
            className="text-sm font-medium text-[#285748] hover:underline inline-flex items-center gap-1"
          >
            All Insights <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredInsight ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Featured Article (asymmetrical layout) */}
            <article className="lg:col-span-7 bg-[#E9EDE4] border border-[#D9DCD2] p-6 sm:p-8 rounded-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-[#52605A]">
                  <span className="px-2.5 py-0.5 rounded bg-[#DCE3D7] text-[#285748] font-semibold">
                    {featuredInsight.topic}
                  </span>
                  <span>•</span>
                  <span>Featured Lead</span>
                  <span>•</span>
                  <span>{featuredInsight.read_time_minutes} min read</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#192B2A] hover:text-[#285748] leading-tight transition-colors">
                  <Link href={`/insights/${featuredInsight.slug}`}>
                    {featuredInsight.title}
                  </Link>
                </h3>

                <p className="text-[#52605A] text-base leading-relaxed line-clamp-3 font-light">
                  {featuredInsight.summary}
                </p>
              </div>

              <div className="pt-6 border-t border-[#D9DCD2] mt-6 flex justify-between items-center text-xs text-[#52605A]">
                <span>
                  {featuredInsight.published_at
                    ? new Date(featuredInsight.published_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </span>
                <Link
                  href={`/insights/${featuredInsight.slug}`}
                  className="font-medium text-[#285748] hover:underline inline-flex items-center gap-1"
                >
                  Read Analysis <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>

            {/* Supporting Stories Column */}
            <div className="lg:col-span-5 flex flex-col divide-y divide-[#D9DCD2]">
              {supportingInsights.map((insight) => (
                <article key={insight.id} className="py-5 first:pt-0 last:pb-0 space-y-2 group">
                  <div className="flex items-center gap-2 text-xs text-[#52605A]">
                    <span className="font-semibold text-[#285748]">{insight.topic}</span>
                    <span>•</span>
                    <span>{insight.read_time_minutes} min read</span>
                  </div>

                  <h4 className="font-serif text-lg font-medium text-[#192B2A] group-hover:text-[#285748] transition-colors leading-snug">
                    <Link href={`/insights/${insight.slug}`}>
                      {insight.title}
                    </Link>
                  </h4>

                  <p className="text-xs text-[#52605A] line-clamp-2 leading-relaxed">
                    {insight.summary}
                  </p>

                  <div className="pt-1">
                    <Link
                      href={`/insights/${insight.slug}`}
                      className="text-xs font-medium text-[#285748] inline-flex items-center gap-1 group-hover:underline"
                    >
                      Read Article <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}

              {supportingInsights.length === 0 && (
                <div className="p-6 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center text-sm text-[#52605A]">
                  More economic analyses will be published shortly.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center text-[#52605A]">
            No published insights available at this time.
          </div>
        )}
      </section>

      {/* SELECTED RESEARCH & PAPERS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-[#D9DCD2] pb-3 gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Academic Rigor</span>
            <h2 className="font-serif text-3xl font-medium text-[#192B2A]">Selected Research & Publications</h2>
          </div>
          <Link
            href="/research"
            className="text-sm font-medium text-[#285748] hover:underline inline-flex items-center gap-1"
          >
            All Publications <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {researchPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-[#F7F5EF] border border-[#D9DCD2] p-6 rounded-sm flex flex-col justify-between hover:border-[#285748] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#52605A]">
                  <span className="px-2 py-0.5 rounded bg-[#E9EDE4] text-[#285748] font-medium">
                    {paper.publication_type}
                  </span>
                  <span>{paper.year}</span>
                </div>

                <h3 className="font-serif text-lg font-medium text-[#192B2A] leading-snug">
                  <Link href={`/research/${paper.slug}`} className="hover:text-[#285748]">
                    {paper.title}
                  </Link>
                </h3>

                <p className="text-xs text-[#52605A] leading-relaxed line-clamp-3 font-light">
                  {paper.abstract}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D9DCD2] flex items-center justify-between text-xs">
                <span className="text-[#52605A] truncate max-w-[140px]">{paper.authors}</span>
                <Link
                  href={`/research/${paper.slug}`}
                  className="font-medium text-[#285748] hover:underline inline-flex items-center gap-1"
                >
                  View Paper <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING TANZANIA ECONOMICS EVENTS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-[#D9DCD2] pb-3 gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Policy & Academic Forums</span>
            <h2 className="font-serif text-3xl font-medium text-[#192B2A]">Economics Events in Tanzania</h2>
          </div>
          <Link
            href="/events"
            className="text-sm font-medium text-[#285748] hover:underline inline-flex items-center gap-1"
          >
            All Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingEvents.slice(0, 2).map((evt) => (
            <div
              key={evt.id}
              className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    evt.is_organized_by_me
                      ? 'bg-[#285748] text-[#F7F5EF]'
                      : 'bg-[#DCE3D7] text-[#192B2A]'
                  }`}
                >
                  {evt.is_organized_by_me ? 'Organized by TEFPC' : 'Third-Party Event'}
                </span>
                <span className="text-[#52605A]">
                  {new Date(evt.start_time).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h3 className="font-serif text-xl font-medium text-[#192B2A]">
                {evt.title}
              </h3>

              <p className="text-xs text-[#52605A] leading-relaxed line-clamp-2">
                {evt.description}
              </p>

              <div className="border-t border-[#D9DCD2] pt-3 flex items-center justify-between text-xs text-[#52605A]">
                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-[#285748] shrink-0" />
                  <span className="truncate">{evt.venue_or_format}</span>
                </div>
                <Link
                  href="/events"
                  className="text-[#285748] font-medium hover:underline inline-flex items-center gap-1"
                >
                  Details <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {upcomingEvents.length === 0 && (
            <div className="col-span-2 p-6 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center text-sm text-[#52605A]">
              No upcoming scheduled public events at this time. Check back soon or subscribe for alerts.
            </div>
          )}
        </div>
      </section>

      {/* TWO-COLUMN CALLOUT: ASK A QUESTION & BOOK A CONSULTATION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Consultation Callout */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-8 rounded-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded bg-[#285748] text-[#F7F5EF] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#192B2A]">
              Consultations & Advisory Sessions
            </h3>
            <p className="text-sm text-[#52605A] leading-relaxed">
              Book dedicated advisory sessions for econometric modeling, macroeconomic policy analysis, or graduate research mentorship. Available online via private video or in-person at the TEFPC office at Rita Tower, Posta, Dar es Salaam.
            </p>
            <ul className="text-xs text-[#52605A] space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#285748]" />
                <span>Zero account registration required</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#285748]" />
                <span>Instant reservation with transactional conflict prevention</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#285748]" />
                <span>Transparent options: Free mentorship or paid institutional advisory</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium bg-[#285748] text-[#F7F5EF] hover:bg-[#1e4337] transition-colors"
            >
              <span>View Services & Select Slot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ask a Question Callout */}
        <div className="bg-[#F7F5EF] border border-[#D9DCD2] p-8 rounded-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded bg-[#DCE3D7] text-[#285748] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#192B2A]">
              Ask a Question
            </h3>
            <p className="text-sm text-[#52605A] leading-relaxed">
              Have a research inquiry regarding Tanzanian public policy, econometric frameworks, energy markets, or AfCFTA trade logistics? Questions are read directly by the researcher.
            </p>
            <p className="text-xs text-[#718079] italic">
              Note: Submitting an inquiry does not guarantee an immediate or detailed consultation. For structured one-on-one advisory, please book a consultation.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/ask"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium border border-[#285748] text-[#285748] hover:bg-[#E9EDE4] transition-colors"
            >
              <span>Submit Your Question</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* EMAIL SUBSCRIPTION SECTION */}
      <section>
        <SubscribeForm />
      </section>
    </div>
  );
}
