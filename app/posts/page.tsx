import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js';

import { allPosts } from '@/.contentlayer/generated';
import ListLayout from '@/layouts/ListLayout';

export default async function BlogPage() {
  const posts = allCoreContent(sortPosts(allPosts));

  return <ListLayout posts={posts} title="All Posts" />;
}
