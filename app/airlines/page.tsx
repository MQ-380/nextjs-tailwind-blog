import SectionContainer from '@/components/SectionContainer';
import { buildDirectory } from '@/components/airlines/directory';
import { buildAirportDirectory } from '@/components/airports/directory';
import type { GalleryPhoto } from '@/components/gallery/types';
import EntryRow from '@/components/hangar/EntryRow';
import HangarLayout, { Grid, GroupHeader } from '@/components/hangar/HangarLayout';
import MissingList from '@/components/hangar/MissingList';
import PageTitle from '@/components/posts/PageTitle';

import airlineIcons from '@/app/airline-icons.json';
import galleryData from '@/app/gallery-data.json';

export const metadata = {
  title: 'Izumi的机库',
};

export default function AirlinesPage() {
  const photos = galleryData as GalleryPhoto[];
  // 图标清单由 generate-gallery 在构建期扫出来，页面渲染时不读文件系统
  const directory = buildDirectory(photos, airlineIcons);
  const airports = buildAirportDirectory(photos);

  if (directory.totals.airlines === 0) {
    return (
      <SectionContainer>
        <div className="space-y-6 pt-6 pb-8">
          <PageTitle>Izumi的机库</PageTitle>
          <p className="text-gray-500 dark:text-gray-400">
            还没有带航司信息的照片。给 planes 目录配好 schema.json 后，这里会自动汇总。
          </p>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <HangarLayout
        view="airline"
        stats={{
          airlines: directory.totals.airlines,
          photos: directory.totals.photos,
          airports: airports.totals.airports,
        }}
      >
        {directory.alliances.map((alliance) => (
          <section key={alliance.id} className="pt-8">
            <GroupHeader
              title={alliance.name}
              en={alliance.en}
              meta={`${alliance.shot.length} / ${alliance.memberCount} · ${alliance.photoCount} 张`}
              progress={alliance.shot.length / alliance.memberCount}
            />
            <Grid>
              {alliance.shot.map((airline) => (
                <EntryRow
                  key={airline.code}
                  entry={{
                    code: airline.code,
                    name: airline.name,
                    chips: airline.aircraft,
                    photoCount: airline.photoCount,
                    href: airline.href,
                    icon: airline.icon,
                  }}
                />
              ))}
            </Grid>
            <MissingList names={alliance.missing} />
          </section>
        ))}

        {directory.unaffiliated.length > 0 && (
          <section className="pt-8">
            <GroupHeader
              title="无联盟"
              en="Unaffiliated"
              muted
              meta={`${directory.unaffiliated.length} 家 · ${directory.unaffiliated.reduce(
                (n, a) => n + a.photoCount,
                0
              )} 张`}
            />
            <Grid>
              {directory.unaffiliated.map((airline) => (
                <EntryRow
                  key={airline.code}
                  entry={{
                    code: airline.code,
                    name: airline.name,
                    chips: airline.aircraft,
                    photoCount: airline.photoCount,
                    href: airline.href,
                    icon: airline.icon,
                  }}
                />
              ))}
            </Grid>
          </section>
        )}

        {directory.unclassified.length > 0 && (
          <section className="pt-8">
            <GroupHeader
              title="未分类"
              accent
              note="这些航司不在 data/airlines.json 里，补上联盟归属后会自动归位"
              meta={`${directory.unclassified.length} 家`}
            />
            <Grid>
              {directory.unclassified.map((airline) => (
                <EntryRow
                  key={airline.code}
                  unclassified
                  entry={{
                    code: airline.code,
                    name: airline.name,
                    chips: airline.aircraft,
                    photoCount: airline.photoCount,
                    href: airline.href,
                    icon: airline.icon,
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
