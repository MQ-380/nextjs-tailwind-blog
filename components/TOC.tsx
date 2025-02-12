'use client';

import { useEffect, useState } from 'react';

interface TOCProps {
  toc: {
    value: string;
    depth: number;
    url: string;
  }[];
}

export default function TableOfContents({ toc }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3');
      const headingPositions = Array.from(headings).map((heading) => ({
        id: heading.id,
        position: heading.getBoundingClientRect().top,
      }));

      const activeHeading = headingPositions.find((heading) => heading.position > 0);
      if (activeHeading) {
        setActiveId(activeHeading.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="sticky top-60 hidden max-h-[calc(100vh-4rem)] overflow-auto xl:block">
      <h3 className="mb-4 text-lg font-bold">目录</h3>
      <ul>
        {toc.map((heading) => (
          <li key={heading.url} className={`${heading.depth >= 3 ? 'ml-4' : ''} mb-2`}>
            <a
              href={heading.url}
              className={`block text-sm ${
                activeId === heading.url.slice(1)
                  ? 'text-primary-500 font-medium'
                  : 'hover:text-primary-500 dark:hover:text-primary-500 text-gray-600 dark:text-gray-400'
              }`}
            >
              {heading.value}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
