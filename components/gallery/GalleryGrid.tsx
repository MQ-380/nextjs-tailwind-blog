'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import GalleryLightbox from './GalleryLightbox';
import { type GalleryPhoto, describePhoto } from './types';

interface Props {
  photos: GalleryPhoto[];
}

const ALL = 'all';
/** 每次滚动到底部追加渲染的照片数 */
const BATCH_SIZE = 24;
/** 距离底部多远开始预加载下一批 */
const PRELOAD_MARGIN = '600px';

export default function GalleryGrid({ photos }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 筛选状态从 URL 还原：航司目录页靠 ?tag=航司:United 链进来，
  // 同时也让任何一组筛选结果变成可分享的链接。
  const [activeTag, setActiveTag] = useState<string>(() => searchParams.get('cat') ?? ALL);
  const [activeLabels, setActiveLabels] = useState<string[]>(() => searchParams.getAll('tag'));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const columnCount = useColumnCount();
  const mounted = useMounted();

  const tags = useMemo(() => countBy(photos, (photo) => [photo.tag]), [photos]);

  // 选中分类后的照片，附加标签的可选项和计数都基于它算，
  // 这样不会出现「选了东京还列着只在大阪出现的机型」这种死选项。
  const photosInTag = useMemo(
    () => (activeTag === ALL ? photos : photos.filter((photo) => photo.tag === activeTag)),
    [photos, activeTag]
  );

  // 多个附加标签之间取交集：选了 ANA 又选 787，只留下 ANA 的 787
  const filteredPhotos = useMemo(
    () =>
      activeLabels.length === 0
        ? photosInTag
        : photosInTag.filter((photo) => activeLabels.every((label) => photo.tags.includes(label))),
    [photosInTag, activeLabels]
  );

  // 标签形如 `航司:United`，按冒号前的字段名分组，侧边栏就能显示成
  // 「航司」「机型」「机场」几个带标题的区块。
  //
  // 计数是「在当前选择基础上再叠加这个标签后还剩几张」，已选中的显示当前结果数。
  // 归零的标签直接不展示，否则会出现 United 已选中却还能点 Delta、
  // 点完一张不剩且页面空白的情况。
  const labelGroups = useMemo(() => {
    const groups = new Map<string, { name: string; label: string; count: number }[]>();

    const names = new Set<string>();
    photosInTag.forEach((photo) => photo.tags.forEach((tag) => names.add(tag)));

    Array.from(names).forEach((name) => {
      const combined = activeLabels.includes(name) ? activeLabels : [...activeLabels, name];
      const count = photosInTag.filter((photo) =>
        combined.every((label) => photo.tags.includes(label))
      ).length;
      if (count === 0 && !activeLabels.includes(name)) return;

      const separator = name.indexOf(':');
      const group = separator > 0 ? name.slice(0, separator) : '标签';
      const label = separator > 0 ? name.slice(separator + 1) : name;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push({ name, label, count });
    });

    groups.forEach((items) =>
      items.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh'))
    );
    return Array.from(groups, ([title, items]) => ({ title, items }));
  }, [photosInTag, activeLabels]);

  // 把筛选状态同步回 URL。replace 而非 push，免得筛几下就塞满浏览器历史；
  // scroll: false 保持当前滚动位置。
  const syncUrl = useCallback(
    (tag: string, labels: string[]) => {
      const params = new URLSearchParams();
      if (tag !== ALL) params.set('cat', tag);
      labels.forEach((label) => params.append('tag', label));
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const selectTag = useCallback(
    (tag: string) => {
      setActiveTag(tag);
      setActiveLabels([]);
      setVisibleCount(BATCH_SIZE);
      syncUrl(tag, []);
    },
    [syncUrl]
  );

  const toggleLabel = useCallback(
    (label: string) => {
      setActiveLabels((current) => {
        const next = current.includes(label)
          ? current.filter((l) => l !== label)
          : [...current, label];
        syncUrl(activeTag, next);
        return next;
      });
      setVisibleCount(BATCH_SIZE);
    },
    [syncUrl, activeTag]
  );

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

  const categories = [{ name: ALL, label: '全部', count: photos.length }].concat(
    tags.map(({ name, count }) => ({ name, label: name, count }))
  );

  return (
    <div>
      {/* 移动端：横向滚动的标签条 */}
      <div className="sm:hidden">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map(({ name, label, count }) => (
            <Pill key={name} active={activeTag === name} onClick={() => selectTag(name)}>
              {label} ({count})
            </Pill>
          ))}
        </div>
        {labelGroups.map(({ title, items }) => (
          <div
            key={title}
            className="no-scrollbar -mx-4 mt-2 flex items-center gap-2 overflow-x-auto px-4 pb-1"
          >
            <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{title}</span>
            {items.map(({ name, label, count }) => (
              <Pill
                key={name}
                active={activeLabels.includes(name)}
                onClick={() => toggleLabel(name)}
                subtle
              >
                {label} ({count})
              </Pill>
            ))}
          </div>
        ))}
      </div>
      <div className="mb-6 sm:mb-0" />

      <div className="flex gap-8">
        {/* 桌面端：固定在侧边的标签栏 */}
        <aside className="hidden sm:block">
          <nav className="sticky top-24 max-h-[calc(100vh-8rem)] w-36 space-y-5 overflow-y-auto lg:w-44">
            <SidebarGroup
              items={categories.map(({ name, label, count }) => ({ name, label, count }))}
              isActive={(name) => activeTag === name}
              onSelect={selectTag}
            />
            {labelGroups.map(({ title, items }) => (
              <SidebarGroup
                key={title}
                title={title}
                items={items}
                isActive={(name) => activeLabels.includes(name)}
                onSelect={toggleLabel}
              />
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {/* 计数归零的标签已经不展示，正常点不出空结果；这里兜底，避免万一时页面全白 */}
          {filteredPhotos.length === 0 && (
            <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
              没有符合条件的照片，试试取消几个标签。
            </p>
          )}
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
        alt={describePhoto(photo)}
        width={photo.width}
        height={photo.height}
        priority={priority}
        className="h-auto w-full object-cover transition duration-300 group-hover:scale-105"
        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="text-left text-sm font-medium text-white">{describePhoto(photo)}</span>
      </div>
    </button>
  );
}

function Pill({
  active,
  subtle,
  onClick,
  children,
}: {
  active: boolean;
  subtle?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 font-medium transition-colors duration-200 ${
        subtle ? 'text-xs' : 'text-sm'
      } ${
        active
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function SidebarGroup({
  title,
  items,
  isActive,
  onSelect,
}: {
  title?: string;
  items: { name: string; label: string; count: number }[];
  isActive: (name: string) => boolean;
  onSelect: (name: string) => void;
}) {
  return (
    <div>
      {title && (
        <h2 className="px-3 pb-1 text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
          {title}
        </h2>
      )}
      <ul className="space-y-1">
        {items.map(({ name, label, count }) => {
          const active = isActive(name);
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => onSelect(name)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                }`}
              >
                <span className="truncate">{label}</span>
                <span className={active ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}>
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** 按 keysOf 取出的键统计出现次数，多的在前、同数按中文排序 */
function countBy(photos: GalleryPhoto[], keysOf: (photo: GalleryPhoto) => string[]) {
  const counts = new Map<string, number>();
  photos.forEach((photo) => {
    keysOf(photo).forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1));
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))
    .map(([name, count]) => ({ name, count }));
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
