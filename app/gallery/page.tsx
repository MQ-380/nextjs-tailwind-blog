import SectionContainer from '@/components/SectionContainer';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import PageTitle from '@/components/posts/PageTitle';

import galleryData from '@/app/gallery-data.json';

export const metadata = {
  title: '相册',
};

export default function GalleryPage() {
  return (
    <SectionContainer>
      <div className="space-y-6 pt-6 pb-8">
        <PageTitle>相册</PageTitle>
        <GalleryGrid photos={galleryData} />
      </div>
    </SectionContainer>
  );
}
