'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Calendar } from 'lucide-react';

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
    { label: 'Events in Tanzania', href: '/events' },
    { label: 'About & CV', href: '/about' },
    { label: 'Ask a Question', href: '/ask' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="border-b border-[#D9DCD2] bg-[#F7F5EF] sticky top-0 z-40 transition-colors">
      {/* Top micro bar for corporate identity & dateline */}
      <div className="border-b border-[#E9EDE4] px-4 sm:px-8 py-1.5 text-xs text-[#52605A] flex justify-between items-center max-w-7xl mx-auto">
        <span className="font-medium text-[#285748]">
          Tanzania Economic and Financial Policy Consultancy (TEFPC)
        </span>
        <span className="hidden sm:inline">
          tefpc.or.tz • Dar es Salaam (EAT, UTC+3)
        </span>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285748]">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#285748] group-hover:text-[#1e4337] transition-colors">
                TEFPC
              </span>
              <span className="hidden md:inline text-xs text-[#52605A] font-light border-l border-[#D9DCD2] pl-2 uppercase tracking-wider">
                Economic & Financial Policy
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#192B2A] font-serif font-medium mt-0.5">
              {researcherName}
            </p>
            <p className="text-[11px] text-[#52605A] font-sans tracking-wide">
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
