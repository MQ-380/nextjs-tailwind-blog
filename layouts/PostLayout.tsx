import { CoreContent } from 'pliny/utils/contentlayer.js';

import CustomLink from '@/components/Link';
import SectionContainer from '@/components/SectionContainer';
import TableOfContents from '@/components/TOC';
import Tag from '@/components/Tag';
import PageTitle from '@/components/posts/PageTitle';
import ScrollTop from '@/components/posts/ScrollTop';

import siteMetadata from '@/data/siteMetadata';

import { Post } from '@/.contentlayer/generated';
import '@/css/post.css';

import { PostLinkProps } from './PostBanner';

interface LayoutProps {
  content: CoreContent<Post>;
  next?: PostLinkProps;
  prev?: PostLinkProps;
  children: React.ReactNode;
}

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { date, title, tags, toc, readingTime } = content;

  return (
    <SectionContainer>
      <ScrollTop />
      <article>
        <div>
          <header className="justify-between pt-6 xl:flex xl:pb-6">
            <div className="space-y-1 text-left xl:w-2/3">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                    </time>
                  </dd>
                </div>
              </dl>
              <PageTitle>{title}</PageTitle>
              <dd>字数 {readingTime.words}</dd>
            </div>
            <div>
              {tags && (
                <div className="py-4 xl:py-8">
                  <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Tags
                  </h2>
                  <div className="flex flex-wrap">
                    {tags.map((tag) => (
                      <Tag key={tag} text={tag} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* 移除外层的 xl:divide-y，改为flex布局 */}
          <div className="xl:flex xl:gap-x-6">
            {/* 内容区域 */}
            <div className="xl:w-5/7">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="prose dark:prose-invert max-w-none pt-10 pb-8">{children}</div>

                {/* 将 footer 移到内容区域内 */}
                <footer>
                  <div className="divide-gray-200 text-sm leading-5 font-medium dark:divide-gray-700">
                    {(next || prev) && (
                      <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                        {prev && prev.path && (
                          <PostLink path={prev.path} title={prev.title} isPrev={true} />
                        )}
                        {next && next.path && (
                          <PostLink path={next.path} title={next.title} isPrev={false} />
                        )}
                      </div>
                    )}
                  </div>
                </footer>
              </div>
            </div>

            {/* 目录区域 */}
            {toc.length > 0 && (
              <aside className="hidden xl:block xl:w-2/7">
                <div className="sticky top-60 max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <TableOfContents toc={toc} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </article>
    </SectionContainer>
  );
}

const PostLink = ({ path, title, isPrev }: PostLinkProps & { isPrev: boolean }) => (
  <div>
    <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
      {isPrev ? 'Previous Article' : 'Next Article'}
    </h2>
    <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
      <CustomLink href={`/${path}`}>{title}</CustomLink>
    </div>
  </div>
);
