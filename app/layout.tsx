import type { Metadata } from 'next';
import { Geist, Geist_Mono, Source_Sans_3, Space_Grotesk } from 'next/font/google';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import 'css/tailwind.css';
import { Analytics, AnalyticsConfig } from 'pliny/analytics/index.js';
import 'pliny/search/algolia.css';
import { SearchConfig, SearchProvider } from 'pliny/search/index.js';
import 'remark-github-blockquote-alert/alert.css';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SectionContainer from '@/components/SectionContainer';
import { unregister } from '@/components/serviceWorker';

import siteMetadata from '@/data/siteMetadata';

import { ThemeProviders } from './theme-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const sourceSan3 = Source_Sans_3({
  subsets: ['latin'],
});

const { title, description, socialBanner, language, analytics, search } = siteMetadata;

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s  | ${title}`,
  },
  description,
  openGraph: {
    title,
    description,
    url: './',
    siteName: title,
    images: [socialBanner],
    locale: 'zh-CN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = process.env.BASE_PATH || '';
  unregister();

  return (
    <html
      lang={language}
      className={`${space_grotesk.variable} scroll-smooth`}
      suppressHydrationWarning={true}
    >
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href={`${basePath}/static/favicons/apple-touch-icon.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${basePath}/static/favicons/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/static/favicons/favicon-16x16.png`}
      />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <body
        className={`${sourceSan3.className} ${geistSans.variable} ${geistMono.variable} bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-gray-400`}
      >
        <ThemeProviders>
          <Analytics analyticsConfig={analytics as AnalyticsConfig} />
          <SectionContainer>
            <SearchProvider searchConfig={search as SearchConfig}>
              <Header />
              <main className="mb-auto">{children}</main>
            </SearchProvider>
            <Footer />
          </SectionContainer>
        </ThemeProviders>
        <VercelAnalytics />
      </body>
    </html>
  );
}
