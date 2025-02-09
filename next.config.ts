import type { NextConfig } from 'next'

import withBundleAnalyzer from '@next/bundle-analyzer'
import { withContentlayer } from 'next-contentlayer2'

const output = process.env.EXPORT ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
const unoptimized = process.env.UNOPTIMIZED ? true : undefined

const nextConfig: NextConfig = {
  output,
  basePath,
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  eslint: {
    dirs: ['app', 'components', 'layouts', 'scripts'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    unoptimized,
  },
  // 添加 Turbopack 配置
  experimental: {
    turbo: {
      rules: {
        // 添加你需要的 loader 配置
        '.md': ['raw-loader'],
        '.mdx': ['@mdx-js/loader'],
      },
      resolveAlias: {
        // 如果需要添加别名配置
      },
    },
  },
}

const bundleAnalyzerConfig = {
  enabled: process.env.ANALYZE === 'true',
}

export default withContentlayer(withBundleAnalyzer(bundleAnalyzerConfig)(nextConfig))
