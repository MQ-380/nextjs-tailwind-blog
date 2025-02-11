import { CoreContent } from 'pliny/utils/contentlayer.js';
import { formatDate } from 'pliny/utils/formatDate.js';

import siteMetadata from '@/data/siteMetadata';

import { Post } from '@/.contentlayer/generated';

import CustomLink from './Link';
import Tag from './Tag';

export default function PostList({ posts }: { posts: CoreContent<Post>[] }) {
  return (
    <>
      {!posts.length && 'No posts found.'}
      {posts.map((post) => (
        <ListItem post={post} key={post.path} />
      ))}
    </>
  );
}

function ListItem({ post }: { post: CoreContent<Post> }) {
  const { date, path, tags, summary, title } = post;
  return (
    <article className="py-8">
      <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
        <dl>
          <dt className="sr-only">Published on</dt>
          <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
            <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
          </dd>
        </dl>
        <div className="space-y-5 xl:col-span-3">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl leading-8 font-bold tracking-tight">
                <CustomLink href={path} className="text-gray-900 dark:text-gray-100">
                  {title}
                </CustomLink>
              </h2>
              <div className="flex flex-wrap">
                {tags.map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
            </div>
            <div className="prose max-w-none text-gray-500 dark:text-gray-400">{summary}</div>
          </div>
          <div className="text-base leading-6 font-medium">
            <CustomLink
              href={path}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label={`Read more: "${title}"`}
            >
              Read more &rarr;
            </CustomLink>
          </div>
        </div>
      </div>
    </article>
  );
}
