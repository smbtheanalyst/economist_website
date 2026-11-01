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
  Compass,
  Sliders,
  Briefcase,
  Handshake,
  Newspaper,
  Shield,
  Layers,
} from 'lucide-react';
import { getDb } from '@/lib/db';
import { cleanExpiredBookings } from '@/lib/booking';
import { getSiteSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Admin Dashboard | TEFPC',
};

export default function AdminDashboardPage() {
  cleanExpiredBookings();
  const db = getDb();
  const settings = getSiteSettings();

  // Metrics for overview cards
  const pendingBookings = db.prepare(`SELECT COUNT(*) as count FROM bookings WHERE status = 'pending_review'`).get() as { count: number };
  const newQuestions = db.prepare(`SELECT COUNT(*) as count FROM questions WHERE status = 'new'`).get() as { count: number };
  const confirmedSubscribers = db.prepare(`SELECT COUNT(*) as count FROM subscribers WHERE status = 'confirmed'`).get() as { count: number };
  const totalPages = db.prepare(`SELECT COUNT(*) as count FROM pages`).get() as { count: number };
  const activeSlides = db.prepare(`SELECT COUNT(*) as count FROM homepage_slides WHERE is_enabled = 1`).get() as { count: number };
  const totalProjects = db.prepare(`SELECT COUNT(*) as count FROM projects`).get() as { count: number };
  const totalPartners = db.prepare(`SELECT COUNT(*) as count FROM partners`).get() as { count: number };
  const totalResearch = db.prepare(`SELECT COUNT(*) as count FROM research`).get() as { count: number };
  const publishedNews = db.prepare(`SELECT COUNT(*) as count FROM news_articles WHERE status = 'published'`).get() as { count: number };
  const upcomingEvents = db.prepare(`SELECT COUNT(*) as count FROM events WHERE datetime(end_time) >= datetime('now')`).get() as { count: number };

  const isDemo = settings.is_demo === 1;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-[#D9DCD2] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">
            TEFPC Institutional Control Suite
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#192B2A] mt-1">
            Executive Overview & Content Operations
          </h1>
          <p className="text-sm text-[#52605A] mt-0.5">
            Manage institutional pages, navigation menus, research publications, projects, partners, and public communications.
          </p>
        </div>
      </div>

      {/* Demo Warning Banner if active */}
      {isDemo && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold text-sm">Demonstration Content Active</p>
              <p className="text-[#52605A]">
                The site is currently seeded with demonstration content for local review.
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

      {/* Primary Institutional Content KPI Grid */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#285748] mb-3">
          Institutional Content & Brand Structure
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Website Pages */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Pages</span>
              <FileText className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{totalPages.count}</div>
              <p className="text-xs text-[#52605A]">Institutional pages created</p>
            </div>
            <Link href="/admin/pages" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Manage Pages <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Navigation */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Navigation</span>
              <Compass className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">Active</div>
              <p className="text-xs text-[#52605A]">Menu & Dropdown Builder</p>
            </div>
            <Link href="/admin/navigation" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Configure Menus <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Homepage Slides */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Activity Slides</span>
              <Sliders className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{activeSlides.count}</div>
              <p className="text-xs text-[#52605A]">Active homepage photo slides</p>
            </div>
            <Link href="/admin/slides" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Manage Slides <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Projects Portfolio */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Projects</span>
              <Briefcase className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{totalProjects.count}</div>
              <p className="text-xs text-[#52605A]">Policy & research projects</p>
            </div>
            <Link href="/admin/projects" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Manage Projects <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Engagement & Output KPI Grid */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#285748] mb-3">
          Research, Policy Engagements & Stakeholders
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Institutional Partners */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Partners</span>
              <Handshake className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{totalPartners.count}</div>
              <p className="text-xs text-[#52605A]">Verified partner organizations</p>
            </div>
            <Link href="/admin/partners" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Manage Partners <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Research Publications */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Research</span>
              <BookOpen className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{totalResearch.count}</div>
              <p className="text-xs text-[#52605A]">Peer-reviewed papers & briefs</p>
            </div>
            <Link href="/admin/research" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Manage Research <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Events in Tanzania */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Events</span>
              <Calendar className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{upcomingEvents.count}</div>
              <p className="text-xs text-[#52605A]">Upcoming Tanzania forums</p>
            </div>
            <Link href="/admin/events" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Manage Events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* News & Dialogues */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">News & Insights</span>
              <Newspaper className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{publishedNews.count}</div>
              <p className="text-xs text-[#52605A]">Institutional announcements</p>
            </div>
            <Link href="/admin/insights" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Manage News & Insights <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Communications & Inquiries */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#285748] mb-3">
          Communications & Client Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pending Consultations */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Consultations</span>
              <Inbox className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{pendingBookings.count}</div>
              <p className="text-xs text-[#52605A]">Bookings pending review</p>
            </div>
            <Link href="/admin/bookings" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Review Bookings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Inquiries Inbox */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Inquiries</span>
              <HelpCircle className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{newQuestions.count}</div>
              <p className="text-xs text-[#52605A]">Unread visitor questions</p>
            </div>
            <Link href="/admin/questions" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Open Inbox <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Subscribers */}
          <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-4 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285748]">Subscribers</span>
              <Users className="w-4 h-4 text-[#285748]" />
            </div>
            <div className="my-2">
              <div className="font-serif text-2xl font-bold text-[#192B2A]">{confirmedSubscribers.count}</div>
              <p className="text-xs text-[#52605A]">Confirmed policy brief subscribers</p>
            </div>
            <Link href="/admin/subscribers" className="text-xs font-semibold text-[#285748] hover:underline inline-flex items-center gap-1 border-t border-[#D9DCD2] pt-2">
              Manage Subscribers <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Launch & Actions */}
      <div className="bg-[#E9EDE4] border border-[#D9DCD2] p-6 rounded-sm space-y-4">
        <h2 className="font-serif text-xl font-medium text-[#192B2A]">
          Quick Administrative Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Page</span>
          </Link>

          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </Link>

          <Link
            href="/admin/partners"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Partner Organization</span>
          </Link>

          <Link
            href="/admin/slides"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#285748] text-[#F7F5EF] rounded hover:bg-[#1e4337] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload Activity Slide</span>
          </Link>

          <Link
            href="/admin/navigation"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#DCE3D7] transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Edit Navigation Menu</span>
          </Link>

          <Link
            href="/admin/launch-check"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#285748] text-[#285748] rounded hover:bg-[#DCE3D7] transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Launch Readiness Check</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
