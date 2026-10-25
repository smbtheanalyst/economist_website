'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  FileText,
  BookOpen,
  Calendar,
  HelpCircle,
  Clock,
  Inbox,
  Users,
  Mail,
  CheckCircle,
  Database,
  LogOut,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, render clean container
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Profile & Settings', href: '/admin/profile', icon: User },
    { label: 'Ideas & Insights', href: '/admin/insights', icon: FileText },
    { label: 'Research & Papers', href: '/admin/research', icon: BookOpen },
    { label: 'Events in Tanzania', href: '/admin/events', icon: Calendar },
    { label: 'Questions Inbox', href: '/admin/questions', icon: HelpCircle },
    { label: 'Services & Hours', href: '/admin/consultation', icon: Clock },
    { label: 'Bookings Manager', href: '/admin/bookings', icon: Inbox },
    { label: 'Subscribers', href: '/admin/subscribers', icon: Users },
    { label: 'Outbox Inspector', href: '/admin/emails', icon: Mail },
    { label: 'Launch Readiness', href: '/admin/launch-check', icon: CheckCircle },
    { label: 'Demo Content Tool', href: '/admin/demo-data', icon: Database },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Admin Masthead Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D9DCD2] gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#285748]">
            Administration Control Center
          </span>
          <h1 className="font-serif text-2xl font-medium text-[#192B2A]">
            Economist Website Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#E9EDE4] transition-colors"
          >
            View Live Public Site ↗
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Horizontal Nav Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#D9DCD2] text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded shrink-0 transition-colors ${
                active
                  ? 'bg-[#285748] text-[#F7F5EF] font-semibold'
                  : 'bg-[#E9EDE4] text-[#192B2A] hover:bg-[#DCE3D7]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Admin Content */}
      <div className="pt-2">{children}</div>
    </div>
  );
}
