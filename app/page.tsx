import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  HelpCircle,
  FileText,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Briefcase,
  Handshake,
  Newspaper,
  TrendingUp,
  Landmark,
  Globe2,
  Wheat,
  Scale,
  ExternalLink,
  Users,
} from 'lucide-react';
import {
  getSiteSettings,
  getPublishedResearch,
  getEvents,
  getActiveHomepageSlides,
  getProjects,
  getPartners,
  getNewsArticles,
  type ProjectPartnerRole,
} from '@/lib/data';
import { HomepageSlideshow } from '@/components/HomepageSlideshow';
import SubscribeForm from '@/components/SubscribeForm';

export default function HomePage() {
  const settings = getSiteSettings();
  const slides = getActiveHomepageSlides();
  const researchPapers = getPublishedResearch({ limit: 3 });
  const { upcoming: upcomingEvents } = getEvents(false);
  const featuredProjects = getProjects({ featuredOnly: true, includeDrafts: false, limit: 3 });
  const fallbackProjects = featuredProjects.length === 0 ? getProjects({ includeDrafts: false, limit: 2 }) : [];
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : fallbackProjects;
  const homepagePartners = getPartners({ featuredHomepageOnly: true, includeDrafts: false, limit: 6 });
  const latestNews = getNewsArticles({ limit: 2, includeDrafts: false });

  const areasOfWork = [
    {
      title: 'Applied Macroeconomics & Modeling',
      icon: TrendingUp,
      description: 'Macroeconometric forecasting, inflation dynamics, monetary policy transmission, and time-series analysis for national planning.',
      link: '/research',
    },
    {
      title: 'Public Finance & Debt Sustainability',
      icon: Landmark,
      description: 'Sovereign debt viability analysis, domestic revenue mobilization, fiscal risk assessment, and expenditure efficiency frameworks.',
      link: '/research?type=Policy+Brief',
    },
    {
      title: 'Financial Sector Development',
      icon: Scale,
      description: 'Financial inclusion, credit market depth, digital financial services regulation, and institutional banking sector evaluations.',
      link: '/research',
    },
    {
      title: 'Regional Trade & AfCFTA Integration',
      icon: Globe2,
      description: 'East African Community (EAC) market integration, tariff policy, non-tariff barrier diagnostics, and export competitiveness.',
      link: '/research',
    },
    {
      title: 'Agricultural & Structural Economics',
      icon: Wheat,
      description: 'Agro-industrial value chains, rural financial access, productivity models, and economic diversification strategies.',
      link: '/research',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HOMEPAGE ACTIVITY SLIDESHOW (Or Polished Institutional Hero Fallback) */}
      <HomepageSlideshow
        slides={slides}
        fallbackHeadline={settings.hero_headline || 'Independent Economic & Financial Policy Research'}
        fallbackIntro={settings.hero_intro || 'Tanzania Economic and Financial Policy Consultancy (TEFPC) delivers empirical economic analysis, macroeconomic modeling, and technical advisory to public and private stakeholders.'}
      />

      {/* 2. CONCISE INSTITUTIONAL INTRODUCTION & MANDATE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-8 sm:p-12 rounded-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Institutional Mandate
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#192B2A] leading-tight">
              Evidence-based economic analysis for informed national and regional decisions.
            </h2>
            <p className="text-sm sm:text-base text-[#52605A] leading-relaxed font-light">
              Tanzania Economic and Financial Policy Consultancy (TEFPC) is an independent research institution headquartered at Rita Tower, Dar es Salaam. We bridge academic economic research and real-world executive policymaking through rigorous econometrics, policy briefs, and advisory engagements.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
              <Link
                href="/about"
                className="text-[#285748] hover:underline inline-flex items-center gap-1"
              >
                <span>About Institutional Structure & Vision →</span>
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                href="/about#leadership"
                className="text-[#285748] hover:underline inline-flex items-center gap-1"
              >
                <span>Leadership & Senior Directorate →</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded border border-[#D9DCD2] space-y-3">
            <div className="flex items-center gap-2 text-[#285748]">
              <Users className="w-5 h-5 shrink-0" />
              <h3 className="font-serif font-bold text-base text-[#192B2A]">Research Leadership</h3>
            </div>
            <p className="text-xs text-[#52605A] leading-relaxed">
              Directed by senior economists including <strong>Dr. Hamis Miraji Ally Simba</strong>, contributing peer-reviewed research in applied econometrics, sovereign debt, and macroeconomic policy.
            </p>
            <Link
              href="/about#leadership"
              className="inline-block text-xs font-semibold text-[#285748] hover:underline pt-1"
            >
              View Leadership Profile & CV →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. AREAS OF WORK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-[#D9DCD2] pb-4 gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Thematic Focus
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#192B2A]">
              Areas of Institutional Work
            </h2>
          </div>
          <p className="text-xs text-[#52605A] max-w-md">
            Our core advisory and research practice centers on applied economic disciplines critical to Tanzania’s growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {areasOfWork.map((area, idx) => {
            const Icon = area.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#D9DCD2] rounded-md p-5 flex flex-col justify-between hover:border-[#285748] transition-colors group"
              >
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded bg-[#E9EDE4] flex items-center justify-center text-[#285748]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#192B2A] group-hover:text-[#285748] transition-colors leading-snug">
                    {area.title}
                  </h3>
                  <p className="text-xs text-[#52605A] leading-relaxed">
                    {area.description}
                  </p>
                </div>
                <Link
                  href={area.link}
                  className="mt-4 pt-3 border-t border-[#E9EDE4] text-xs font-semibold text-[#285748] inline-flex items-center gap-1 group-hover:underline"
                >
                  <span>Studies</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PROJECTS (Gracefully handles empty states) */}
      {displayProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-[#D9DCD2] pb-4 gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
                Policy Initiatives
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#192B2A]">
                Featured Projects & Studies
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1"
            >
              <span>Explore All Projects Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayProjects.map((p) => {
              let partners: ProjectPartnerRole[] = [];
              try { partners = JSON.parse(p.partner_organizations_json); } catch {}

              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#D9DCD2] rounded-md overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div>
                    {p.cover_image_url ? (
                      <div className="relative w-full aspect-[16/10] bg-[#E9EDE4] overflow-hidden border-b border-[#D9DCD2]">
                        <Image
                          src={p.cover_image_url}
                          alt={p.cover_image_alt || p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-3 bg-gradient-to-r from-[#285748] to-[#192B2A]" />
                    )}

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded font-semibold bg-[#E9EDE4] text-[#285748]">
                          {p.research_theme || 'Economic Policy'}
                        </span>
                        <span className="capitalize text-gray-500 font-medium">
                          {p.project_status}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#192B2A] group-hover:text-[#285748] transition-colors leading-snug">
                        <Link href={`/projects/${p.slug}`}>
                          {p.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-[#52605A] leading-relaxed line-clamp-3">
                        {p.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-[#F7F5EF] border-t border-[#D9DCD2]">
                    <Link
                      href={`/projects/${p.slug}`}
                      className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Study Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. LATEST RESEARCH & PUBLICATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-[#D9DCD2] pb-4 gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Empirical Publications
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#192B2A]">
              Latest Research & Academic Papers
            </h2>
          </div>
          <Link
            href="/research"
            className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Publications ({researchPapers.length > 0 ? 'Cataloged' : '0'})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {researchPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white border border-[#D9DCD2] rounded-md p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#52605A]">
                  <span className="px-2 py-0.5 rounded font-semibold bg-[#E9EDE4] text-[#285748]">
                    {paper.publication_type}
                  </span>
                  <span>{paper.year}</span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#192B2A] group-hover:text-[#285748] transition-colors leading-snug">
                  <Link href={`/research/${paper.slug}`}>
                    {paper.title}
                  </Link>
                </h3>

                <p className="text-xs text-[#285748] font-medium">
                  {paper.authors}
                </p>

                {paper.journal_publisher && (
                  <p className="text-xs text-[#52605A] italic">
                    {paper.journal_publisher}
                  </p>
                )}

                <p className="text-xs text-[#52605A] line-clamp-3 leading-relaxed">
                  {paper.abstract}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E9EDE4] flex items-center justify-between">
                <Link
                  href={`/research/${paper.slug}`}
                  className="text-xs font-semibold text-[#285748] hover:underline"
                >
                  View Paper Details →
                </Link>
                {paper.doi_url && (
                  <a
                    href={paper.doi_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#52605A] hover:text-[#285748] inline-flex items-center gap-1"
                  >
                    <span>DOI</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. NEWS & ACTIVITIES (Announcements + Events) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Institutional News */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#285748]" />
                <h2 className="font-serif text-xl font-bold text-[#192B2A]">
                  Institutional Announcements
                </h2>
              </div>
              <Link href="/news" className="text-xs text-[#285748] font-semibold hover:underline">
                All News →
              </Link>
            </div>

            {latestNews.length === 0 ? (
              <div className="p-6 bg-[#E9EDE4] rounded border border-[#D9DCD2] text-xs text-[#52605A]">
                No official announcements published currently. Review our economic commentary under{' '}
                <Link href="/insights" className="text-[#285748] underline font-medium">Ideas & Insights</Link>.
              </div>
            ) : (
              <div className="space-y-4">
                {latestNews.map((news) => (
                  <div
                    key={news.id}
                    className="p-4 bg-white border border-[#D9DCD2] rounded-md hover:border-[#285748] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-semibold text-[#285748]">{news.category}</span>
                      <span>{new Date(news.published_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#192B2A]">
                      <Link href={`/news/${news.slug}`} className="hover:text-[#285748]">
                        {news.title}
                      </Link>
                    </h3>
                    {news.summary && (
                      <p className="text-xs text-[#52605A] line-clamp-2">{news.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Upcoming Economics Events */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#285748]" />
                <h2 className="font-serif text-xl font-bold text-[#192B2A]">
                  Economics Events in Tanzania
                </h2>
              </div>
              <Link href="/events" className="text-xs text-[#285748] font-semibold hover:underline">
                All Events →
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-6 bg-[#E9EDE4] rounded border border-[#D9DCD2] text-xs text-[#52605A]">
                No upcoming forums scheduled right now. View past policy roundtables under{' '}
                <Link href="/events" className="text-[#285748] underline font-medium">Past Events</Link>.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 bg-white border border-[#D9DCD2] rounded-md space-y-2 hover:border-[#285748] transition-colors"
                  >
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#E9EDE4] text-[#285748] rounded">
                      {ev.organizer_type === 'tefpc' ? 'Organized by TEFPC' : `External: ${ev.organizer_name}`}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#192B2A]">
                      <Link href={`/events/${ev.slug}`} className="hover:text-[#285748]">
                        {ev.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-[#285748]" />
                      <span>{new Date(ev.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. VERIFIED PARTNERS (Gracefully hides when empty) */}
      {homepagePartners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
                Institutional Alliances
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#192B2A]">
                Verified Partners & Collaborating Institutions
              </h2>
            </div>
            <Link href="/partners" className="text-xs text-[#285748] font-semibold hover:underline">
              Partner Directory →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {homepagePartners.map((part) => (
              <div
                key={part.id}
                className="bg-white border border-[#D9DCD2] rounded p-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[100px]"
              >
                {part.logo_url ? (
                  <div className="relative w-12 h-10">
                    <Image src={part.logo_url} alt={part.logo_alt || part.name} fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E9EDE4] flex items-center justify-center font-serif font-bold text-sm text-[#285748]">
                    {part.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#192B2A] line-clamp-2">{part.name}</span>
                <span className="text-[10px] text-gray-500">{part.relationship_type}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. CONSULTATION, ENQUIRY & SUBSCRIPTION ACCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-br from-[#192B2A] to-[#285748] text-white rounded-md p-8 sm:p-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Consultation Advisory Action */}
            <div className="lg:col-span-6 space-y-4">
              <span className="px-2.5 py-1 text-xs uppercase tracking-wider font-semibold bg-white/10 rounded border border-white/20">
                Senior Advisory & Consultations
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
                Engage TEFPC for Custom Economic Advisory & Modeling
              </h2>
              <p className="text-sm text-gray-200 leading-relaxed font-light">
                Schedule a confidential consultation session with our lead economists at Rita Tower, Dar es Salaam or via secure video conference.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/consultation"
                  className="px-6 py-3 bg-[#E9EDE4] text-[#192B2A] font-semibold text-xs rounded hover:bg-white shadow transition-colors"
                >
                  Schedule Advisory Session
                </Link>
                <Link
                  href="/ask"
                  className="px-6 py-3 border border-white/40 text-white font-semibold text-xs rounded hover:bg-white/10 transition-colors"
                >
                  Ask a Question / Direct Inquiry
                </Link>
              </div>
            </div>

            {/* Email Subscription Card */}
            <div className="lg:col-span-6 bg-white/10 p-6 sm:p-8 rounded border border-white/20 backdrop-blur-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-white">
                Subscribe to Institutional Policy Briefs
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed font-light">
                Receive newly released peer-reviewed papers, fiscal policy updates, and invitations to upcoming Tanzania economics symposia. Double opt-in confirmed.
              </p>
              <SubscribeForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
