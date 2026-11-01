'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2 } from 'lucide-react';
import type { EventGalleryImage } from '@/lib/data';

interface Slide {
  id: string;
  url: string;
  caption: string;
  isCover?: boolean;
}

interface EventSlideshowProps {
  coverImageUrl?: string;
  coverImageAlt?: string;
  galleryImages?: EventGalleryImage[];
  eventTitle: string;
}

export default function EventSlideshow({
  coverImageUrl,
  coverImageAlt,
  galleryImages = [],
  eventTitle,
}: EventSlideshowProps) {
  // Combine cover image and gallery images into a unified slides array
  const slides: Slide[] = [];

  if (coverImageUrl) {
    slides.push({
      id: 'cover',
      url: coverImageUrl,
      caption: coverImageAlt || `${eventTitle} - Cover Image`,
      isCover: true,
    });
  }

  galleryImages
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach((img, idx) => {
      // Avoid duplicate if gallery includes the same cover URL
      if (img.url && img.url !== coverImageUrl) {
        slides.push({
          id: img.id || `gallery-${idx}`,
          url: img.url,
          caption: img.caption || `${eventTitle} - Photo ${idx + 1}`,
          isCover: false,
        });
      }
    });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    if (slides.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, prevSlide, nextSlide]);

  // Touch swipe support for mobile
  const minSwipeDistance = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (slides.length === 0) {
    return (
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] rounded-sm p-8 text-center text-[#52605A] space-y-2">
        <ImageIcon className="w-8 h-8 mx-auto text-[#718079]" />
        <p className="text-xs uppercase font-semibold tracking-wider text-[#718079]">Event Media</p>
        <p className="text-sm">No official photos uploaded for this event yet.</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="space-y-3" aria-roledescription="carousel" aria-label={`${eventTitle} Photo Slideshow`}>
      {/* Main Slideshow Viewport */}
      <div
        className="relative bg-[#192B2A] rounded-sm overflow-hidden aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center select-none shadow-sm"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentSlide.url}
          alt={currentSlide.caption || eventTitle}
          className="w-full h-full object-contain max-h-[540px] transition-opacity duration-300"
          loading="eager"
        />

        {/* Top Badges: Slide counter and Cover indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {currentSlide.isCover && (
            <span className="bg-[#285748]/90 text-[#F7F5EF] text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">
              Cover Image
            </span>
          )}
          {slides.length > 1 && (
            <span className="bg-[#192B2A]/80 text-[#F7F5EF] text-[11px] font-medium px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">
              {currentIndex + 1} of {slides.length}
            </span>
          )}
        </div>

        {/* Previous and Next Navigation Buttons (Only if multiple slides) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous image"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#192B2A]/70 hover:bg-[#285748] text-[#F7F5EF] flex items-center justify-center transition-colors shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#F7F5EF]"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next image"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#192B2A]/70 hover:bg-[#285748] text-[#F7F5EF] flex items-center justify-center transition-colors shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#F7F5EF]"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Subtle mobile swipe hint */}
        {slides.length > 1 && (
          <div className="sm:hidden absolute bottom-2 right-2 bg-black/60 text-[#F7F5EF] text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
            Swipe ↔
          </div>
        )}
      </div>

      {/* Caption & Metadata */}
      {currentSlide.caption && (
        <div className="flex items-center justify-between text-xs text-[#52605A] px-1">
          <p className="italic font-light text-[#192B2A] leading-relaxed">
            {currentSlide.caption}
          </p>
          <a
            href={currentSlide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[11px] text-[#285748] hover:underline flex items-center gap-1 ml-3"
            title="Open high resolution file in new tab"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">View full resolution</span>
          </a>
        </div>
      )}

      {/* Thumbnails strip (If multiple slides) */}
      {slides.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-sm overflow-hidden border-2 transition-all ${
                currentIndex === idx
                  ? 'border-[#285748] ring-2 ring-[#285748]/30 scale-[1.02]'
                  : 'border-[#D9DCD2] opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={s.url}
                alt={s.caption || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {s.isCover && (
                <span className="absolute bottom-0 inset-x-0 bg-[#285748]/90 text-[#F7F5EF] text-[9px] text-center font-bold">
                  COVER
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
