'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import FilterDropdown from './FilterDropdown';
import GalleryLightbox from './GalleryLightbox';
import { type GalleryPhoto, describePhoto } from './types';

interface Props {
  photos: GalleryPhoto[];
  /**
   * 不展示的筛选分组（按字段名，如 `航司`）。
   * 航司详情页整页都是同一家，再列「航司」筛选没有意义。
   */
  excludeFacets?: string[];
}

const ALL = 'all';
/** 每次滚动到底部追加渲染的照片数 */
const BATCH_SIZE = 24;
/** 距离底部多远开始预加载下一批 */
const PRELOAD_MARGIN = '600px';
/**
 * 筛选分组的展示顺序。没列进来的排在后面，按出现顺序。
 *
 * 和 schema.json 的 fields 顺序无关——那个是文件名的段序，改不了；
 * 这里纯粹是「先看哪个」的问题：彩绘选项少又最好玩，放最上面。
 */
const GROUP_ORDER = ['彩绘', '航司', '机型', '机场'];
/**
 * 选项超过这个数的分组收进下拉框。
 * 航司三十几家、机型二十几种，平铺出来侧边栏会长得没边；
 * 彩绘、机场只有几个，收起来反而多一次点击。用数量自动判断，
 * 以后照片变多、新分组出现都不用再改这里。
 */
const DROPDOWN_THRESHOLD = 10;

