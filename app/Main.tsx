import { CoreContent } from 'pliny/utils/contentlayer.js';

import Link from '@/components/Link';
import CustomLink from '@/components/Link';
import PostList from '@/components/PostList';

import { Post } from '@/.contentlayer/generated';

const MAX_DISPLAY = 10;
interface MainProps {
  posts: CoreContent<Post>[];
}

export function Main({ posts }: MainProps) {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-700 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Welcome
          </h1>
          <div className="flex items-end justify-between">
            <div className="text-lg leading-7 break-normal text-gray-500 xl:w-5/6 dark:text-gray-400">
              <p>🇯🇵 💻</p>
              <p>
                生活在东京的前端程序员，除了技术，还有生活。如果想要更详细了解我，请移步
                <CustomLink href={'/about'} className="text-blue-600 dark:text-blue-400">
                  About页面
                </CustomLink>
                。
              </p>
              <p>
                {`A frontend developer living in Tokyo, exploring both tech and life. For more about
                me,please visit `}
                <CustomLink href={'/about'} className="text-blue-600 dark:text-blue-400">
                  the About page
                </CustomLink>
                .
              </p>
              <p>
                東京在住のフロントエンドエンジニア。技術だけでなく、生活も大切に。詳しくは
                <CustomLink href={'/about'} className="text-blue-600 dark:text-blue-400">
                  Aboutページ
                </CustomLink>{' '}
                をご覧ください。。
              </p>
            </div>
            <div>
              总字数：
              {posts.reduce((pre, curr) => pre + curr.readingTime.words, 0)}
            </div>
          </div>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <PostList posts={posts.slice(0, MAX_DISPLAY)} />
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/posts"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  );
}
