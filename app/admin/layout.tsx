'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Compass,
  Sliders,
  BookOpen,
  Briefcase,
  Handshake,
  Newspaper,
  Calendar,
  HelpCircle,
  Clock,
  Users,
  Settings,
  Mail,
  CheckCircle,
  Database,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, render clean container without sidebar
  if (pathname === '/admin/login' || pathname === '/login') {
    return <>{children}</>;
  }

  const primaryNavItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Website Pages', href: '/admin/pages', icon: FileText },
    { label: 'Navigation', href: '/admin/navigation', icon: Compass },
    { label: 'Homepage Slides', href: '/admin/slides', icon: Sliders },
    { label: 'Research', href: '/admin/research', icon: BookOpen },
    { label: 'Projects', href: '/admin/projects', icon: Briefcase },
    { label: 'Partners', href: '/admin/partners', icon: Handshake },
    { label: 'News & Insights', href: '/admin/insights', icon: Newspaper },
    { label: 'Events', href: '/admin/events', icon: Calendar },
    { label: 'Enquiries', href: '/admin/questions', icon: HelpCircle },
    { label: 'Consultations', href: '/admin/consultation', icon: Clock },
    { label: 'Subscribers', href: '/admin/subscribers', icon: Users },
    { label: 'Settings', href: '/admin/profile', icon: Settings },
  ];

  const utilityNavItems = [
    { label: 'Outbox Inspector', href: '/admin/emails', icon: Mail },
    { label: 'Launch Readiness', href: '/admin/launch-check', icon: CheckCircle },
    { label: 'Demo Content Tool', href: '/admin/demo-data', icon: Database },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    const isSubdomain = typeof window !== 'undefined' && window.location.host.startsWith('admin.');
    router.push(isSubdomain ? '/login' : '/admin/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/';
    }
    return pathname.startsWith(href) || pathname.startsWith(href.replace('/admin', ''));
  };

  const publicSiteUrl =
    typeof window !== 'undefined' && window.location.host.startsWith('admin.')
      ? 'https://tefpc.or.tz'
      : '/';

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#192B2A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-[#285748]">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#E9EDE4]" />
          <span className="font-serif font-bold text-base tracking-wide">TEFPC Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2.5 py-1 bg-white/10 text-white rounded hover:bg-white/20"
          >
            Public Site ↗
          </a>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 text-white hover:text-[#E9EDE4] focus:outline-none"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation (Desktop Fixed / Mobile Drawer) */}
      <aside
        className={`w-64 bg-[#192B2A] text-white shrink-0 flex flex-col justify-between border-r border-[#285748] z-40 transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileNavOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed inset-y-0 left-0 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Masthead */}
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif text-xl font-bold tracking-tight text-[#E9EDE4]">
                TEFPC Admin
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#285748] text-white rounded">
                Portal
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Tanzania Economic & Financial Policy Consultancy
            </p>
          </div>

          {/* Primary Modules */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block px-3 mb-2">
              Website & Content
            </span>
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors ${
                      active
                        ? 'bg-[#285748] text-white font-semibold shadow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Technical Utilities */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block px-3 mb-2">
              System & Maintenance
            </span>
            <nav className="space-y-1">
              {utilityNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors ${
                      active
                        ? 'bg-[#285748] text-white font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-gray-500" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-black/20">
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded border border-white/10 transition-colors"
          >
            <span>Live Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium bg-red-950/60 text-red-200 hover:bg-red-900/80 rounded border border-red-800/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
