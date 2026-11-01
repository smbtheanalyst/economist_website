import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Briefcase,
  Calendar,
  MapPin,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Target,
  FileCheck,
  Award,
  Layers,
  Handshake,
  BookOpen,
  Newspaper,
  Camera,
} from 'lucide-react';
import {
  getProjectBySlug,
  getResearchByIds,
  getNewsByIds,
  type ProjectPartnerRole,
} from '@/lib/data';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug, false);
  if (!project) return {};

  return {
    title: `${project.title} | Projects | TEFPC`,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.cover_image_url
        ? [{ url: project.cover_image_url, alt: project.cover_image_alt || project.title }]
        : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  // Public visitor: strictly published projects only
  const project = getProjectBySlug(slug, false);
  if (!project) {
    notFound();
  }

  let objectives: string[] = [];
  let activities: string[] = [];
  let outputs: string[] = [];
  let outcomes: string[] = [];
  let partners: ProjectPartnerRole[] = [];
  let galleryImages: { url: string; caption?: string }[] = [];
  let relatedResearchIds: number[] = [];
  let relatedNewsIds: number[] = [];

  try { objectives = JSON.parse(project.objectives_json); } catch {}
  try { activities = JSON.parse(project.activities_json); } catch {}
  try { outputs = JSON.parse(project.outputs_json); } catch {}
  try { outcomes = JSON.parse(project.outcomes_json); } catch {}
  try { partners = JSON.parse(project.partner_organizations_json); } catch {}
  try { galleryImages = JSON.parse(project.gallery_images_json); } catch {}
  try { relatedResearchIds = JSON.parse(project.related_research_ids_json); } catch {}
  try { relatedNewsIds = JSON.parse(project.related_news_ids_json); } catch {}

  const relatedResearch = getResearchByIds(relatedResearchIds);
  const relatedNews = getNewsByIds(relatedNewsIds);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-[#52605A]">
        <Link href="/" className="hover:text-[#285748] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/projects" className="hover:text-[#285748] transition-colors">
          Projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#192B2A] font-medium truncate">{project.title}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4 border-b border-[#D9DCD2] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-[#E9EDE4] text-[#285748] rounded">
            {project.research_theme || 'Economic Policy'}
          </span>
          {project.project_status === 'completed' ? (
            <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed Project
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Ongoing Project
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#192B2A] leading-tight">
          {project.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#52605A] pt-1">
          {(project.start_date || project.end_date) && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#285748]" />
              <span>
                Timeline: {[project.start_date, project.end_date].filter(Boolean).join(' – ')}
              </span>
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#285748]" />
              <span>Location: {project.location}</span>
            </div>
          )}
        </div>
      </header>

      {/* Optional Cover Image */}
      {project.cover_image_url && (
        <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden border border-[#D9DCD2] bg-[#E9EDE4]">
          <Image
            src={project.cover_image_url}
            alt={project.cover_image_alt || project.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Executive Summary Callout */}
      <div className="bg-[#E9EDE4] border-l-4 border-[#285748] p-6 rounded-r-md space-y-2">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-[#285748]">
          Executive Summary
        </h2>
        <p className="text-base text-[#192B2A] leading-relaxed font-light">
          {project.summary}
        </p>
      </div>

      {/* Structured Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objectives */}
        {objectives.length > 0 && (
          <div className="bg-white border border-[#D9DCD2] p-5 rounded-md space-y-3">
            <div className="flex items-center gap-2 text-[#285748]">
              <Target className="w-4 h-4 shrink-0" />
              <h3 className="font-serif font-bold text-base text-[#192B2A]">Project Objectives</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#52605A]">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#285748] font-bold mt-0.5">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Deliverables & Outputs */}
        {outputs.length > 0 && (
          <div className="bg-white border border-[#D9DCD2] p-5 rounded-md space-y-3">
            <div className="flex items-center gap-2 text-[#285748]">
              <FileCheck className="w-4 h-4 shrink-0" />
              <h3 className="font-serif font-bold text-base text-[#192B2A]">Key Outputs & Deliverables</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#52605A]">
              {outputs.map((out, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#285748] font-bold mt-0.5">✓</span>
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Activities */}
        {activities.length > 0 && (
          <div className="bg-white border border-[#D9DCD2] p-5 rounded-md space-y-3">
            <div className="flex items-center gap-2 text-[#285748]">
              <Layers className="w-4 h-4 shrink-0" />
              <h3 className="font-serif font-bold text-base text-[#192B2A]">Core Activities</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#52605A]">
              {activities.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#285748] font-bold mt-0.5">•</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Documented Outcomes */}
        {outcomes.length > 0 && (
          <div className="bg-white border border-[#D9DCD2] p-5 rounded-md space-y-3">
            <div className="flex items-center gap-2 text-[#285748]">
              <Award className="w-4 h-4 shrink-0" />
              <h3 className="font-serif font-bold text-base text-[#192B2A]">Documented Outcomes & Impact</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#52605A]">
              {outcomes.map((otc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#285748] font-bold mt-0.5">★</span>
                  <span>{otc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Partner Organizations Attribution */}
      {partners.length > 0 && (
        <div className="bg-[#F7F5EF] border border-[#D9DCD2] p-6 rounded-md space-y-4">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#285748]" />
            <h3 className="font-serif font-bold text-lg text-[#192B2A]">
              Institutional Collaborations & Partner Roles
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {partners.map((p, i) => (
              <div key={i} className="bg-white p-4 rounded border border-[#D9DCD2] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#192B2A]">{p.name}</span>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#285748]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <span className="inline-block px-2 py-0.5 text-[10px] bg-[#E9EDE4] text-[#285748] rounded font-medium">
                  {p.role_label || p.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Narrative Content (Rich Text) */}
      {project.description_html && (
        <div className="space-y-4 pt-4 border-t border-[#D9DCD2]">
          <h3 className="font-serif font-bold text-xl text-[#192B2A]">
            Project Overview & Analytical Methodology
          </h3>
          <article
            className="prose prose-stone max-w-none text-[#192B2A] leading-relaxed prose-headings:font-serif prose-headings:text-[#192B2A] prose-a:text-[#285748] prose-a:underline"
            dangerouslySetInnerHTML={{ __html: project.description_html }}
          />
        </div>
      )}

      {/* Project Photo Gallery */}
      {galleryImages.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#D9DCD2]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#285748]" />
            <h3 className="font-serif font-bold text-xl text-[#192B2A]">
              Project Photographic Gallery
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <div key={i} className="group rounded-md overflow-hidden border border-[#D9DCD2] bg-white shadow-sm space-y-2 pb-2">
                <div className="relative aspect-[4/3] w-full bg-[#E9EDE4] overflow-hidden">
                  <Image
                    src={img.url}
                    alt={img.caption || `Project image #${i + 1}`}
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

      {/* Related Research Publications */}
      {relatedResearch.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#D9DCD2]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#285748]" />
            <h3 className="font-serif font-bold text-xl text-[#192B2A]">
              Related Research Publications & Policy Briefs
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedResearch.map((res) => (
              <Link
                key={res.id}
                href={`/research/${res.slug}`}
                className="group block p-4 bg-[#F7F5EF] border border-[#D9DCD2] rounded-md hover:border-[#285748] hover:bg-white transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded font-semibold bg-[#E9EDE4] text-[#285748]">
                    {res.publication_type}
                  </span>
                  <span className="text-gray-500">{res.year}</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#192B2A] group-hover:text-[#285748] transition-colors line-clamp-2">
                  {res.title}
                </h4>
                {res.authors && (
                  <p className="text-xs text-[#52605A] line-clamp-1 italic">
                    By {res.authors}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Institutional News */}
      {relatedNews.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#D9DCD2]">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#285748]" />
            <h3 className="font-serif font-bold text-xl text-[#192B2A]">
              Related Institutional News & Policy Dialogues
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedNews.map((news) => (
              <Link
                key={news.id}
                href={`/news/${news.slug}`}
                className="group block p-4 bg-white border border-[#D9DCD2] rounded-md hover:border-[#285748] hover:shadow-sm transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded font-semibold bg-[#E9EDE4] text-[#285748]">
                    {news.category}
                  </span>
                  <span className="text-gray-500">
                    {new Date(news.published_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#192B2A] group-hover:text-[#285748] transition-colors line-clamp-2">
                  {news.title}
                </h4>
                {news.summary && (
                  <p className="text-xs text-[#52605A] line-clamp-2">
                    {news.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Action / Return Footer */}
      <div className="pt-8 border-t border-[#D9DCD2] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#285748] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Projects</span>
        </Link>

        <Link
          href="/partners/partner-with-us"
          className="px-4 py-2 bg-[#285748] text-white text-xs font-semibold rounded hover:bg-[#1e4337] transition-colors"
        >
          Inquire About Research Partnerships
        </Link>
      </div>
    </div>
  );
}
