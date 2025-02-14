import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import 'katex/dist/katex.css';
import { MDXLayoutRenderer } from 'pliny/mdx-components.js';
import { allCoreContent, coreContent, sortPosts } from 'pliny/utils/contentlayer.js';

import { components } from '@/components/posts/MDXComponents';

import siteMetadata from '@/data/siteMetadata';

import { Post, allPosts } from '@/.contentlayer/generated';
import '@/css/post.css';
import '@/css/prism.css';
import PostBanner from '@/layouts/PostBanner';
import PostLayout from '@/layouts/PostLayout';
import PostSimple from '@/layouts/PostSimple';

const defaultLayout = 'PostLayout' as const;
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
} as const;
type LayoutKeys = keyof typeof layouts;

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  const slug = decodeURI(params.slug.join('/'));

  const sortedCoreContents = allCoreContent(sortPosts(allPosts));

  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug);

  if (postIndex === -1) {
    return notFound();
  }

  const prev = sortedCoreContents[postIndex + 1];
  const next = sortedCoreContents[postIndex - 1];

  const post = allPosts.find((p) => p.slug === slug) as Post;
  const mainContent = coreContent(post);
  // Fix for the existed posts.
  const postLayout = post.layout === 'post' ? defaultLayout : post.layout;
  const Layout = layouts[(postLayout || defaultLayout) as LayoutKeys];

  return (
    <div className="article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(post.structuredData),
        }}
      />
      <Layout content={mainContent} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </div>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const slug = decodeURI(params.slug.join('/'));
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) {
    return;
  }

  const publishedAt = new Date(post.date).toISOString();
  const modifiedAt = new Date(post.lastmod || post.date).toISOString();
  let imageList = [siteMetadata.socialBanner];
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images;
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    };
  });

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  };
}
