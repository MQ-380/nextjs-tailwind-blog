import SectionContainer from '@/components/SectionContainer';
import { buildDirectory } from '@/components/airlines/directory';
import { buildAirportDirectory } from '@/components/airports/directory';
import type { GalleryPhoto } from '@/components/gallery/types';
import EntryRow from '@/components/hangar/EntryRow';
import HangarLayout, { Grid, GroupHeader } from '@/components/hangar/HangarLayout';
import PageTitle from '@/components/posts/PageTitle';

import airlineIcons from '@/app/airline-icons.json';
import galleryData from '@/app/gallery-data.json';

export const metadata = {
  title: 'Izumi的机库 · 按机场',
};

export default function AirportsPage() {
  const photos = galleryData as GalleryPhoto[];
  const directory = buildAirportDirectory(photos);
  const airlines = buildDirectory(photos, airlineIcons);

  if (directory.totals.airports === 0) {
    return (
      <SectionContainer>
        <div className="space-y-6 pt-6 pb-8">
          <PageTitle>Izumi的机库</PageTitle>
          <p className="text-gray-500 dark:text-gray-400">还没有带机场信息的照片。</p>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <HangarLayout
        view="airport"
        stats={{
          airlines: airlines.totals.airlines,
          photos: airlines.totals.photos,
          airports: directory.totals.airports,
        }}
      >
        {directory.regions.map((region) => (
          <section key={region.id} className="pt-8">
            <GroupHeader
              title={region.name}
              meta={`${region.airports.length} 个 · ${region.photoCount} 张`}
            />
            <Grid>
              {region.airports.map((airport) => (
                <EntryRow
                  key={airport.code}
                  entry={{
                    code: airport.code,
                    name: airport.name,
                    subtitle: airport.city,
                    chips: airport.airlines,
                    photoCount: airport.photoCount,
                    href: airport.href,
                    showCode: true,
                  }}
                />
              ))}
            </Grid>
          </section>
        ))}

        {directory.unclassified.length > 0 && (
          <section className="pt-8">
            <GroupHeader
              title="未分类"
              accent
              note="这些机场不在 data/airports.json 里，补上所在大洲后会自动归位"
              meta={`${directory.unclassified.length} 个`}
            />
            <Grid>
              {directory.unclassified.map((airport) => (
                <EntryRow
                  key={airport.code}
                  unclassified
                  entry={{
                    code: airport.code,
                    name: airport.name,
                    subtitle: airport.city,
                    chips: airport.airlines,
                    photoCount: airport.photoCount,
                    href: airport.href,
                    showCode: true,
                  }}
                />
              ))}
            </Grid>
          </section>
        )}
      </HangarLayout>
    </SectionContainer>
  );
}