export default function GalleryGrid({ photos, excludeFacets = [] }: Props) {
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
  // 只有一个分类时「全部 9 / planes 9」是废话，整组不展示
  const showCategories = tags.length > 1;
  // 默认值 [] 每次渲染都是新数组，用内容当依赖，避免 memo 白重算
  const excludeKey = excludeFacets.join('|');

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
  // 选项始终全部保留：归零的只是变淡，不隐藏也不重排——否则一点选择，
  // 旁边的选项就消失或跳位，很难再找回来。排序用的是不受当前选择影响的
  // 基础数量，所以列表顺序自始至终是固定的。
  const labelGroups = useMemo(() => {
    const groups = new Map<
      string,
      { name: string; label: string; count: number; base: number }[]
    >();

    const names = new Set<string>();
    photosInTag.forEach((photo) => photo.tags.forEach((tag) => names.add(tag)));

    Array.from(names).forEach((name) => {
      const separator = name.indexOf(':');
      const group = separator > 0 ? name.slice(0, separator) : '标签';
      if (excludeKey.split('|').includes(group)) return;
      const label = separator > 0 ? name.slice(separator + 1) : name;

      const combined = activeLabels.includes(name) ? activeLabels : [...activeLabels, name];
      const count = photosInTag.filter((photo) =>
        combined.every((label) => photo.tags.includes(label))
      ).length;
      const base = photosInTag.filter((photo) => photo.tags.includes(name)).length;

      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push({ name, label, count, base });
    });

    groups.forEach((items) =>
      items.sort((a, b) => b.base - a.base || a.label.localeCompare(b.label, 'zh'))
    );

    // 分组本身也要有固定顺序：Map 的插入顺序取决于第一张照片的标签顺序，
    // 换一批照片就可能变，侧边栏的区块会莫名其妙地换位置。
    const rank = (title: string) => {
      const index = GROUP_ORDER.indexOf(title);
      return index === -1 ? GROUP_ORDER.length : index;
    };
    return Array.from(groups, ([title, items]) => ({ title, items })).sort(
      (a, b) => rank(a.title) - rank(b.title)
    );
  }, [photosInTag, activeLabels, excludeKey]);

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
      // 先在事件处理里算出新值再 set，不要把 syncUrl 放进 setState 的 updater：
      // updater 是在渲染阶段执行的（严格模式下还会执行两次），
      // 在里面调 router.replace 会触发
      // "Cannot update a component (Router) while rendering a different component"。
      const next = activeLabels.includes(label)
        ? activeLabels.filter((l) => l !== label)
        : [...activeLabels, label];
      setActiveLabels(next);
      setVisibleCount(BATCH_SIZE);
      syncUrl(activeTag, next);
    },
    [syncUrl, activeTag, activeLabels]
  );

  // 下拉框里的「清除已选」：按选项名剔除，而不是按 `分组:` 前缀匹配——
  // 没有冒号的标签会落进「标签」组，前缀匹配对它们不成立。
  const clearLabels = useCallback(
    (names: string[]) => {
      const drop = new Set(names);
      const next = activeLabels.filter((label) => !drop.has(label));
      setActiveLabels(next);
      setVisibleCount(BATCH_SIZE);
      syncUrl(activeTag, next);
    },
    [syncUrl, activeTag, activeLabels]
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
        {showCategories && (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {categories.map(({ name, label, count }) => (
              <Pill key={name} active={activeTag === name} onClick={() => selectTag(name)}>
                {label} ({count})
              </Pill>
            ))}
          </div>
        )}
        {labelGroups.map(({ title, items }) => {
          const selected = items
            .filter(({ name }) => activeLabels.includes(name))
            .map(({ name }) => name);

          // 选项多的分组在手机上更该收起来：几十个 pill 横向划过去根本找不到目标
          if (items.length > DROPDOWN_THRESHOLD) {
            return (
              <div key={title} className="mt-2 flex items-center gap-2">
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{title}</span>
                <div className="min-w-0 flex-1">
                  <FilterDropdown
                    title={title}
                    items={items}
                    selected={selected}
                    onToggle={toggleLabel}
                    onClear={() => clearLabels(items.map(({ name }) => name))}
                  />
                </div>
              </div>
            );
          }

          return (
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
                  dim={!activeLabels.includes(name) && count === 0}
                >
                  {label} ({count})
                </Pill>
              ))}
            </div>
          );
        })}
      </div>
      <div className="mb-6 sm:mb-0" />

      <div className="flex gap-8">
        {/* 桌面端：固定在侧边的标签栏 */}
        <aside className="hidden sm:block">
          <nav className="sticky top-24 max-h-[calc(100vh-8rem)] w-36 space-y-5 overflow-y-auto lg:w-44">
            {showCategories && (
              <SidebarGroup
                items={categories.map(({ name, label, count }) => ({ name, label, count }))}
                isActive={(name) => activeTag === name}
                onSelect={selectTag}
              />
            )}
            {labelGroups.map(({ title, items }) => {
              const selected = items
                .filter(({ name }) => activeLabels.includes(name))
                .map(({ name }) => name);

              if (items.length > DROPDOWN_THRESHOLD) {
                return (
                  <div key={title}>
                    <GroupTitle>{title}</GroupTitle>
                    <FilterDropdown
                      title={title}
                      items={items}
                      selected={selected}
                      onToggle={toggleLabel}
                      onClear={() => clearLabels(items.map(({ name }) => name))}
                    />
                  </div>
                );
              }

              return (
                <SidebarGroup
                  key={title}
                  title={title}
                  items={items}
                  isActive={(name) => activeLabels.includes(name)}
                  onSelect={toggleLabel}
                />
              );
            })}
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
  dim,
  onClick,
  children,
}: {
  active: boolean;
  subtle?: boolean;
  dim?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 font-medium transition-colors duration-200 ${
        subtle ? 'text-xs' : 'text-sm'
      } ${dim ? 'opacity-40' : ''} ${
        active
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

/** 侧边栏分组标题。平铺列表和下拉框共用，免得两边样式各写一份日后走样 */
function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-3 pb-1 text-xs tracking-wide text-gray-400 uppercase dark:text-gray-500">
      {children}
    </h2>
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
  // 计数为 0 表示叠加它会没有结果。变淡但保留可点，点了会看到空结果提示
  const dim = (count: number, active: boolean) => !active && count === 0;
  return (
    <div>
      {title && <GroupTitle>{title}</GroupTitle>}
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
                } ${dim(count, active) ? 'opacity-40' : ''}`}
              >
                <span className="truncate" title={label}>
                  {label}
                </span>
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
