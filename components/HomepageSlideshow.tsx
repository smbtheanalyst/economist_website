'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HomepageSlideItem } from '@/lib/data';

interface HomepageSlideshowProps {
  slides: HomepageSlideItem[];
  fallbackHeadline?: string;
  fallbackIntro?: string;
}

export function HomepageSlideshow({
  slides,
  fallbackHeadline = 'Independent Economic & Financial Policy Research in Tanzania',
  fallbackIntro = 'Tanzania Economic and Financial Policy Consultancy (TEFPC) provides rigorous economic analysis, financial policy evaluation, and advisory services to national and international stakeholders.',
}: HomepageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hasSlides = slides && slides.length > 0;

  const nextSlide = useCallback(() => {
    if (!hasSlides) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [hasSlides, slides.length]);

  const prevSlide = useCallback(() => {
    if (!hasSlides) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [hasSlides, slides.length]);

  // Autoplay management
  useEffect(() => {
    if (!hasSlides || slides.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasSlides, slides.length, isPaused, nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchDeltaX(e.touches[0].clientX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null) {
      if (touchDeltaX < -45) {
        nextSlide();
      } else if (touchDeltaX > 45) {
        prevSlide();
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  };

  if (!hasSlides) {
    // Polished Institutional Text Hero Fallback
    return (
      <section className="bg-gradient-to-br from-[#192B2A] to-[#285748] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D9DCD2]">
        <div className="max-w-5xl mx-auto text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-white/10 text-white rounded text-xs font-semibold uppercase tracking-wider mb-6 border border-white/20">
            Tanzania Economic and Financial Policy Consultancy
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            {fallbackHeadline}
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl leading-relaxed mb-8">
            {fallbackIntro}
          </p>
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            <Link
              href="/consultation"
              className="px-6 py-3 bg-[#E9EDE4] text-[#192B2A] font-medium rounded shadow-sm hover:bg-white transition-colors"
            >
              Book Consultation
            </Link>
            <Link
              href="/research"
              className="px-6 py-3 border border-white/40 text-white font-medium rounded hover:bg-white/10 transition-colors"
            >
              Explore Research & Publications
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];
  const focalPointClass =
    currentSlide.focal_point === 'top'
      ? 'object-top'
      : currentSlide.focal_point === 'bottom'
      ? 'object-bottom'
      : currentSlide.focal_point === 'left'
      ? 'object-left'
      : currentSlide.focal_point === 'right'
      ? 'object-right'
      : 'object-center';

  return (
    <section
      className="relative w-full overflow-hidden bg-[#192B2A] text-white border-b border-[#D9DCD2] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="TEFPC Activities and Policy Engagements Slideshow"
    >
      {/* Slide Image Container */}
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[560px]">
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image_url}
              alt={slide.image_alt || slide.title}
              fill
              priority={idx === 0}
              className={`object-cover ${focalPointClass}`}
              sizes="100vw"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#192B2A]/90 via-[#192B2A]/40 to-black/30" />
          </div>
        ))}

        {/* Slide Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-16 max-w-5xl">
          {/* Metadata Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-[#285748] text-white rounded shadow-sm">
              TEFPC Activity
            </span>
            {(currentSlide.activity_date || currentSlide.activity_location) && (
              <span className="text-xs text-gray-300 font-medium bg-black/40 px-2.5 py-1 rounded backdrop-blur-sm">
                {[currentSlide.activity_date, currentSlide.activity_location]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            )}
          </div>

          {/* Slide Title */}
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {currentSlide.title}
          </h2>

          {/* Slide Caption */}
          {currentSlide.caption && (
            <p className="text-sm sm:text-base text-gray-200 line-clamp-2 sm:line-clamp-3 mb-4 max-w-2xl leading-relaxed">
              {currentSlide.caption}
            </p>
          )}

          {/* Action Link */}
          {currentSlide.link_url && (
            <div>
              <Link
                href={currentSlide.link_url}
                className="inline-flex items-center text-sm font-medium text-[#E9EDE4] hover:text-white underline underline-offset-4 decoration-[#D9DCD2]"
              >
                {currentSlide.link_text || 'Learn more about this engagement →'}
              </Link>
            </div>
          )}
        </div>

        {/* Carousel Prev / Next Controls */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-between px-3 sm:px-6 pointer-events-none">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="pointer-events-auto p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-colors border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="pointer-events-auto p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-colors border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Carousel Indicators & Play/Pause */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 sm:right-8 z-30 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
            <span className="text-[11px] text-gray-300 ml-1">
              {currentIndex + 1} / {slides.length}
            </span>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              className="ml-1 text-gray-300 hover:text-white text-xs"
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
