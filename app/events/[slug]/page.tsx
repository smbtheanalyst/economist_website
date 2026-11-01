import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  UserCheck,
  Users,
  Globe,
  ArrowLeft,
  Share2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { getEventBySlug, parseGalleryImages } from '@/lib/data';
import { getCurrentAdmin } from '@/lib/auth';
import EventSlideshow from '@/components/EventSlideshow';

interface EventPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params, searchParams }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const admin = await getCurrentAdmin();
  const allowDraft = Boolean(admin && preview === 'true');
  const event = getEventBySlug(slug, allowDraft);

  if (!event) {
    return {
      title: 'Event Not Found | TEFPC',
    };
  }

  return {
    title: `${event.title} | Economics Events in Tanzania | TEFPC`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.cover_image_url ? [{ url: event.cover_image_url, alt: event.cover_image_alt || event.title }] : [],
    },
  };
}

export default async function EventDetailPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const admin = await getCurrentAdmin();
  const isPreview = Boolean(admin && preview === 'true');

  const event = getEventBySlug(slug, isPreview);

  if (!event) {
    notFound();
  }

  // Double check: If draft and not admin preview, forbid public viewing
  if (event.status === 'draft' && !isPreview) {
    notFound();
  }

  const isUpcoming = new Date(event.end_time) >= new Date();

  const formatEventDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Africa/Dar_es_Salaam',
    });
  };

  const formatEventTime = (startIso: string, endIso: string) => {
    const s = new Date(startIso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Dar_es_Salaam',
    });
    const e = new Date(endIso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Dar_es_Salaam',
    });
    return `${s} – ${e} EAT`;
  };

  const galleryImages = parseGalleryImages(event.gallery_images_json);
  const isTefpcOrganized = event.organizer_type === 'tefpc' || event.is_organized_by_me === 1;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      {/* Admin Preview Notice */}
      {event.status === 'draft' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Admin Preview Mode
              </p>
              <p className="text-xs text-amber-800">
                This event is currently in <strong>Draft</strong> status and is not visible to the general public.
              </p>
            </div>
          </div>
          <Link
            href="/admin/events"
            className="text-xs font-semibold px-3 py-1.5 bg-amber-200 text-amber-900 hover:bg-amber-300 rounded transition-colors shrink-0"
          >
            Return to Admin
          </Link>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-[#D9DCD2] pb-4 text-xs text-[#52605A]">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 font-semibold text-[#285748] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Economics Events</span>
        </Link>
        <span className="uppercase tracking-wider font-semibold">
          {isUpcoming ? (
            <span className="text-[#285748]">Upcoming Event</span>
          ) : (
            <span className="text-[#718079]">Past Event / Archive</span>
          )}
        </span>
      </div>

      {/* Main Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {isTefpcOrganized ? (
            <span className="px-3 py-1 rounded font-semibold text-xs flex items-center gap-1.5 bg-[#285748] text-[#F7F5EF]">
              <Building2 className="w-3.5 h-3.5" />
              <span>Organized by TEFPC</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded font-semibold text-xs flex items-center gap-1.5 bg-[#DCE3D7] text-[#192B2A]">
              <Users className="w-3.5 h-3.5" />
              <span>External Organizer: {event.organizer_name}</span>
            </span>
          )}

          <span className="px-2.5 py-1 rounded text-xs bg-[#E9EDE4] border border-[#D9DCD2] text-[#52605A]">
            {event.is_online ? 'Virtual / Online Format' : 'In-Person Event'}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A] leading-tight">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-[#52605A] pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#285748]" />
            <span>{formatEventDate(event.start_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#285748]" />
            <span>{formatEventTime(event.start_time, event.end_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.is_online ? (
              <Globe className="w-4 h-4 text-[#285748]" />
            ) : (
              <MapPin className="w-4 h-4 text-[#285748]" />
            )}
            <span>{event.venue_or_format}</span>
          </div>
        </div>
      </div>

      {/* Responsive Image Slideshow */}
      <section className="space-y-3">
        <EventSlideshow
          coverImageUrl={event.cover_image_url}
          coverImageAlt={event.cover_image_alt}
          galleryImages={galleryImages}
          eventTitle={event.title}
        />
      </section>

      {/* Main Content & Registration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Left 2 Cols: Description & Program */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-medium text-[#192B2A] border-b border-[#D9DCD2] pb-2">
              Event Overview & Program
            </h2>
            <div className="text-base text-[#192B2A] font-light leading-relaxed whitespace-pre-line space-y-4">
              {event.description}
            </div>
          </div>

          {event.registration_url && (
            <div className="p-6 bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm space-y-3">
              <h3 className="font-serif text-lg font-medium text-[#192B2A]">
                Registration & Participation
              </h3>
              <p className="text-xs text-[#52605A] leading-relaxed">
                To participate or access official session agendas, registration is managed via the official event portal.
              </p>
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
              >
                <span>Access Registration & Program Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Right Col: Details Summary Card */}
        <div className="space-y-6">
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm space-y-4 text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-[#285748] text-[11px]">
              Event Summary
            </h3>

            <div className="space-y-3 text-[#192B2A]">
              <div>
                <p className="text-[11px] text-[#52605A] font-medium">Organizer</p>
                <p className="font-semibold">{event.organizer_name}</p>
                {isTefpcOrganized && (
                  <span className="inline-block mt-1 text-[10px] text-[#285748] font-medium">
                    Host: Tanzania Economic and Financial Policy Consultancy
                  </span>
                )}
              </div>

              <div className="border-t border-[#D9DCD2] pt-2">
                <p className="text-[11px] text-[#52605A] font-medium">Venue / Format</p>
                <p className="font-medium">{event.venue_or_format}</p>
                <p className="text-[11px] text-[#52605A] mt-0.5">
                  {event.is_online ? 'Virtual connection details sent to registered attendees' : 'In-person check-in required on arrival'}
                </p>
              </div>

              <div className="border-t border-[#D9DCD2] pt-2">
                <p className="text-[11px] text-[#52605A] font-medium">Timezone</p>
                <p className="font-medium">Africa/Dar_es_Salaam (EAT, UTC+3)</p>
              </div>

              <div className="border-t border-[#D9DCD2] pt-2">
                <p className="text-[11px] text-[#52605A] font-medium">Status</p>
                <p className="font-semibold text-[#285748]">
                  {isUpcoming ? 'Scheduled / Upcoming' : 'Concluded'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F7F5EF] border border-[#D9DCD2] p-5 rounded-sm space-y-3 text-xs">
            <h4 className="font-semibold text-[#192B2A]">Academic & Policy Advisory</h4>
            <p className="text-[#52605A] leading-relaxed">
              Dr. Simba and TEFPC provide research advisory, policy analysis, and keynote addresses for symposia across East Africa.
            </p>
            <Link
              href="/consultation"
              className="inline-block text-xs font-semibold text-[#285748] hover:underline"
            >
              Book an Advisory Consultation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
