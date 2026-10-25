'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Calendar, BookOpen, Compass } from 'lucide-react';

interface HeaderProps {
  researcherName: string;
  professionalTitle: string;
}

export default function Header({ researcherName, professionalTitle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Ideas & Insights', href: '/insights' },
    { label: 'Research & Publications', href: '/research' },
    { label: 'Tanzania Events', href: '/events' },
    { label: 'About', href: '/about' },
    { label: 'Ask a Question', href: '/ask' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="border-b border-[#D9DCD2] bg-[#F7F5EF] sticky top-0 z-40 transition-colors">
      {/* Top micro bar for editorial dateline */}
      <div className="border-b border-[#E9EDE4] px-4 sm:px-8 py-1.5 text-xs text-[#52605A] flex justify-between items-center max-w-7xl mx-auto">
        <span>Economic Research & Policy Analysis • Dar es Salaam, Tanzania</span>
        <span className="hidden sm:inline">Africa/Dar_es_Salaam (EAT, UTC+3)</span>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285748]">
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#192B2A] group-hover:text-[#285748] transition-colors">
              {researcherName}
            </h1>
            <p className="text-xs sm:text-sm text-[#52605A] font-sans mt-0.5 tracking-wide">
              {professionalTitle}
            </p>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-7">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive(link.href)
                    ? 'text-[#285748] font-semibold border-b-2 border-[#285748]'
                    : 'text-[#192B2A] hover:text-[#285748]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#285748]"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Consultation</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden gap-3">
          <Link
            href="/consultation"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-[#285748] text-[#F7F5EF] rounded"
          >
            Book
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#192B2A] hover:text-[#285748] focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D9DCD2] bg-[#F7F5EF] px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-base rounded ${
                  isActive(link.href)
                    ? 'bg-[#E9EDE4] text-[#285748] font-semibold'
                    : 'text-[#192B2A] hover:bg-[#E9EDE4]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
