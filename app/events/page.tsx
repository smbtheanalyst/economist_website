import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ExternalLink, UserCheck, Users, Globe } from 'lucide-react';
import { getEvents } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Tanzania Economics Events & Academic Forums',
  description: 'Upcoming and past economics symposia, roundtables, and policy workshops in Tanzania and East Africa.',
};

export default function EventsPage() {
  const { upcoming, past } = getEvents();

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
          {upcoming.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 sm:p-8 rounded-sm space-y-4 hover:border-[#285748] transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Clear distinction: Organized by researcher vs 3rd party */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 ${
                      evt.is_organized_by_me
                        ? 'bg-[#285748] text-[#F7F5EF]'
                        : 'bg-[#DCE3D7] text-[#192B2A]'
                    }`}
                  >
                    {evt.is_organized_by_me ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Organized by Researcher</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        <span>Third-Party Economics Event</span>
                      </>
                    )}
                  </span>

                  <span className="text-[#52605A]">
                    Organizer: <strong className="text-[#192B2A]">{evt.organizer_name}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#52605A]">
                  <span className="font-medium text-[#192B2A]">
                    {formatEventDate(evt.start_time)}
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-2xl font-medium text-[#192B2A]">
                {evt.title}
              </h3>

              <p className="text-sm text-[#52605A] leading-relaxed font-light">
                {evt.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#52605A] border-t border-[#D9DCD2]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#285748] shrink-0" />
                  <span>Time: {formatEventTime(evt.start_time, evt.end_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {evt.is_online ? (
                    <Globe className="w-4 h-4 text-[#285748] shrink-0" />
                  ) : (
                    <MapPin className="w-4 h-4 text-[#285748] shrink-0" />
                  )}
                  <span>Format/Venue: {evt.venue_or_format}</span>
                </div>
              </div>

              {evt.registration_url && (
                <div className="pt-2">
                  <a
                    href={evt.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#285748] hover:underline"
                  >
                    <span>External Registration / Event Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}

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

          <div className="space-y-4">
            {past.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#F7F5EF] border border-[#D9DCD2] p-5 rounded-sm space-y-2 opacity-85"
              >
                <div className="flex flex-wrap items-center justify-between text-xs text-[#52605A]">
                  <span className="font-medium">
                    {evt.is_organized_by_me ? 'Organized by Researcher' : evt.organizer_name}
                  </span>
                  <span>{formatEventDate(evt.start_time)}</span>
                </div>

                <h3 className="font-serif text-lg font-medium text-[#192B2A]">
                  {evt.title}
                </h3>

                <p className="text-xs text-[#52605A] line-clamp-2">
                  {evt.description}
                </p>

                <p className="text-[11px] text-[#718079]">
                  Venue / Format: {evt.venue_or_format}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
