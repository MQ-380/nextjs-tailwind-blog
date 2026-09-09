'use client';

import { useMemo, useState } from 'react';

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

export interface FilterItem {
  name: string;
  label: string;
  /** 在当前选择基础上再叠加这个选项后还剩几张 */
  count: number;
}

interface Props {
  /** 分组名，只用于无障碍标签和搜索框占位符；标题由调用方渲染 */
  title: string;
  items: FilterItem[];
  selected: string[];
  onToggle: (name: string) => void;
  onClear: () => void;
}

/** 选项多到这个数才给搜索框；再少的话一眼扫得完，搜索框只是占地方 */
const SEARCH_THRESHOLD = 12;

/**
 * 多选下拉筛选。选项多的分组（航司、机型）用它收起来，
 * 侧边栏才不会被几十个选项撑成一条长得没边的列表。
 *
 * 用 Headless UI 的 Popover 而不是自己写：面板要 portal 出去。
 * 侧边栏是 `overflow-y-auto` 的 sticky 容器，绝对定位的面板会被裁掉。
 */
export default function FilterDropdown({ title, items, selected, onToggle, onClear }: Props) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.label.toLowerCase().includes(keyword));
  }, [items, query]);

  // 已选的显示第一个 + 余量，选项名可能很长（China Southern Airlines），靠 truncate 收住
  const summary =
    selected.length === 0
      ? '全部'
      : (items.find((item) => item.name === selected[0])?.label ?? selected[0]);

  const active = selected.length > 0;

  return (
    <Popover className="relative">
      <PopoverButton
        aria-label={`筛选${title}`}
        className={`flex w-full cursor-pointer items-center justify-between gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          active
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
        }`}
      >
        <span className="truncate" title={selected.length > 0 ? summary : undefined}>
          {summary}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {selected.length > 1 && (
            <span className={active ? 'text-white/70' : 'text-gray-400'}>
              +{selected.length - 1}
            </span>
          )}
          <ChevronIcon />
        </span>
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: 'bottom start', gap: 4 }}
        className="z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
      >
        {items.length > SEARCH_THRESHOLD && (
          <div className="border-b border-gray-100 p-2 dark:border-gray-800">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`搜索${title}`}
              className="focus:ring-primary-500 w-full rounded-md border-0 bg-gray-100 px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        )}

        <ul className="max-h-72 overflow-y-auto p-1">
          {visible.length === 0 && (
            <li className="px-2.5 py-3 text-center text-sm text-gray-400 dark:text-gray-500">
              没有匹配的{title}
            </li>
          )}
          {visible.map(({ name, label, count }) => {
            const checked = selected.includes(name);
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onToggle(name)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    // 计数为 0 表示叠加它会没有结果。变淡但保留可点，和平铺列表一个规则
                    !checked && count === 0 ? 'opacity-40' : ''
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      checked
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    aria-hidden="true"
                  >
                    {checked && <CheckIcon />}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate ${
                      checked
                        ? 'font-medium text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    title={label}
                  >
                    {label}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {selected.length > 0 && (
          <div className="border-t border-gray-100 p-1 dark:border-gray-800">
            <button
              type="button"
              onClick={onClear}
              className="w-full cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              清除已选（{selected.length}）
            </button>
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 opacity-60" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
