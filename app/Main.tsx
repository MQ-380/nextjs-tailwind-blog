import { Post } from "@/.contentlayer/generated"
import { CoreContent } from "pliny/utils/contentlayer.js";

interface MainProps {
  posts: CoreContent<Post>[];
}

export function Main ({posts}: MainProps) {
  return <div />
}