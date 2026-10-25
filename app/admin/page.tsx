import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Inbox,
  HelpCircle,
  Users,
  FileText,
  BookOpen,
  Calendar,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';
import { getDb } from '@/lib/db';
import { cleanExpiredBookings } from '@/lib/booking';
import { getSiteSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default function AdminDashboardPage() {
  cleanExpiredBookings();
  const db = getDb();
  const settings = getSiteSettings();

  const pendingBookings = db.prepare(`SELECT COUNT(*) as count FROM bookings WHERE status = 'pending_review'`).get() as { count: number };
  const newQuestions = db.prepare(`SELECT COUNT(*) as count FROM questions WHERE status = 'new'`).get() as { count: number };
  const confirmedSubscribers = db.prepare(`SELECT COUNT(*) as count FROM subscribers WHERE status = 'confirmed'`).get() as { count: number };
  const publishedInsights = db.prepare(`SELECT COUNT(*) as count FROM insights WHERE status = 'published'`).get() as { count: number };
  const totalResearch = db.prepare(`SELECT COUNT(*) as count FROM research`).get() as { count: number };
  const upcomingEvents = db.prepare(`SELECT COUNT(*) as count FROM events WHERE datetime(end_time) >= datetime('now')`).get() as { count: number };

  const isDemo = settings.is_demo === 1;

  return (
    <div className="space-y-8">
      {/* Demo Warning Banner if active */}
      {isDemo && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold text-sm">Demonstration Content Active</p>
              <p className="text-[#52605A]">
                The site is currently seeded with demonstration articles, papers, and placeholder details for local review.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/demo-data"
              className="px-3 py-1.5 bg-amber-700 text-white rounded font-semibold hover:bg-amber-800 transition-colors"
            >
              Clear Demo Content
            </Link>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Pending Bookings */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Consultations
            </span>
            <Inbox className="w-5 h-5 text-[#285748]" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#192B2A]">
              {pendingBookings.count}
            </div>
            <p className="text-xs text-[#52605A]">Pending review requests</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2"
          >
            Review Bookings <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* New Questions */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Inquiry Inbox
            </span>
            <HelpCircle className="w-5 h-5 text-[#285748]" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#192B2A]">
              {newQuestions.count}
            </div>
            <p className="text-xs text-[#52605A]">Unread visitor questions</p>
          </div>
          <Link
            href="/admin/questions"
            className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2"
          >
            Open Inbox <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Confirmed Subscribers */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Subscribers
            </span>
            <Users className="w-5 h-5 text-[#285748]" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#192B2A]">
              {confirmedSubscribers.count}
            </div>
            <p className="text-xs text-[#52605A]">Double opt-in confirmed</p>
          </div>
          <Link
            href="/admin/subscribers"
            className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2"
          >
            Manage Subscribers <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Published Insights */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Ideas & Insights
            </span>
            <FileText className="w-5 h-5 text-[#285748]" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#192B2A]">
              {publishedInsights.count}
            </div>
            <p className="text-xs text-[#52605A]">Published commentary articles</p>
          </div>
          <Link
            href="/admin/insights"
            className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2"
          >
            Manage Insights <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Research Papers */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Publications
            </span>
            <BookOpen className="w-5 h-5 text-[#285748]" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#192B2A]">
              {totalResearch.count}
            </div>
            <p className="text-xs text-[#52605A]">Academic papers cataloged</p>
          </div>
          <Link
            href="/admin/research"
            className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2"
          >
            Manage Research <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Upcoming Events */}
        <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
              Forums & Events
            </span>
            <Calendar className="w-5 h-5 text-[#285748]" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#192B2A]">
              {upcomingEvents.count}
            </div>
            <p className="text-xs text-[#52605A]">Upcoming Tanzania events</p>
          </div>
          <Link
            href="/admin/events"
            className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2"
          >
            Manage Events <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Launch & Actions */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
        <h2 className="font-serif text-xl font-medium text-[#192B2A]">
          Quick Administrative Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/insights"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Insight Article</span>
          </Link>

          <Link
            href="/admin/research"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Research Paper</span>
          </Link>

          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Tanzania Event</span>
          </Link>

          <Link
            href="/admin/launch-check"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#DCE3D7] transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>View Launch Readiness Report</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
