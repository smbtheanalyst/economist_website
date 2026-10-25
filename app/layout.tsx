import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteSettings } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  const title = `${settings.researcher_name} | ${settings.professional_title}`;
  const description = settings.hero_intro;

  return {
    title: {
      default: title,
      template: `%s | ${settings.researcher_name}`,
    },
    description,
    keywords: [
      'Economics',
      'Tanzania',
      'Dr. Hamis Miraji Ally Simba',
      'TEFPC',
      'Tanzania Economic and Financial Policy Consultancy',
      'Economic Policy and Analysis',
      'Economic Modelling',
      'Applied Macroeconomics',
      'Applied Econometrics',
      'Economic Development',
      'Time Series Econometrics',
      'Dar es Salaam',
    ],
    authors: [{ name: settings.researcher_name }],
    creator: settings.researcher_name,
    metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
    openGraph: {
      type: 'website',
      locale: 'en_TZ',
      url: process.env.SITE_URL || 'http://localhost:3000',
      title,
      description,
      siteName: `TEFPC — ${settings.researcher_name}`,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://tefpc.or.tz/#organization',
        name: 'Tanzania Economic and Financial Policy Consultancy (TEFPC)',
        url: 'https://tefpc.or.tz',
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
        url: 'https://tefpc.or.tz/about',
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
        <Header
          researcherName={settings.researcher_name}
          professionalTitle={settings.professional_title}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
          {children}
        </main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
