import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ExternalLink, Users, Globe, Building2, ArrowRight } from 'lucide-react';
import { getEvents } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Tanzania Economics Events & Academic Forums | TEFPC',
  description: 'Upcoming and past economics symposia, roundtables, and policy workshops in Tanzania and East Africa organized by TEFPC and partner institutions.',
};

export default function EventsPage() {
  // Public listing strictly queries published events
  const { upcoming, past } = getEvents(false);

  const formatEventDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-GB', {
      weekday: 'short',
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

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Public & Academic Dialogue
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          Economics Events in Tanzania
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-2xl">
          Tracking roundtables, scholarly conferences, and policy debates across Dar es Salaam, Dodoma, and the wider East African region.
        </p>
        <p className="text-xs text-[#52605A]">
          Official timezone: <span className="font-semibold text-[#192B2A]">Africa/Dar_es_Salaam (EAT, UTC+3)</span>
        </p>
      </div>

      {/* UPCOMING EVENTS */}
      <section className="space-y-6">
        <div className="border-b border-[#D9DCD2] pb-2 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium text-[#192B2A] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#285748]" />
            <span>Upcoming Events ({upcoming.length})</span>
          </h2>
        </div>

        <div className="space-y-6">
          {upcoming.map((evt) => {
            const isTefpc = evt.organizer_type === 'tefpc' || evt.is_organized_by_me === 1;

            return (
              <div
                key={evt.id}
                className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm hover:border-[#285748] transition-all overflow-hidden flex flex-col md:flex-row group"
              >
                {/* Event Cover Image */}
                {evt.cover_image_url && (
                  <Link
                    href={`/events/${evt.slug}`}
                    className="w-full md:w-72 h-52 md:h-auto shrink-0 relative overflow-hidden bg-[#192B2A] block"
                  >
                    <img
                      src={evt.cover_image_url}
                      alt={evt.cover_image_alt || evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}

                {/* Event Card Content */}
                <div className="p-6 sm:p-7 flex-1 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      {/* Explicit Organizer Choice */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 ${
                            isTefpc
                              ? 'bg-[#285748] text-[#F7F5EF]'
                              : 'bg-[#DCE3D7] text-[#192B2A]'
                          }`}
                        >
                          {isTefpc ? (
                            <>
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Organized by TEFPC</span>
                            </>
                          ) : (
                            <>
                              <Users className="w-3.5 h-3.5" />
                              <span>External Organizer</span>
                            </>
                          )}
                        </span>

                        <span className="text-[#52605A]">
                          Organizer: <strong className="text-[#192B2A]">{evt.organizer_name}</strong>
                        </span>
                      </div>

                      <div className="text-[#52605A] font-medium text-xs">
                        <span className="text-[#192B2A] font-semibold">
                          {formatEventDate(evt.start_time)}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif text-2xl font-medium text-[#192B2A] group-hover:text-[#285748] transition-colors">
                      <Link href={`/events/${evt.slug}`}>
                        {evt.title}
                      </Link>
                    </h3>

                    <p className="text-sm text-[#52605A] leading-relaxed font-light line-clamp-3">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#D9DCD2]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#52605A]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#285748] shrink-0" />
                        <span>{formatEventTime(evt.start_time, evt.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {evt.is_online ? (
                          <Globe className="w-4 h-4 text-[#285748] shrink-0" />
                        ) : (
                          <MapPin className="w-4 h-4 text-[#285748] shrink-0" />
                        )}
                        <span>{evt.venue_or_format}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <Link
                        href={`/events/${evt.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#285748] hover:underline"
                      >
                        <span>View Event Details & Photos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {evt.registration_url && (
                        <a
                          href={evt.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52605A] hover:text-[#192B2A] hover:underline"
                        >
                          <span>External Registration</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {upcoming.length === 0 && (
            <div className="p-8 bg-[#E9EDE4] border border-[#D9DCD2] rounded text-center text-sm text-[#52605A]">
              There are no upcoming scheduled economics events at this time.
            </div>
          )}
        </div>
      </section>

      {/* PAST EVENTS */}
      {past.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-[#D9DCD2]">
          <div className="border-b border-[#D9DCD2] pb-2">
            <h2 className="font-serif text-xl font-medium text-[#52605A]">
              Past Events & Archive ({past.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {past.map((evt) => {
              const isTefpc = evt.organizer_type === 'tefpc' || evt.is_organized_by_me === 1;

              return (
                <div
                  key={evt.id}
                  className="bg-[#F7F5EF] border border-[#D9DCD2] rounded-sm p-5 space-y-3 flex flex-col justify-between hover:border-[#285748] transition-colors"
                >
                  <div className="space-y-2">
                    {evt.cover_image_url && (
                      <Link href={`/events/${evt.slug}`} className="block aspect-[16/9] overflow-hidden rounded-sm bg-[#192B2A] mb-2">
                        <img
                          src={evt.cover_image_url}
                          alt={evt.cover_image_alt || evt.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    )}

                    <div className="flex flex-wrap items-center justify-between text-xs text-[#52605A]">
                      <span className="font-medium text-[#285748]">
                        {isTefpc ? 'Organized by TEFPC' : evt.organizer_name}
                      </span>
                      <span>{formatEventDate(evt.start_time)}</span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-[#192B2A] hover:text-[#285748]">
                      <Link href={`/events/${evt.slug}`}>
                        {evt.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-[#52605A] line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#D9DCD2] flex items-center justify-between text-[11px] text-[#718079]">
                    <span>Format: {evt.venue_or_format}</span>
                    <Link
                      href={`/events/${evt.slug}`}
                      className="font-semibold text-[#285748] hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
