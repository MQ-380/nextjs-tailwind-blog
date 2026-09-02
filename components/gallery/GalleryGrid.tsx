'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';

import GalleryLightbox from './GalleryLightbox';
import type { GalleryPhoto } from './types';

interface Props {
  photos: GalleryPhoto[];
}

const ALL = 'all';
/** 每次滚动到底部追加渲染的照片数 */
const BATCH_SIZE = 24;
/** 距离底部多远开始预加载下一批 */
const PRELOAD_MARGIN = '600px';

export default function GalleryGrid({ photos }: Props) {
  const [activeTag, setActiveTag] = useState<string>(ALL);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const columnCount = useColumnCount();
  const mounted = useMounted();

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    photos.forEach((photo) => counts.set(photo.tag, (counts.get(photo.tag) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))
      .map(([tag, count]) => ({ tag, count }));
  }, [photos]);

  const filteredPhotos = useMemo(
    () => (activeTag === ALL ? photos : photos.filter((photo) => photo.tag === activeTag)),
    [photos, activeTag]
  );

  const selectTag = useCallback((tag: string) => {
    setActiveTag(tag);
    setVisibleCount(BATCH_SIZE);
  }, []);

  const visiblePhotos = useMemo(
    () => filteredPhotos.slice(0, visibleCount),
    [filteredPhotos, visibleCount]
  );
  const hasMore = visibleCount < filteredPhotos.length;

  // 哨兵元素进入视口时追加下一批。visibleCount 进依赖是有意的：
  // IntersectionObserver 只在相交状态“变化”时回调，追加后哨兵若仍在视口内不会再触发，
  // 需要重建 observer 让它带着当前状态再判断一次。
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredPhotos.length));
        }
      },
      { rootMargin: PRELOAD_MARGIN }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, filteredPhotos.length]);

  if (photos.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        还没有照片。把照片放进 public/static/images/gallery/&lt;tag&gt;/ 后运行{' '}
        <code>npm run generate-gallery</code>。
      </p>
    );
  }

  const filterItems = [{ tag: ALL, label: '全部', count: photos.length }].concat(
    tags.map(({ tag, count }) => ({ tag, label: tag, count }))
  );

  return (
    <div>
      {/* 移动端：横向滚动的标签条 */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:hidden">
        {filterItems.map(({ tag, label, count }) => (
          <button
            key={tag}
            type="button"
            onClick={() => selectTag(tag)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-200 ${
              activeTag === tag
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="flex gap-8">
        {/* 桌面端：固定在侧边的标签栏 */}
        <aside className="hidden sm:block">
          <nav className="sticky top-24 max-h-[calc(100vh-8rem)] w-36 overflow-y-auto lg:w-44">
            <ul className="space-y-1">
              {filterItems.map(({ tag, label, count }) => (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => selectTag(tag)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeTag === tag
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    <span
                      className={
                        activeTag === tag ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                      }
                    >
                      {count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {mounted ? (
            // 挂载后：按最短列分配，追加新一批时不会打乱已渲染的照片
            <div className="flex gap-4">
              {distribute(visiblePhotos, columnCount).map((column, columnIndex) => (
                <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-4">
                  {column.map(({ photo, index }) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      priority={index < 4}
                      onOpen={() => setLightboxIndex(index)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            // 首屏（SSR / 未挂载）：用 CSS columns，各断点下都正确且无需 JS
            <div className="columns-2 gap-4 lg:columns-3 xl:columns-4">
              {visiblePhotos.map((photo, index) => (
                <div key={photo.id} className="mb-4 break-inside-avoid">
                  <PhotoCard
                    photo={photo}
                    priority={index < 4}
                    onOpen={() => setLightboxIndex(index)}
                  />
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <span className="text-sm text-gray-400 dark:text-gray-500">加载中…</span>
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          photos={filteredPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}

function PhotoCard({
  photo,
  priority,
  onOpen,
}: {
  photo: GalleryPhoto;
  priority: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
    >
      <Image
        src={photo.src}
        alt={photo.caption ?? photo.tag}
        width={photo.width}
        height={photo.height}
        priority={priority}
        className="h-auto w-full object-cover transition duration-300 group-hover:scale-105"
        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {photo.caption && (
          <span className="text-left text-sm font-medium text-white">{photo.caption}</span>
        )}
        <span className="text-left text-xs text-white/70">{photo.tag}</span>
      </div>
    </button>
  );
}

/** 把照片依次放进当前最矮的一列，高度按等宽缩放后的相对值估算 */
function distribute(photos: GalleryPhoto[], columnCount: number) {
  const columns: { photo: GalleryPhoto; index: number }[][] = Array.from(
    { length: columnCount },
    () => []
  );
  const heights = new Array<number>(columnCount).fill(0);

  photos.forEach((photo, index) => {
    let shortest = 0;
    for (let i = 1; i < columnCount; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push({ photo, index });
    heights[shortest] += photo.height / photo.width;
  });

  return columns;
}

/** 与 CSS 断点保持一致：<1024 两列，1024–1279 三列，≥1280 四列 */
function useColumnCount() {
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const xl = window.matchMedia('(min-width: 1280px)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const update = () => setColumnCount(xl.matches ? 4 : lg.matches ? 3 : 2);

    update();
    xl.addEventListener('change', update);
    lg.addEventListener('change', update);
    return () => {
      xl.removeEventListener('change', update);
      lg.removeEventListener('change', update);
    };
  }, []);

  return columnCount;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
