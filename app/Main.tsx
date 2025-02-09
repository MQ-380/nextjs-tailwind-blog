import { CoreContent } from 'pliny/utils/contentlayer.js'

import { Post } from '@/.contentlayer/generated'

interface MainProps {
  posts: CoreContent<Post>[]
}

export function Main({ posts }: MainProps) {
  return <div />
}
