import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const db = getDb();

  const staticRoutes = [
    '',
    '/about',
    '/insights',
    '/research',
    '/events',
    '/ask',
    '/consultation',
    '/privacy',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
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
    priority: 0.7,
  }));

  return [...staticRoutes, ...insightRoutes, ...researchRoutes];
}
