'use client';

import { useMemo, useState } from 'react';

import { CoreContent } from 'pliny/utils/contentlayer.js';

import Pagination from '@/components/Pagination';
import PostList from '@/components/PostList';

import { Post } from '@/.contentlayer/generated';

interface ListLayoutProps {
  posts: CoreContent<Post>[];
  title: string;
}

const POSTS_PER_PAGE = 10;

export default function ListLayout({ posts, title }: ListLayoutProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const filteredBlogPosts = useMemo(
    () =>
      searchValue
        ? posts.filter((post) => post.title.toLowerCase().includes(searchValue.toLowerCase()))
        : posts,
    [searchValue, posts]
  );

  const displayPosts =
    posts.length > 0 && !searchValue
      ? posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)
      : filteredBlogPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <label>
              <span className="sr-only">Search articles</span>
              <input
                aria-label="Search articles"
                type="text"
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchValue(e.target.value);
                }}
                placeholder="Search articles"
                className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
            <SearchIcon />
          </div>
        </div>
        <ul>
          <PostList posts={displayPosts || []} />
        </ul>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}
    </>
  );
}

const SearchIcon = () => (
  <svg
    className="absolute top-3 right-3 h-5 w-5 text-gray-400 dark:text-gray-300"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
