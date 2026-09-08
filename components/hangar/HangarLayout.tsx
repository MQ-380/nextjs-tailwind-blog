import Link from 'next/link';

import PageTitle from '../posts/PageTitle';

interface Props {
  /** 当前所在的视角，决定哪个标签高亮 */
  view: 'airline' | 'airport';
  stats: { airlines: number; photos: number; airports: number };
  children: React.ReactNode;
}

/**
 * 机库两个视角共用的外壳：标题、汇总数字、视角切换。
 *
 * 两个视角是两个独立路由而非同一页面加 ?view= 参数——带 searchParams 的页面会被
 * Next 判定为动态渲染，而动态页面在 Vercel 的函数环境里读不到 public/ 目录，
 * 曾导致航司图标在线上整体消失。拆成两个路由后都能静态生成。
 */
export default function HangarLayout({ view, stats, children }: Props) {
  return (
    <div className="pt-6 pb-16">
      <div className="flex flex-col gap-6 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div>
          <PageTitle>Izumi的机库</PageTitle>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
            欢迎来到我的飞机相片基地
          </p>
        </div>
        <dl className="flex shrink-0 gap-7 sm:pb-1.5">
          <Stat value={stats.airlines} label="航司" />
          <Stat value={stats.photos} label="照片" />
          <Stat value={stats.airports} label="机场" />
        </dl>
      </div>

      <div className="flex gap-1 pt-6">
        <ViewTab href="/airlines" active={view === 'airline'}>
          按航司
        </ViewTab>
        <ViewTab href="/airports" active={view === 'airport'}>
          按机场
        </ViewTab>
      </div>

      {children}
    </div>
  );
}

function ViewTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
        active
          ? 'bg-primary-500 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

export function GroupHeader({
  title,
  en,
  meta,
  note,
  progress,
  muted,
  accent,
}: {
  title: string;
  en?: string;
  meta: string;
  note?: string;
  progress?: number;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="border-b border-gray-200 pb-2.5 dark:border-gray-800">
      <div className="flex items-baseline gap-3">
        <h2
          className={`text-lg font-bold ${
            accent
              ? 'text-primary-500'
              : muted
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {title}
        </h2>
        {en && (
          <span className="font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-gray-500">
            {en}
          </span>
        )}
        {note && <span className="text-xs text-gray-500 dark:text-gray-500">{note}</span>}
        <span className="ml-auto font-mono text-[13px] text-gray-600 dark:text-gray-400">
          {meta}
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-2 h-0.5 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-gray-400 dark:bg-gray-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-10 pt-1 lg:grid-cols-2">{children}</div>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-left sm:text-right">
      <dd className="font-mono text-[28px] leading-none font-medium text-gray-900 dark:text-gray-100">
        {value}
      </dd>
      <dt className="mt-1.5 text-xs tracking-wide text-gray-500 uppercase dark:text-gray-500">
        {label}
      </dt>
    </div>
  );
}
