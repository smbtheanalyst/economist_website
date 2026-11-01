import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteSettings, getNavigationMenu } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  const title = 'Tanzania Economic and Financial Policy Consultancy (TEFPC) | Economic Research & Advisory';
  const description = settings.hero_intro || 'Independent economic research, financial policy evaluation, macroeconomic modelling, and policy consulting in Tanzania.';

  return {
    title: {
      default: title,
      template: '%s | TEFPC',
    },
    description,
    keywords: [
      'TEFPC',
      'Tanzania Economic and Financial Policy Consultancy',
      'Economic Policy Tanzania',
      'Macroeconomic Research',
      'Financial Policy Evaluation',
      'Applied Econometrics',
      'Policy Advisory Dar es Salaam',
      'Dr. Hamis Miraji Ally Simba',
      'Economic Development Tanzania',
      'Dar es Salaam'
    ],
    authors: [{ name: 'Tanzania Economic and Financial Policy Consultancy (TEFPC)' }],
    creator: 'Tanzania Economic and Financial Policy Consultancy (TEFPC)',
    metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
    openGraph: {
      type: 'website',
      locale: 'en_TZ',
      url: process.env.SITE_URL || 'http://localhost:3000',
      title,
      description,
      siteName: 'Tanzania Economic and Financial Policy Consultancy (TEFPC)',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getSiteSettings();
  const navItems = getNavigationMenu();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://tefpc.or.tz/#organization',
        name: 'Tanzania Economic and Financial Policy Consultancy (TEFPC)',
        url: 'https://tefpc.or.tz',
        description: 'Independent economic research, financial policy evaluation, and advisory consultancy.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Simu 4 Street, Makunganya Road, Rita Tower, 15th Floor',
          addressLocality: 'Posta, Dar es Salaam',
          addressCountry: 'TZ',
        },
      },
      {
        '@type': 'Person',
        '@id': 'https://tefpc.or.tz/#person',
        name: 'Dr. Hamis Miraji Ally Simba',
        jobTitle: 'Economist · Researcher · Consultant',
        worksFor: {
          '@id': 'https://tefpc.or.tz/#organization',
        },
        image: 'https://tefpc.or.tz/portrait-dr-hamis-simba-card.jpg',
        url: 'https://tefpc.or.tz/about#leadership',
        knowsAbout: [
          'Economic Policy and Analysis',
          'Economic Modelling',
          'Applied Macroeconomics',
          'Applied Econometrics',
          'Economic Development',
          'Time Series Econometrics',
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F7F5EF] text-[#192B2A]">
        <Header navItems={navItems} />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
