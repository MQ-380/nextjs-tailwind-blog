import type { NextConfig } from 'next'

import withBundleAnalyzer from '@next/bundle-analyzer'
import { withContentlayer } from 'next-contentlayer2'

const output = process.env.EXPORT ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
const unoptimized = process.env.UNOPTIMIZED ? true : undefined
// 允许把构建产物输出到别的目录。next dev 和 next build 共用 .next 但产物结构不同，
// 开发服务器运行时跑生产构建会把它依赖的 manifest 覆盖掉，页面报
// "missing required error components"。用 npm run build:check 验证构建即可避开。
const distDir = process.env.DIST_DIR || undefined

const nextConfig: NextConfig = {
  output,
  basePath,
  distDir,
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
