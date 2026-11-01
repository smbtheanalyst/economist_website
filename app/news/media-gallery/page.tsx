import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Camera, ArrowLeft } from 'lucide-react';
import { getMediaGalleryItems } from '@/lib/data';
import { MediaGalleryViewer } from '@/components/MediaGalleryViewer';

export const metadata: Metadata = {
  title: 'Media Gallery | TEFPC',
  description: 'Photographic documentation of TEFPC economics symposia, research roundtables, stakeholder dialogues, and field policy engagements in Tanzania.',
};

export default function MediaGalleryPage() {
  const items = getMediaGalleryItems({ includeDrafts: false });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-[#D9DCD2] pb-6 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
          Photographic Documentation
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#192B2A]">
          TEFPC Media Gallery
        </h1>
        <p className="text-base sm:text-lg text-[#52605A] font-light max-w-3xl leading-relaxed">
          High-resolution photographic records of official economic policy dialogues, academic conferences, stakeholder forums, and analytical fieldwork conducted across Tanzania.
        </p>

        <div className="pt-2">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#285748] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Institutional News & Announcements</span>
          </Link>
        </div>
      </div>

      {/* Interactive Gallery Viewer */}
      <MediaGalleryViewer initialItems={items} />
    </div>
  );
}
