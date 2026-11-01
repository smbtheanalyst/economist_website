import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import {
  getFullNavigationData,
  saveDraftNavigation,
  publishNavigation,
  discardDraftNavigation,
  getPublishedPages,
  getAllProjectsAdmin,
  getAllEventsAdmin,
  getAllNewsAdmin,
  type NavItem,
} from '@/lib/data';

function sanitizeNavUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '/';
  const trimmed = rawUrl.trim();

  // If external, allow only http: and https:
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Internal route must start with / or #
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  return `/${trimmed}`;
}

function validateNavItems(items: any[]): NavItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `nav-${Date.now()}-${index}`;
    const label = typeof item.label === 'string' && item.label.trim() ? item.label.trim().slice(0, 60) : 'Menu Item';
    const path = sanitizeNavUrl(item.path);
    const visible = item.visible !== false;
    const is_external = Boolean(item.is_external || path.startsWith('http://') || path.startsWith('https://'));
    const order = typeof item.order === 'number' ? item.order : index;

    let children: NavItem[] = [];
    if (Array.isArray(item.children)) {
      children = item.children.map((child: any, cIndex: number) => ({
        id: typeof child.id === 'string' && child.id.trim() ? child.id.trim() : `${id}-child-${cIndex}`,
        label: typeof child.label === 'string' && child.label.trim() ? child.label.trim().slice(0, 60) : 'Sub-item',
        path: sanitizeNavUrl(child.path),
        visible: child.visible !== false,
        is_external: Boolean(child.is_external || child.path?.startsWith('http://') || child.path?.startsWith('https://')),
        order: typeof child.order === 'number' ? child.order : cIndex,
      }));
    }

    return {
      id,
      label,
      path,
      is_external,
      visible,
      order,
      children,
    };
  });
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const navData = getFullNavigationData();

  // Destination helpers for the UI selector
  const pages = getPublishedPages().map((p) => ({ label: `Page: ${p.title}`, path: `/${p.slug}` }));
  const projects = getAllProjectsAdmin().map((p) => ({ label: `Project: ${p.title}`, path: `/projects/${p.slug}` }));
  const events = getAllEventsAdmin().map((e) => ({ label: `Event: ${e.title}`, path: `/events/${e.slug}` }));
  const news = getAllNewsAdmin().map((n) => ({ label: `News: ${n.title}`, path: `/news/${n.slug}` }));

  const standardDestinations = [
    { label: 'Homepage', path: '/' },
    { label: 'About TEFPC', path: '/about' },
    { label: 'About: Mission & Vision', path: '/about#mission' },
    { label: 'About: Leadership & Team', path: '/about#leadership' },
    { label: 'Research & Publications', path: '/research' },
    { label: 'Research: Policy Briefs', path: '/research?type=Policy+Brief' },
    { label: 'Projects: Ongoing', path: '/projects?status=ongoing' },
    { label: 'Projects: Completed', path: '/projects?status=completed' },
    { label: 'Partners: Directory', path: '/partners' },
    { label: 'Partners: Partner With Us', path: '/partners/partner-with-us' },
    { label: 'News: Announcements', path: '/news' },
    { label: 'News: Events & Dialogues', path: '/events' },
    { label: 'News: Media Gallery', path: '/news/media-gallery' },
    { label: 'Ideas & Insights Commentary', path: '/insights' },
    { label: 'Book a Consultation', path: '/consultation' },
    { label: 'Ask a Question', path: '/ask' },
    { label: 'Subscribe to Briefs', path: '/subscribe' },
  ];

  return NextResponse.json({
    published: navData.published,
    draft: navData.draft,
    updated_at: navData.updated_at,
    availableDestinations: [
      ...standardDestinations,
      ...pages,
      ...projects,
      ...events,
      ...news,
    ],
  });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const items = validateNavItems(body.items);
    saveDraftNavigation(items);

    return NextResponse.json({
      success: true,
      message: 'Draft navigation saved successfully.',
      items,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save draft navigation' }, { status: 400 });
  }
}

export async function PUT() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    publishNavigation();
    return NextResponse.json({
      success: true,
      message: 'Draft navigation published to live public site.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to publish navigation' }, { status: 500 });
  }
}

export async function DELETE() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    discardDraftNavigation();
    return NextResponse.json({
      success: true,
      message: 'Draft navigation changes discarded and reverted to currently published menu.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to discard draft navigation' }, { status: 500 });
  }
}
