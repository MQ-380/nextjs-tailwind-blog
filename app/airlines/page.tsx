import Link from 'next/link';

import fs from 'fs';
import path from 'path';

import SectionContainer from '@/components/SectionContainer';
import { buildDirectory } from '@/components/airlines/directory';
import { buildAirportDirectory } from '@/components/airports/directory';
import type { GalleryPhoto } from '@/components/gallery/types';
import EntryRow from '@/components/hangar/EntryRow';
import MissingList from '@/components/hangar/MissingList';
import PageTitle from '@/components/posts/PageTitle';

import galleryData from '@/app/gallery-data.json';

export const metadata = {
  title: 'Izumi的机库',
};

const ICON_DIR = 'public/static/images/airlines';

/**
 * 扫描图标目录，得到 code → 文件名。放在页面（服务端组件）里做，
 * directory.ts 就不必依赖 fs，也就不会被拖进客户端包。
 */
function readIcons(): Record<string, string> {
  try {
    return Object.fromEntries(
      fs
        .readdirSync(ICON_DIR)
        .filter((file) => /\.(png|jpe?g|svg|webp)$/i.test(file))
        .map((file) => [path.basename(file, path.extname(file)).toLowerCase(), file])
    );
  } catch {
    return {};
  }
}

export default async function HangarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const byAirport = view === 'airport';
  const photos = galleryData as GalleryPhoto[];

  const airlines = buildDirectory(photos, readIcons());
  const airports = buildAirportDirectory(photos);

  if (airlines.totals.airlines === 0) {
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
      <div className="pt-6 pb-16">
        <div className="flex flex-col gap-6 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <PageTitle>Izumi的机库</PageTitle>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
              欢迎来到我的飞机相片基地
            </p>
          </div>
          <dl className="flex shrink-0 gap-7 sm:pb-1.5">
            <Stat value={airlines.totals.airlines} label="航司" />
            <Stat value={airlines.totals.photos} label="照片" />
            <Stat value={airports.totals.airports} label="机场" />
          </dl>
        </div>

        {/* 视角切换。用链接而非客户端状态：服务端直出、无 JS 也能用，
            而且 /airlines?view=airport 本身就是可分享的地址。 */}
        <div className="flex gap-1 pt-6">
          <ViewTab href="/airlines" active={!byAirport}>
            按航司
          </ViewTab>
          <ViewTab href="/airlines?view=airport" active={byAirport}>
            按机场
          </ViewTab>
        </div>

        {byAirport ? (
          <>
            {airports.regions.map((region) => (
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

            {airports.unclassified.length > 0 && (
              <section className="pt-8">
                <GroupHeader
                  title="未分类"
                  accent
                  note="这些机场不在 data/airports.json 里，补上地区后会自动归位"
                  meta={`${airports.unclassified.length} 个`}
                />
                <Grid>
                  {airports.unclassified.map((airport) => (
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
          </>
        ) : (
          <>
            {airlines.alliances.map((alliance) => (
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

            {airlines.unaffiliated.length > 0 && (
              <section className="pt-8">
                <GroupHeader
                  title="无联盟"
                  en="Unaffiliated"
                  muted
                  meta={`${airlines.unaffiliated.length} 家 · ${airlines.unaffiliated.reduce(
                    (n, a) => n + a.photoCount,
                    0
                  )} 张`}
                />
                <Grid>
                  {airlines.unaffiliated.map((airline) => (
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

            {airlines.unclassified.length > 0 && (
              <section className="pt-8">
                <GroupHeader
                  title="未分类"
                  accent
                  note="这些航司不在 data/airlines.json 里，补上联盟归属后会自动归位"
                  meta={`${airlines.unclassified.length} 家`}
                />
                <Grid>
                  {airlines.unclassified.map((airline) => (
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
          </>
        )}
      </div>
    </SectionContainer>
  );
}

function ViewTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
        active
          ? 'bg-primary-500 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

function GroupHeader({
  title,
  en,
  meta,
  note,
  progress,
  muted,
  accent,
}: {
  title: string;
  en?: string;
  meta: string;
  note?: string;
  progress?: number;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="border-b border-gray-200 pb-2.5 dark:border-gray-800">
      <div className="flex items-baseline gap-3">
        <h2
          className={`text-lg font-bold ${
            accent
              ? 'text-primary-500'
              : muted
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {title}
        </h2>
        {en && (
          <span className="font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-gray-500">
            {en}
          </span>
        )}
        {note && <span className="text-xs text-gray-500 dark:text-gray-500">{note}</span>}
        <span className="ml-auto font-mono text-[13px] text-gray-600 dark:text-gray-400">
          {meta}
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-2 h-0.5 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-gray-400 dark:bg-gray-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-10 pt-1 lg:grid-cols-2">{children}</div>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-left sm:text-right">
      <dd className="font-mono text-[28px] leading-none font-medium text-gray-900 dark:text-gray-100">
        {value}
      </dd>
      <dt className="mt-1.5 text-xs tracking-wide text-gray-500 uppercase dark:text-gray-500">
        {label}
      </dt>
    </div>
  );
}
