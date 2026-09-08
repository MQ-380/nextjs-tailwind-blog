import { Suspense } from 'react';

import SectionContainer from '@/components/SectionContainer';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import type { GalleryPhoto } from '@/components/gallery/types';
import PageTitle from '@/components/posts/PageTitle';

// 断言类型：TS 会把 JSON 推成字面量，照片有的带彩绘字段、有的不带，
// 推出来的联合类型里 `彩绘?: undefined` 不满足 Record<string, string>。
// 形状由 generate-gallery.js 保证，与 Tag.tsx 读 tag-data.json 的写法一致。
import galleryData from '@/app/gallery-data.json';

export const metadata = {
  title: '相册',
};

export default function GalleryPage() {
  return (
    <SectionContainer>
      <div className="space-y-6 pt-6 pb-8">
        <PageTitle>相册</PageTitle>
        {/* GalleryGrid 用 useSearchParams 从 URL 还原筛选状态，静态生成时必须包 Suspense */}
        <Suspense fallback={null}>
          <GalleryGrid photos={galleryData as GalleryPhoto[]} />
        </Suspense>
      </div>
    </SectionContainer>
  );
}
