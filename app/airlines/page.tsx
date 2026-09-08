import fs from 'fs';
import path from 'path';

import SectionContainer from '@/components/SectionContainer';
import AirlineRow from '@/components/airlines/AirlineRow';
import MissingAirlines from '@/components/airlines/MissingAirlines';
import { buildDirectory } from '@/components/airlines/directory';
import type { GalleryPhoto } from '@/components/gallery/types';
import PageTitle from '@/components/posts/PageTitle';

import galleryData from '@/app/gallery-data.json';

export const metadata = {
  title: '航司目录',
};

const ICON_DIR = 'public/static/images/airlines';

/**
 * 扫描图标目录，得到 slug → 文件名。放在页面（服务端组件）里做，
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

export default function AirlinesPage() {
  const directory = buildDirectory(galleryData as GalleryPhoto[], readIcons());
  const { alliances, unaffiliated, unclassified, totals } = directory;

  if (totals.airlines === 0) {
    return (
      <SectionContainer>
        <div className="space-y-6 pt-6 pb-8">
          <PageTitle>航司目录</PageTitle>
          <p className="text-gray-500 dark:text-gray-400">
            还没有带航司信息的照片。给 planes 目录配好 schema.json 后，这里会自动按联盟汇总。
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
            <PageTitle>航司目录</PageTitle>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
              按所属联盟汇总拍到的航空公司。点任意一行进入相册，自动筛选出该航司的全部照片。
            </p>
          </div>
          <dl className="flex shrink-0 gap-7 sm:pb-1.5">
            <Stat value={totals.airlines} label="航司" />
            <Stat value={totals.photos} label="照片" />
            <Stat value={totals.airports} label="机场" />
          </dl>
        </div>

        {alliances.map((alliance) => (
          <section key={alliance.id} className="pt-9">
            <div className="border-b border-gray-200 pb-2.5 dark:border-gray-800">
              <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {alliance.name}
                </h2>
                <span className="font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-gray-500">
                  {alliance.en}
                </span>
                <span className="ml-auto font-mono text-[13px] text-gray-600 dark:text-gray-400">
                  {alliance.shot.length} / {alliance.memberCount} · {alliance.photoCount} 张
                </span>
              </div>
              <div className="mt-2 h-0.5 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full bg-gray-400 dark:bg-gray-500"
                  style={{ width: `${(alliance.shot.length / alliance.memberCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-10 pt-1 lg:grid-cols-2">
              {alliance.shot.map((airline) => (
                <AirlineRow key={airline.name} airline={airline} />
              ))}
            </div>

            <MissingAirlines names={alliance.missing} />
          </section>
        ))}

        {unaffiliated.length > 0 && (
          <section className="pt-9">
            <div className="flex items-baseline gap-3 border-b border-gray-200 pb-2.5 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-600 dark:text-gray-400">无联盟</h2>
              <span className="font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-gray-500">
                Unaffiliated
              </span>
              <span className="ml-auto font-mono text-[13px] text-gray-600 dark:text-gray-400">
                {unaffiliated.length} 家 · {unaffiliated.reduce((n, a) => n + a.photoCount, 0)} 张
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-10 pt-1 lg:grid-cols-2">
              {unaffiliated.map((airline) => (
                <AirlineRow key={airline.name} airline={airline} />
              ))}
            </div>
          </section>
        )}

        {unclassified.length > 0 && (
          <section className="pt-9">
            <div className="flex items-baseline gap-3 border-b border-gray-200 pb-2.5 dark:border-gray-800">
              <h2 className="text-primary-500 text-lg font-bold">未分类</h2>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                这些航司不在 data/airlines.json 里，补上联盟归属后会自动归位
              </span>
              <span className="ml-auto font-mono text-[13px] text-gray-600 dark:text-gray-400">
                {unclassified.length} 家
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-10 pt-1 lg:grid-cols-2">
              {unclassified.map((airline) => (
                <AirlineRow key={airline.name} airline={airline} unclassified />
              ))}
            </div>
          </section>
        )}
      </div>
    </SectionContainer>
  );
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
