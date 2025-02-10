import { Post } from "@/.contentlayer/generated";
import CustomLink from "@/components/Link";
import PageTitle from "@/components/posts/PageTitle";
import ScrollTop from "@/components/posts/ScrollTop";
import SectionContainer from "@/components/SectionContainer";
import Image from "next/image";
import Bleed from "pliny/ui/Bleed.js";
import { CoreContent } from "pliny/utils/contentlayer.js";

export interface PostLinkProps {
  path: string;
  title: string;
}
interface LayoutProps {
  content: CoreContent<Post>;
  children: React.ReactNode;
  next?: PostLinkProps;
  prev?: PostLinkProps;
}

export default function PostBanner({
  content,
  next,
  prev,
  children,
}: LayoutProps) {
  const { title, images } = content;
  const displayImage = images && images.length > 0 ? images[0] : null;
  return (
    <SectionContainer>
      <ScrollTop />
      <article>
        <div>
          <div className="space-y-1 pb-10 text-center dark:border-gray-700">
            {displayImage && (
              <div className="w-full">
                <Bleed>
                  <div className="relative aspect-[2/1] w-full">
                    <Image
                      src={displayImage}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Bleed>
              </div>
            )}

            <div className="relative pt-10">
              <PageTitle>{title}</PageTitle>
            </div>
          </div>

          <div className="prose max-w-none py-4 dark:prose-invert">
            {children}
          </div>

          <footer>
            <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
              {prev && prev.path && (
                <PostLink isPrev={true} path={prev.path} title={prev.title} />
              )}
              {next && next.path && (
                <PostLink isPrev={false} path={next.path} title={next.title} />
              )}
            </div>
          </footer>
        </div>
      </article>
    </SectionContainer>
  );
}

export const PostLink = ({
  path,
  title,
  isPrev,
}: PostLinkProps & { isPrev: boolean }) => (
  <div className="pt-4 xl:pt-8">
    <CustomLink
      href={`/${path}`}
      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
    >
      {isPrev && "&rarr;"} {title} {!isPrev && "&rarr;"}
    </CustomLink>
  </div>
);
