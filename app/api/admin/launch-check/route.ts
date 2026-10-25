import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/data';

interface CheckItem {
  id: string;
  category: string;
  label: string;
  status: 'pass' | 'warning' | 'pending';
  detail: string;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const settings = getSiteSettings();

  const checks: CheckItem[] = [];

  // 1. Identity & Name
  if (settings.researcher_name.includes('[Full Name]') || settings.researcher_name.includes('Mwangi')) {
    checks.push({
      id: 'name',
      category: 'Profile & Branding',
      label: 'Client Legal/Professional Name',
      status: settings.is_demo ? 'warning' : 'pass',
      detail: settings.is_demo ? `Currently using demonstration name: "${settings.researcher_name}". Replace with client's actual name.` : `Configured: ${settings.researcher_name}`,
    });
  } else {
    checks.push({
      id: 'name',
      category: 'Profile & Branding',
      label: 'Client Legal/Professional Name',
      status: 'pass',
      detail: `Configured: ${settings.researcher_name}`,
    });
  }

  // 2. Portrait
  if (!settings.portrait_url || settings.portrait_url.includes('placeholder')) {
    checks.push({
      id: 'portrait',
      category: 'Profile & Branding',
      label: 'Professional Portrait Photo',
      status: 'pending',
      detail: 'Using SVG silhouette placeholder. Upload client portrait via Profile settings.',
    });
  } else {
    checks.push({
      id: 'portrait',
      category: 'Profile & Branding',
      label: 'Professional Portrait Photo',
      status: 'pass',
      detail: `Custom portrait asset uploaded: ${settings.portrait_url}`,
    });
  }

  // 3. Curriculum Vitae
  if (!settings.cv_url || settings.cv_url.includes('demo')) {
    checks.push({
      id: 'cv',
      category: 'Profile & Branding',
      label: 'Curriculum Vitae (PDF)',
      status: 'pending',
      detail: 'Using demo CV document. Upload client official PDF in Profile settings.',
    });
  } else {
    checks.push({
      id: 'cv',
      category: 'Profile & Branding',
      label: 'Curriculum Vitae (PDF)',
      status: 'pass',
      detail: `Client CV uploaded: ${settings.cv_url}`,
    });
  }

  // 4. Contact Email & Office
  checks.push({
    id: 'contact_email',
    category: 'Contact & Office',
    label: 'Public Contact Email',
    status: settings.contact_email.includes('example.tz') ? 'warning' : 'pass',
    detail: settings.contact_email.includes('example.tz')
      ? 'Placeholder email (example.tz) configured. Update with client official email.'
      : `Configured: ${settings.contact_email}`,
  });

  // 5. SMTP Outgoing Mail
  const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  checks.push({
    id: 'smtp',
    category: 'Infrastructure & Email',
    label: 'SMTP Email Delivery Credentials',
    status: isSmtpConfigured ? 'pass' : 'warning',
    detail: isSmtpConfigured
      ? `Configured to relay via host: ${process.env.SMTP_HOST}`
      : 'Unconfigured. Outgoing emails are currently safely captured to local outbox in database.',
  });

  // 6. Demonstration Articles
  const demoArticles = db.prepare(`SELECT COUNT(*) as count FROM insights WHERE is_demo = 1`).get() as { count: number };
  checks.push({
    id: 'demo_articles',
    category: 'Content Modeling',
    label: 'Demonstration Articles & Insights',
    status: demoArticles.count > 0 ? 'warning' : 'pass',
    detail: demoArticles.count > 0 ? `${demoArticles.count} demonstration articles present. Use Clear Demo Data tool before public launch.` : 'All demonstration articles cleared.',
  });

  // 7. Demonstration Research Papers
  const demoResearch = db.prepare(`SELECT COUNT(*) as count FROM research WHERE is_demo = 1`).get() as { count: number };
  checks.push({
    id: 'demo_research',
    category: 'Content Modeling',
    label: 'Demonstration Academic Publications',
    status: demoResearch.count > 0 ? 'warning' : 'pass',
    detail: demoResearch.count > 0 ? `${demoResearch.count} demonstration papers present.` : 'All demonstration papers cleared.',
  });

  // 8. Consultation Services
  const activeServices = db.prepare(`SELECT COUNT(*) as count FROM consultation_services WHERE is_active = 1`).get() as { count: number };
  checks.push({
    id: 'services',
    category: 'Consultation & Advisory',
    label: 'Active Consultation Services',
    status: activeServices.count > 0 ? 'pass' : 'warning',
    detail: `${activeServices.count} active consultation services configured.`,
  });

  // 9. Production Secret
  const isDefaultSecret = !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.includes('local-development');
  checks.push({
    id: 'secret',
    category: 'Security & Secrets',
    label: 'Session Encryption Secret',
    status: isDefaultSecret ? 'warning' : 'pass',
    detail: isDefaultSecret ? 'Using development session secret. Provide secure 32+ char secret in .env before deploying.' : 'Configured.',
  });

  return NextResponse.json({
    checks,
    overallReady: checks.filter((c) => c.status === 'pending').length === 0,
  });
}
