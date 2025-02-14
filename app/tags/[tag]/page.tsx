import tagData from 'app/tag-data.json';
import { allPosts } from 'contentlayer/generated';
import { slug } from 'github-slugger';
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js';

import TagsListLayout from '@/layouts/TagsListLayout';

const POSTS_PER_PAGE = 10;

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, { count: number; id: string }>;
  return Object.values(tagCounts).flatMap(({ count, id }) => {
    const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));
    return Array.from({ length: totalPages }, (_, i) => ({
      tag: encodeURI(id),
      page: (i + 1).toString(),
    }));
  });
};

export default async function TagPage(props: { params: Promise<{ tag: string; page: string }> }) {
  const params = await props.params;
  const tagId = decodeURI(params.tag);
  const title = Object.entries(tagData).find(([, { id }]) => id === tagId)![0];
  const filteredPosts = allCoreContent(
    sortPosts(allPosts.filter((post) => post.tags && post.tags.map((t) => slug(t)).includes(title)))
  );

  return <TagsListLayout posts={filteredPosts} title={title} />;
}
