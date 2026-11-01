import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const db = getDb();

  const staticRoutes = [
    '',
    '/about',
    '/research',
    '/projects',
    '/partners',
    '/partners/partner-with-us',
    '/news',
    '/news/media-gallery',
    '/events',
    '/insights',
    '/ask',
    '/consultation',
    '/privacy',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Published Custom Pages
  const pages = db.prepare(`SELECT slug, updated_at FROM pages WHERE status = 'published'`).all() as { slug: string; updated_at: string }[];
  const pageRoutes = pages.map((p) => ({
    url: `${siteUrl}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Published Projects
  const projects = db.prepare(`SELECT slug, updated_at FROM projects WHERE status = 'published'`).all() as { slug: string; updated_at: string }[];
  const projectRoutes = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Published News
  const news = db.prepare(`SELECT slug, updated_at FROM news_articles WHERE status = 'published'`).all() as { slug: string; updated_at: string }[];
  const newsRoutes = news.map((n) => ({
    url: `${siteUrl}/news/${n.slug}`,
    lastModified: new Date(n.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Published Insights
  const insights = db.prepare(`SELECT slug, updated_at FROM insights WHERE status = 'published'`).all() as { slug: string; updated_at: string }[];
  const insightRoutes = insights.map((i) => ({
    url: `${siteUrl}/insights/${i.slug}`,
    lastModified: new Date(i.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Published Research
  const research = db.prepare(`SELECT slug, updated_at FROM research WHERE status = 'published'`).all() as { slug: string; updated_at: string }[];
  const researchRoutes = research.map((r) => ({
    url: `${siteUrl}/research/${r.slug}`,
    lastModified: new Date(r.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Published Events
  const events = db.prepare(`SELECT slug, updated_at FROM events WHERE status = 'published'`).all() as { slug: string; updated_at: string }[];
  const eventRoutes = events.map((e) => ({
    url: `${siteUrl}/events/${e.slug}`,
    lastModified: new Date(e.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...pageRoutes,
    ...projectRoutes,
    ...newsRoutes,
    ...insightRoutes,
    ...researchRoutes,
    ...eventRoutes,
  ];
}
