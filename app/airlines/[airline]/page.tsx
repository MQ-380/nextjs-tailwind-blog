import { Suspense } from 'react';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import SectionContainer from '@/components/SectionContainer';
import { AIRLINE_FIELD, airlineSlug } from '@/components/airlines/directory';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import type { GalleryPhoto } from '@/components/gallery/types';
import PageTitle from '@/components/posts/PageTitle';

import galleryData from '@/app/gallery-data.json';

const photos = galleryData as GalleryPhoto[];

function photosOf(slug: string) {
  return photos.filter((photo) => {
    const airline = photo.fields[AIRLINE_FIELD];
    return airline ? airlineSlug(airline) === slug : false;
  });
}

/** 只为拍到过的航司生成页面，没拍到的不该有空页面 */
export function generateStaticParams() {
  const slugs = new Set(
    photos
      .map((photo) => photo.fields[AIRLINE_FIELD])
      .filter(Boolean)
      .map(airlineSlug)
  );
  return Array.from(slugs, (airline) => ({ airline }));
}

export async function generateMetadata({ params }: { params: Promise<{ airline: string }> }) {
  const { airline } = await params;
  const matched = photosOf(airline);
  return { title: matched[0]?.fields[AIRLINE_FIELD] ?? '航司' };
}

export default async function AirlinePage({ params }: { params: Promise<{ airline: string }> }) {
  const { airline } = await params;
  const matched = photosOf(airline);
  if (matched.length === 0) notFound();

  const name = matched[0].fields[AIRLINE_FIELD];
  const aircraft = Array.from(
    new Set(matched.map((photo) => photo.fields['机型']).filter(Boolean))
  );
  const airports = Array.from(
    new Set(matched.map((photo) => photo.fields['机场']).filter(Boolean))
  );

  return (
    <SectionContainer>
      <div className="pt-6 pb-16">
        <Link
          href="/airlines"
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
          航司目录
        </Link>

        <div className="flex flex-col gap-5 pt-4 pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <PageTitle>{name}</PageTitle>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              {matched.length} 张照片 · {aircraft.length} 种机型 · {airports.join('、')}
            </p>
          </div>
        </div>

        {/* 复用相册的瀑布流：分批懒加载、大图弹层、机型/机场筛选都一样。
            整页都是同一家航司，所以「航司」这一组筛选没有意义，排除掉。 */}
        <Suspense fallback={null}>
          <GalleryGrid photos={matched} excludeFacets={[AIRLINE_FIELD]} />
        </Suspense>
      </div>
    </SectionContainer>
  );
}
