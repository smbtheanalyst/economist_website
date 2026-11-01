'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Calendar, ChevronDown } from 'lucide-react';
import type { NavItem } from '@/lib/data';

interface HeaderProps {
  navItems?: NavItem[];
}

export default function Header({ navItems = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default institutional navigation items if database returns empty
  const defaultItems: NavItem[] = [
    {
      id: 'nav-home',
      label: 'Home',
      path: '/',
      visible: true,
      order: 0,
    },
    {
      id: 'nav-about',
      label: 'About',
      path: '/about',
      visible: true,
      order: 1,
      children: [
        { id: 'nav-about-who', label: 'Who We Are', path: '/about', visible: true, order: 0 },
        { id: 'nav-about-mission', label: 'Mission & Vision', path: '/about#mission', visible: true, order: 1 },
        { id: 'nav-about-team', label: 'Leadership & Team', path: '/about#leadership', visible: true, order: 2 },
      ],
    },
    {
      id: 'nav-research',
      label: 'Research',
      path: '/research',
      visible: true,
      order: 2,
      children: [
        { id: 'nav-res-areas', label: 'Research Areas', path: '/research', visible: true, order: 0 },
        { id: 'nav-res-pubs', label: 'Publications', path: '/research#publications', visible: true, order: 1 },
        { id: 'nav-res-briefs', label: 'Policy Briefs', path: '/research?type=Policy+Brief', visible: true, order: 2 },
      ],
    },
    {
      id: 'nav-projects',
      label: 'Projects',
      path: '/projects',
      visible: true,
      order: 3,
      children: [
        { id: 'nav-proj-ongoing', label: 'Ongoing Projects', path: '/projects?status=ongoing', visible: true, order: 0 },
        { id: 'nav-proj-completed', label: 'Completed Projects', path: '/projects?status=completed', visible: true, order: 1 },
      ],
    },
    {
      id: 'nav-partners',
      label: 'Partners',
      path: '/partners',
      visible: true,
      order: 4,
      children: [
        { id: 'nav-part-list', label: 'Our Partners', path: '/partners', visible: true, order: 0 },
        { id: 'nav-part-join', label: 'Partner With Us', path: '/partners/partner-with-us', visible: true, order: 1 },
      ],
    },
    {
      id: 'nav-news',
      label: 'News',
      path: '/news',
      visible: true,
      order: 5,
      children: [
        { id: 'nav-news-latest', label: 'Latest News', path: '/news', visible: true, order: 0 },
        { id: 'nav-news-events', label: 'Events', path: '/events', visible: true, order: 1 },
        { id: 'nav-news-gallery', label: 'Media Gallery', path: '/news/media-gallery', visible: true, order: 2 },
      ],
    },
  ];

  const activeNavItems = navItems && navItems.length > 0 ? navItems : defaultItems;

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const toggleMobileSubmenu = (id: string) => {
    setExpandedMobileMenu((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <header className="border-b border-[#D9DCD2] bg-[#F7F5EF] sticky top-0 z-40 transition-colors">
      {/* Top micro bar for institutional identity & dateline */}
      <div className="border-b border-[#E9EDE4] px-4 sm:px-8 py-1.5 text-xs text-[#52605A] flex justify-between items-center max-w-7xl mx-auto">
        <span className="font-medium text-[#285748] tracking-wide">
          Tanzania Economic and Financial Policy Consultancy (TEFPC)
        </span>
        <div className="flex items-center gap-4">
          <Link href="/ask" className="hover:text-[#285748] transition-colors hidden sm:inline">
            Ask a Question
          </Link>
          <span className="text-[#D9DCD2] hidden sm:inline">•</span>
          <Link href="/subscribe" className="hover:text-[#285748] transition-colors hidden sm:inline">
            Subscribe
          </Link>
          <span className="text-[#D9DCD2] hidden md:inline">•</span>
          <span className="hidden md:inline">
            Dar es Salaam (EAT, UTC+3)
          </span>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285748] rounded"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#285748] group-hover:text-[#1e4337] transition-colors">
                TEFPC
              </span>
              <div className="h-5 w-px bg-[#D9DCD2] hidden sm:block" />
              <span className="text-xs uppercase tracking-widest text-[#52605A] font-medium hidden sm:inline">
                Policy & Economic Advisory
              </span>
            </div>
            <p className="text-xs text-[#192B2A] font-medium mt-0.5 max-w-md hidden md:block">
              Tanzania Economic and Financial Policy Consultancy
            </p>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6" ref={dropdownRef}>
          <nav className="flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
            {activeNavItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isItemActive = isActive(item.path);
              const isDropdownOpen = openDropdownId === item.id;

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    target={item.is_external ? '_blank' : undefined}
                    rel={item.is_external ? 'noopener noreferrer' : undefined}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      isItemActive
                        ? 'text-[#285748] font-semibold bg-[#E9EDE4]'
                        : 'text-[#192B2A] hover:text-[#285748] hover:bg-[#E9EDE4]/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setOpenDropdownId(item.id)}
                  onMouseLeave={() => setOpenDropdownId(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
                      isItemActive || isDropdownOpen
                        ? 'text-[#285748] font-semibold bg-[#E9EDE4]'
                        : 'text-[#192B2A] hover:text-[#285748] hover:bg-[#E9EDE4]/60'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-[#285748]' : 'text-[#52605A]'
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white border border-[#D9DCD2] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                      role="menu"
                    >
                      {item.children?.map((child) => (
                        <Link
                          key={child.id}
                          href={child.path}
                          target={child.is_external ? '_blank' : undefined}
                          rel={child.is_external ? 'noopener noreferrer' : undefined}
                          onClick={() => setOpenDropdownId(null)}
                          className="block px-4 py-2 text-xs text-[#192B2A] hover:bg-[#F7F5EF] hover:text-[#285748] transition-colors"
                          role="menuitem"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Prominent CTA */}
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#285748] text-[#F7F5EF] rounded shadow-sm hover:bg-[#1e4337] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#285748]"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Consultation</span>
          </Link>
        </div>

        {/* Mobile menu button and quick book */}
        <div className="flex items-center lg:hidden gap-3">
          <Link
            href="/consultation"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-[#285748] text-[#F7F5EF] rounded shadow-sm"
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D9DCD2] bg-[#F7F5EF] px-4 py-4 space-y-3 shadow-inner">
          <nav className="flex flex-col space-y-1">
            {activeNavItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMobileMenu[item.id] || false;

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    target={item.is_external ? '_blank' : undefined}
                    rel={item.is_external ? 'noopener noreferrer' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm rounded ${
                      isActive(item.path)
                        ? 'bg-[#E9EDE4] text-[#285748] font-semibold'
                        : 'text-[#192B2A] hover:bg-[#E9EDE4]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={item.id} className="border-b border-[#E9EDE4] pb-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <Link
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-[#192B2A]"
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleMobileSubmenu(item.id)}
                      className="p-1 text-[#52605A] hover:text-[#285748]"
                      aria-label={`Toggle ${item.label} submenu`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="pl-4 space-y-1 bg-[#E9EDE4]/50 rounded py-1 mb-1">
                      {item.children?.map((child) => (
                        <Link
                          key={child.id}
                          href={child.path}
                          target={child.is_external ? '_blank' : undefined}
                          rel={child.is_external ? 'noopener noreferrer' : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 text-xs text-[#192B2A] hover:text-[#285748]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#D9DCD2] flex flex-col gap-2">
            <Link
              href="/consultation"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 px-4 bg-[#285748] text-[#F7F5EF] text-sm font-medium rounded shadow-sm"
            >
              Book a Consultation
            </Link>
            <div className="flex justify-around text-xs text-[#52605A] pt-1">
              <Link href="/ask" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#285748] underline">
                Ask a Question
              </Link>
              <Link href="/subscribe" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#285748] underline">
                Subscribe to Briefs
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
