import { CoreContent, allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js';

import CustomLink from '@/components/Link';
import SectionContainer from '@/components/SectionContainer';
import ScrollTop from '@/components/posts/ScrollTop';

import { Post, allPosts } from '@/.contentlayer/generated';
import '@/css/timeline.css';

export default async function Timeline() {
  const posts = allCoreContent(sortPosts(allPosts));
  const postsByYears = posts.reduce(
    (last, currPost) => {
      const { date } = currPost;
      const year = date.split('-')[0];
      last[year] = [...(last[year] || []), currPost];
      return last;
    },
    {} as Record<string, CoreContent<Post>[]>
  );

  return (
    <SectionContainer>
      <ScrollTop />

      <div className="archives flex flex-col justify-center">
        {Object.entries(postsByYears)
          .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
          .map(([year, yearPosts]) => (
            <PostInYears year={year} posts={yearPosts} key={year} />
          ))}
      </div>
    </SectionContainer>
  );
}

const PostInYears = ({ year, posts }: { year: string; posts: CoreContent<Post>[] }) => {
  posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return (
    <>
      <time className="year-marker">{year}</time>
      <ul className="post-wrapper">
        {posts.map(({ date, title, path }) => {
          const dateObject = new Date(date);
          return (
            <li key={title}>
              <span className="date day">{String(dateObject.getDate()).padStart(2, '0')}</span>
              <span className="date month small text-muted ms-1">
                {MONTH[dateObject.getMonth()]}
              </span>
              <CustomLink href={path} className="post-link">
                {title}
              </CustomLink>
            </li>
          );
        })}
      </ul>
    </>
  );
};

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
