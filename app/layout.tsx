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
      'East Africa',
      'Macroeconomics',
      'Fiscal Policy',
      'AfCFTA',
      'Trade',
      'Research',
      'Dr. Juma M. Mwangi',
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
      siteName: `${settings.researcher_name} - Economic Research`,
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

  return (
    <html lang="en">
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
