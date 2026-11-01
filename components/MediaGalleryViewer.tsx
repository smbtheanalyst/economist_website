'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, X, ChevronLeft, ChevronRight, Calendar, MapPin, Tag } from 'lucide-react';
import type { MediaGalleryItem } from '@/lib/data';

interface MediaGalleryViewerProps {
  initialItems: MediaGalleryItem[];
}

export function MediaGalleryViewer({ initialItems }: MediaGalleryViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    'All',
    'Events & Dialogues',
    'Fieldwork & Projects',
    'Institutional Engagements',
  ];

  const filteredItems = selectedCategory === 'All'
    ? initialItems
    : initialItems.filter((item) => item.category === selectedCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  const prevLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <div className="space-y-8">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSelectedCategory(cat);
              setLightboxIndex(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
              selectedCategory === cat
                ? 'bg-[#285748] text-white'
                : 'bg-[#E9EDE4] text-[#192B2A] hover:bg-[#DCE3D7]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-8 rounded text-center space-y-3">
          <Camera className="w-10 h-10 text-[#285748] mx-auto opacity-60" />
          <h3 className="font-serif text-lg font-bold text-[#192B2A]">
            No Media Gallery Items Published in this Category
          </h3>
          <p className="text-xs text-[#52605A] max-w-md mx-auto">
            Media photographs are explicitly verified and published by TEFPC administration following official symposiums, policy dialogues, and fieldwork.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group bg-white border border-[#D9DCD2] rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full aspect-[4/3] bg-[#E9EDE4] overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.image_alt || item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-semibold uppercase bg-black/60 text-white rounded backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-serif font-bold text-base text-[#192B2A] group-hover:text-[#285748] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-[#52605A] line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>

              {(item.event_date || item.location) && (
                <div className="px-4 py-2.5 bg-[#F7F5EF] border-t border-[#D9DCD2] flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                  {item.event_date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#285748]" />
                      {item.event_date}
                    </span>
                  )}
                  {item.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#285748]" />
                      {item.location}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-150"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs text-gray-300">
              <span>Photo {lightboxIndex + 1} of {filteredItems.length}</span>
              <span className="mx-2">•</span>
              <span className="text-[#E9EDE4] font-medium">{filteredItems[lightboxIndex].category}</span>
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Photo View */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={filteredItems[lightboxIndex].image_url}
                alt={filteredItems[lightboxIndex].image_alt || filteredItems[lightboxIndex].title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Prev / Next controls */}
            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevLightbox}
                  className="absolute left-2 sm:left-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-colors"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextLightbox}
                  className="absolute right-2 sm:right-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-colors"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Caption Bar */}
          <div
            className="bg-black/70 p-4 rounded-md max-w-4xl mx-auto w-full text-white text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="font-serif font-bold text-base">{filteredItems[lightboxIndex].title}</h4>
              {filteredItems[lightboxIndex].caption && (
                <p className="text-xs text-gray-300 mt-0.5">{filteredItems[lightboxIndex].caption}</p>
              )}
            </div>

            <div className="text-xs text-gray-400 shrink-0">
              {[filteredItems[lightboxIndex].event_date, filteredItems[lightboxIndex].location]
                .filter(Boolean)
                .join(' • ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
