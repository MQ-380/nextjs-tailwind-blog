import { ReactNode } from "react";
import { formatDate } from "pliny/utils/formatDate.js";
import { CoreContent } from "pliny/utils/contentlayer.js";
import SectionContainer from "@/components/SectionContainer";
import siteMetadata from "@/data/siteMetadata";
import ScrollTop from "@/components/posts/ScrollTop";
import { Post } from "@/.contentlayer/generated";
import PageTitle from "@/components/posts/PageTitle";

import { PostLink, PostLinkProps } from "./PostBanner";

interface LayoutProps {
  content: CoreContent<Post>;
  children: ReactNode;
  next?: PostLinkProps;
  prev?: PostLinkProps;
}

export default function PostSimple({
  content,
  next,
  prev,
  children,
}: LayoutProps) {
  const { date, title } = content;

  return (
    <SectionContainer>
      <ScrollTop />
      <article>
        <div>
          <header>
            <div className="space-y-1 border-b border-gray-200 pb-10 text-center dark:border-gray-700">
              <dl>
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>
                      {formatDate(date, siteMetadata.locale)}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
              <div className="prose max-w-none pb-8 pt-10 dark:prose-invert">
                {children}
              </div>
            </div>
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && prev.path && (
                  <PostLink path={prev.path} title={prev.title} isPrev={true} />
                )}
                {next && next.path && (
                  <PostLink
                    path={next.path}
                    title={next.title}
                    isPrev={false}
                  />
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  );
}
