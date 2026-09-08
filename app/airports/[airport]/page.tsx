import { Suspense } from 'react';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import SectionContainer from '@/components/SectionContainer';
import { AIRPORT_FIELD } from '@/components/airports/directory';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import type { GalleryPhoto } from '@/components/gallery/types';
import PageTitle from '@/components/posts/PageTitle';

import airportsConfig from '@/data/airports.json';

import galleryData from '@/app/gallery-data.json';

const photos = galleryData as GalleryPhoto[];
const AIRPORTS = airportsConfig.airports as Record<
  string,
  { name: string; en: string; city: string; region: string }
>;

function photosOf(slug: string) {
  return photos.filter((photo) => photo.codes?.[AIRPORT_FIELD]?.toLowerCase() === slug);
}

/** 只为拍到过的机场生成页面 */
export function generateStaticParams() {
  const slugs = new Set(
    photos
      .map((photo) => photo.codes?.[AIRPORT_FIELD])
      .filter(Boolean)
      .map((code) => code.toLowerCase())
  );
  return Array.from(slugs, (airport) => ({ airport }));
}

export async function generateMetadata({ params }: { params: Promise<{ airport: string }> }) {
  const { airport } = await params;
  const code = airport.toUpperCase();
  return { title: AIRPORTS[code]?.name ?? code };
}

export default async function AirportPage({ params }: { params: Promise<{ airport: string }> }) {
  const { airport } = await params;
  const matched = photosOf(airport);
  if (matched.length === 0) notFound();

  const code = matched[0].codes[AIRPORT_FIELD];
  const info = AIRPORTS[code];
  const airlines = Array.from(
    new Set(matched.map((photo) => photo.fields['航司']).filter(Boolean))
  );

  return (
    <SectionContainer>
      <div className="pt-6 pb-16">
        <Link
          href="/airports"
          className="hover:text-primary-500 dark:hover:text-primary-400 -ml-1 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors duration-200 dark:text-gray-400"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Izumi的机库
        </Link>

        <div className="pt-4 pb-8">
          <div className="flex items-baseline gap-3">
            <PageTitle>{info?.name ?? code}</PageTitle>
            <span className="font-mono text-lg text-gray-500 dark:text-gray-500">{code}</span>
          </div>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            {matched.length} 张照片 · {airlines.length} 家航司
            {info?.city ? ` · ${info.city}` : ''}
          </p>
        </div>

        {/* 复用相册的瀑布流。整页都是同一个机场，「机场」这组筛选没有意义，排除掉。 */}
        <Suspense fallback={null}>
          <GalleryGrid photos={matched} excludeFacets={[AIRPORT_FIELD]} />
        </Suspense>
      </div>
    </SectionContainer>
  );
}
