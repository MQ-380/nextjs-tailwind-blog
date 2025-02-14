import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js';

import { unregister } from '@/components/serviceWorker';

import { allPosts } from '@/.contentlayer/generated';

import { Main } from './Main';

export default async function Page() {
  const sortedPosts = sortPosts(allPosts);
  const posts = allCoreContent(sortedPosts);
  unregister();
  return <Main posts={posts} />;
}
