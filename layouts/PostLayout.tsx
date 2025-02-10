import { Post } from "@/.contentlayer/generated";
import { CoreContent } from "pliny/utils/contentlayer.js";
import { PostLinkProps } from "./PostBanner";
import SectionContainer from "@/components/SectionContainer";
import ScrollTop from "@/components/posts/ScrollTop";
import siteMetadata from "@/data/siteMetadata";
import PageTitle from "@/components/posts/PageTitle";
import CustomLink from "@/components/Link";
import Tag from "@/components/Tag";
import "@/css/post.css";
import TableOfContents from "@/components/TOC";

interface LayoutProps {
  content: CoreContent<Post>;
  next?: PostLinkProps;
  prev?: PostLinkProps;
  children: React.ReactNode;
}

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export default function PostLayout({
  content,
  next,
  prev,
  children,
}: LayoutProps) {
  const { date, title, tags, toc, readingTime } = content;

  return (
    <SectionContainer>
      <ScrollTop />
      <article>
        <div>
          <header className="pt-6 xl:flex xl:pb-6 ">
            <div className="space-y-1 text-left xl:w-2/3">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(
                        siteMetadata.locale,
                        postDateTemplate,
                      )}
                    </time>
                  </dd>
                </div>
              </dl>
              <PageTitle>{title}</PageTitle>
              <dd>字数 {readingTime.words}</dd>
            </div>
            <div className="xl:w-1/3">
              {tags && (
                <div className="py-4 xl:py-8">
                  <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
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
                <div className="prose max-w-none pb-8 pt-10 dark:prose-invert">
                  {children}
                </div>

                {/* 将 footer 移到内容区域内 */}
                <footer>
                  <div className="divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 ">
                    {(next || prev) && (
                      <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                        {prev && prev.path && (
                          <PostLink
                            path={prev.path}
                            title={prev.title}
                            isPrev={true}
                          />
                        )}
                        {next && next.path && (
                          <PostLink
                            path={next.path}
                            title={next.title}
                            isPrev={false}
                          />
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
                <div className="sticky top-60 overflow-y-auto max-h-[calc(100vh-6rem)]">
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

const PostLink = ({
  path,
  title,
  isPrev,
}: PostLinkProps & { isPrev: boolean }) => (
  <div>
    <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {isPrev ? "Previous Article" : "Next Article"}
    </h2>
    <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
      <CustomLink href={`/${path}`}>{title}</CustomLink>
    </div>
  </div>
);
