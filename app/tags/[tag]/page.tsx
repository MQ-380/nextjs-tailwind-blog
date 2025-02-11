import tagData from 'app/tag-data.json';
import { allPosts } from 'contentlayer/generated';
import { slug } from 'github-slugger';
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js';

import TagsListLayout from '@/layouts/TagsListLayout';

const POSTS_PER_PAGE = 10;

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>;
  return Object.keys(tagCounts).flatMap((tag) => {
    const postCount = tagCounts[tag];
    const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));
    return Array.from({ length: totalPages }, (_, i) => ({
      tag: encodeURI(tag),
      page: (i + 1).toString(),
    }));
  });
};

export default async function TagPage(props: { params: Promise<{ tag: string; page: string }> }) {
  const params = await props.params;
  const tag = decodeURI(params.tag);
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1);
  const filteredPosts = allCoreContent(
    sortPosts(allPosts.filter((post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)))
  );

  return <TagsListLayout posts={filteredPosts} title={title} />;
}
