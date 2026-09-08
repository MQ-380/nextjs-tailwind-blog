'use client';

import { useState } from 'react';

interface Props {
  names: string[];
}

/**
 * 还没拍到的航司。它们没有机型也没有数量，占一整行是空的，
 * 所以折叠起来、展开后是一片灰色名字，不可点击。
 */
export default function MissingList({ names }: Props) {
  const [open, setOpen] = useState(false);
  if (names.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="-mx-3 mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-500 transition-colors duration-200 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
        aria-expanded={open}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        还没拍到的 {names.length} 家
      </button>

      {open && (
        <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 pt-1 pb-1">
          {names.map((name) => (
            <span key={name} className="text-sm text-gray-300 dark:text-gray-600">
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
