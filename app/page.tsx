import { allPosts } from "@/.contentlayer/generated";
import { allCoreContent, sortPosts } from "pliny/utils/contentlayer.js";
import { Main } from "./Main";

export default async function Page() {
  const sortedPosts = sortPosts(allPosts);
  const posts = allCoreContent(sortedPosts);
  return <Main posts={posts} />
}