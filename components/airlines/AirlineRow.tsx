import Link from 'next/link';

import AirlineMark from './AirlineMark';
import type { DirectoryAirline } from './directory';

interface Props {
  airline: DirectoryAirline;
  /** 映射表里没有的航司，标出来提醒补录 */
  unclassified?: boolean;
}

/**
 * 最多展示几种机型。超出的收成 +N。
 * 拍得多的航司能有十几种机型，全列会让行高变成邻居的两三倍，
 * 两列网格排得参差不齐——用行布局本来就是图行高统一好扫。
 * 完整机型仍可在相册的「机型」筛选里看到。
 */
const MAX_AIRCRAFT = 5;

/** 整行是一个链接，指向已经筛好的相册 */
export default function AirlineRow({ airline, unclassified }: Props) {
  const { name, aircraft, photoCount, href, icon } = airline;
  const shown = aircraft.slice(0, MAX_AIRCRAFT);
  const overflow = aircraft.length - shown.length;

  return (
    <Link
      href={href ?? '/gallery'}
      className="group -mx-3 flex items-center gap-4 rounded-md px-3 py-3 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <span className="flex w-[160px] shrink-0 items-center gap-2">
        <AirlineMark name={name} icon={icon} />
        <span className="group-hover:text-primary-500 truncate text-base font-semibold text-gray-900 transition-colors duration-200 dark:text-gray-100">
          {name}
        </span>
        {unclassified && (
          <span className="text-primary-500 border-primary-500 shrink-0 rounded border px-1.5 py-px text-[11px]">
            未分类
          </span>
        )}
      </span>

      <span className="flex grow flex-wrap gap-1.5" title={aircraft.join('  ')}>
        {shown.map((type) => (
          <span
            key={type}
            className="rounded border border-gray-200 px-[7px] py-px font-mono text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400"
          >
            {type}
          </span>
        ))}
        {overflow > 0 && (
          <span className="px-[7px] py-px font-mono text-xs text-gray-400 dark:text-gray-500">
            +{overflow}
          </span>
        )}
      </span>

      <span className="shrink-0 font-mono text-sm text-gray-600 dark:text-gray-400">
        {photoCount}
      </span>

      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:text-primary-500 shrink-0 text-gray-400 transition-colors duration-200 dark:text-gray-500"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
