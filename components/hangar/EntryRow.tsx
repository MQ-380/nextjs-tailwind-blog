import Link from 'next/link';

import EntryMark from './EntryMark';

export interface EntryRowData {
  /** 行首标记：有图标用图标，没有就用 code 或首字母 */
  code: string;
  name: string;
  /** 名字下方的次要说明，如机场所在城市 */
  subtitle?: string | null;
  /** 行内的 chip：航司行放机型，机场行放航司代码 */
  chips: string[];
  photoCount: number;
  href: string;
  icon?: string | null;
  /** 没有图标时是否直接显示 code（机场用三字码，比首字母有信息量） */
  showCode?: boolean;
}

interface Props {
  entry: EntryRowData;
  /** 映射表里没有的条目，标出来提醒补录 */
  unclassified?: boolean;
}

/**
 * 最多展示几个 chip。超出的收成 +N。
 * 拍得多的航司能有十几种机型、大机场能有几十家航司，全列会让行高变成邻居的
 * 两三倍，网格排得参差不齐——用行布局本来就是图行高统一好扫。
 */
const MAX_CHIPS = 5;

/** 机库里的一行：整行是链接，指向对应的详情页 */
export default function EntryRow({ entry, unclassified }: Props) {
  const { code, name, subtitle, chips, photoCount, href, icon, showCode } = entry;
  const shown = chips.slice(0, MAX_CHIPS);
  const overflow = chips.length - shown.length;

  return (
    <Link
      href={href}
      className="group -mx-3 flex items-center gap-4 rounded-md px-3 py-3 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <span className="flex w-[160px] shrink-0 items-center gap-2">
        <EntryMark name={name} code={code} icon={icon ?? null} showCode={showCode} />
        <span className="min-w-0">
          <span className="group-hover:text-primary-500 block truncate text-base font-semibold text-gray-900 transition-colors duration-200 dark:text-gray-100">
            {name}
          </span>
          {subtitle && (
            <span className="block truncate text-xs text-gray-500 dark:text-gray-500">
              {subtitle}
            </span>
          )}
        </span>
        {unclassified && (
          <span className="text-primary-500 border-primary-500 shrink-0 rounded border px-1.5 py-px text-[11px]">
            未分类
          </span>
        )}
      </span>

      <span className="flex grow flex-wrap gap-1.5" title={chips.join('  ')}>
        {shown.map((chip) => (
          <span
            key={chip}
            className="rounded border border-gray-200 px-[7px] py-px font-mono text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400"
          >
            {chip}
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
