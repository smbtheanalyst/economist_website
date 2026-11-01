import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldAlert,
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  Target,
  FileCheck,
  Layers,
  Award,
  Handshake,
} from 'lucide-react';
import { getCurrentAdmin } from '@/lib/auth';
import {
  getPageBySlug,
  getProjectBySlug,
  getNewsBySlug,
  getEventBySlug,
  type ProjectPartnerRole,
} from '@/lib/data';
import EventSlideshow from '@/components/EventSlideshow';

interface PreviewProps {
  params: Promise<{ type: string; slug: string }>;
}

export default async function AdminHostDraftPreviewPage({ params }: PreviewProps) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const { type, slug } = await params;

  let pageContent: React.ReactNode = null;
  let title = '';

  if (type === 'pages') {
    const page = getPageBySlug(slug, true);
    if (!page) notFound();
    title = page.title;

    pageContent = (
      <div className="space-y-6">
        <div className="space-y-2 border-b border-[#D9DCD2] pb-4">
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#E9EDE4] text-[#285748] rounded">
            Institutional Page Preview
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#192B2A]">{page.title}</h1>
          {page.summary && <p className="text-sm text-[#52605A]">{page.summary}</p>}
        </div>

        {page.cover_image_url && (
          <div className="relative w-full aspect-[16/9] rounded overflow-hidden border border-[#D9DCD2]">
            <Image src={page.cover_image_url} alt={page.cover_image_alt || page.title} fill className="object-cover" />
          </div>
        )}

        <article
          className="prose prose-stone max-w-none text-sm text-[#192B2A]"
          dangerouslySetInnerHTML={{ __html: page.content_html }}
        />
      </div>
    );
  } else if (type === 'projects') {
    const project = getProjectBySlug(slug, true);
    if (!project) notFound();
    title = project.title;

    let objectives: string[] = [];
    let activities: string[] = [];
    let outputs: string[] = [];
    let outcomes: string[] = [];
    let partners: ProjectPartnerRole[] = [];

    try { objectives = JSON.parse(project.objectives_json); } catch {}
    try { activities = JSON.parse(project.activities_json); } catch {}
    try { outputs = JSON.parse(project.outputs_json); } catch {}
    try { outcomes = JSON.parse(project.outcomes_json); } catch {}
    try { partners = JSON.parse(project.partner_organizations_json); } catch {}

    pageContent = (
      <div className="space-y-6">
        <div className="space-y-2 border-b border-[#D9DCD2] pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-[#E9EDE4] text-[#285748] rounded">
              {project.research_theme}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">
              {project.project_status}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#192B2A]">{project.title}</h1>
        </div>

        {project.cover_image_url && (
          <div className="relative w-full aspect-[16/9] rounded overflow-hidden border border-[#D9DCD2]">
            <Image src={project.cover_image_url} alt={project.cover_image_alt || project.title} fill className="object-cover" />
          </div>
        )}

        <div className="bg-[#E9EDE4] p-4 rounded border-l-4 border-[#285748]">
          <h3 className="text-xs font-bold uppercase text-[#285748] mb-1">Executive Summary</h3>
          <p className="text-sm text-[#192B2A]">{project.summary}</p>
        </div>

        {objectives.length > 0 && (
          <div className="p-4 bg-white border border-[#D9DCD2] rounded">
            <h4 className="font-serif font-bold text-sm text-[#192B2A] mb-2">Objectives</h4>
            <ul className="list-disc list-inside text-xs text-[#52605A] space-y-1">
              {objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        )}

        {project.description_html && (
          <article
            className="prose prose-stone max-w-none text-sm text-[#192B2A]"
            dangerouslySetInnerHTML={{ __html: project.description_html }}
          />
        )}
      </div>
    );
  } else if (type === 'news') {
    const article = getNewsBySlug(slug, true);
    if (!article) notFound();
    title = article.title;

    pageContent = (
      <div className="space-y-6">
        <div className="space-y-2 border-b border-[#D9DCD2] pb-4">
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-[#E9EDE4] text-[#285748] rounded">
            {article.category}
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#192B2A]">{article.title}</h1>
          <p className="text-xs text-[#52605A]">Published Date: {article.published_date}</p>
        </div>

        {article.cover_image_url && (
          <div className="relative w-full aspect-[16/9] rounded overflow-hidden border border-[#D9DCD2]">
            <Image src={article.cover_image_url} alt={article.cover_image_alt || article.title} fill className="object-cover" />
          </div>
        )}

        <article
          className="prose prose-stone max-w-none text-sm text-[#192B2A]"
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />
      </div>
    );
  } else if (type === 'events') {
    const event = getEventBySlug(slug, true);
    if (!event) notFound();
    title = event.title;

    let gallery: any[] = [];
    try { gallery = JSON.parse(event.gallery_images_json || '[]'); } catch {}

    pageContent = (
      <div className="space-y-6">
        <div className="space-y-2 border-b border-[#D9DCD2] pb-4">
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-[#E9EDE4] text-[#285748] rounded">
            Event Preview: {event.organizer_type === 'tefpc' ? 'Organized by TEFPC' : `External: ${event.organizer_name}`}
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#192B2A]">{event.title}</h1>
          <p className="text-xs text-[#52605A]">{event.start_time} – {event.end_time} ({event.venue_or_format})</p>
        </div>

        <EventSlideshow
          coverImageUrl={event.cover_image_url}
          coverImageAlt={event.cover_image_alt || event.title}
          galleryImages={gallery}
          eventTitle={event.title}
        />

        <div className="prose prose-stone max-w-none text-sm text-[#192B2A] whitespace-pre-line">
          {event.description}
        </div>
      </div>
    );
  } else {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Top Warning Banner */}
      <div className="bg-amber-500 text-amber-950 p-4 rounded-md border border-amber-600 shadow flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-950 shrink-0" />
          <div>
            <p className="font-bold text-sm">Authenticated Admin Draft Preview Mode</p>
            <p className="text-xs text-amber-900">
              This content is served from the secure administrator domain (<code>admin.tefpc.or.tz</code>). It is strictly private and cannot be viewed by visitors on the public site until published.
            </p>
          </div>
        </div>

        <Link
          href={`/admin/${type === 'pages' ? 'pages' : type === 'projects' ? 'projects' : type === 'news' ? 'insights' : 'events'}`}
          className="px-3 py-1.5 bg-amber-950 text-white rounded text-xs font-semibold hover:bg-black shrink-0 transition-colors"
        >
          Return to Admin
        </Link>
      </div>

      {/* Main Preview Container */}
      <div className="bg-white border border-[#D9DCD2] p-6 sm:p-10 rounded-md shadow-sm">
        {pageContent}
      </div>
    </div>
  );
}
