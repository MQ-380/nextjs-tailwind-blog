"use client";

import { useEffect, useState } from "react";

interface TOCProps {
  toc: {
    value: string;
    depth: number;
    url: string;
  }[];
}

export default function TableOfContents({ toc }: TOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll("h1, h2, h3");
      const headingPositions = Array.from(headings).map((heading) => ({
        id: heading.id,
        position: heading.getBoundingClientRect().top,
      }));

      const activeHeading = headingPositions.find(
        (heading) => heading.position > 0,
      );
      if (activeHeading) {
        setActiveId(activeHeading.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="hidden xl:block sticky top-60 max-h-[calc(100vh-4rem)] overflow-auto">
      <h3 className="text-lg font-bold mb-4">目录</h3>
      <ul>
        {toc.map((heading) => (
          <li
            key={heading.value}
            className={`${heading.depth >= 3 ? "ml-4" : ""} mb-2`}
          >
            <a
              href={heading.url}
              className={`block text-sm ${
                activeId === heading.url.slice(1)
                  ? "text-primary-500 font-medium"
                  : "text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-500"
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
