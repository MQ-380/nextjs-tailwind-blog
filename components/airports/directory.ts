import airportsConfig from '@/data/airports.json';

import { AIRLINE_FIELD } from '../airlines/directory';
import type { GalleryPhoto } from '../gallery/types';

/** 机场字段在文件名 schema 里的名字 */
export const AIRPORT_FIELD = '机场';

export interface DirectoryAirport {
  /** IATA 三字码，同时是详情页地址 */
  code: string;
  /** 展示用全称，来自 data/airports.json */
  name: string;
  city: string | null;
  photoCount: number;
  /** 在这个机场拍到过的航司代码，作为行内的 chip */
  airlines: string[];
  href: string;
}

export interface DirectoryRegion {
  id: string;
  name: string;
  airports: DirectoryAirport[];
  photoCount: number;
}

export interface AirportDirectory {
  regions: DirectoryRegion[];
  /** 代码不在 data/airports.json 里的——映射表漏了，需要补录 */
  unclassified: DirectoryAirport[];
  totals: { airports: number; photos: number; airlines: number };
}

type AirportInfo = { name: string; en: string; city: string; region: string };
const AIRPORTS = airportsConfig.airports as Record<string, AirportInfo>;

export function airportHref(code: string): string {
  return `/airports/${code.toLowerCase()}`;
}

export function buildAirportDirectory(photos: GalleryPhoto[]): AirportDirectory {
  const byCode = new Map<string, GalleryPhoto[]>();
  const allAirlines = new Set<string>();

  photos.forEach((photo) => {
    const airline = photo.codes?.[AIRLINE_FIELD];
    if (airline) allAirlines.add(airline);
    const code = photo.codes?.[AIRPORT_FIELD];
    if (!code) return;
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code)!.push(photo);
  });

  const toAirport = (code: string): DirectoryAirport => {
    const matched = byCode.get(code)!;
    const airlines = Array.from(
      new Set(matched.map((p) => p.codes?.[AIRLINE_FIELD]).filter(Boolean))
    ).sort();
    return {
      code,
      // 查不到代码时退回代码本身，这类机场会进「未分类」组
      name: AIRPORTS[code]?.name ?? code,
      city: AIRPORTS[code]?.city ?? null,
      photoCount: matched.length,
      airlines,
      href: airportHref(code),
    };
  };

  const byCount = (a: DirectoryAirport, b: DirectoryAirport) =>
    b.photoCount - a.photoCount || a.code.localeCompare(b.code);

  const codes = Array.from(byCode.keys());

  // 机场没有「应该去过多少个」的分母，所以不做进度，也没有未拍到的灰名单
  const regions = airportsConfig.regions
    .map((region) => {
      const airports = codes
        .filter((code) => AIRPORTS[code]?.region === region.id)
        .map(toAirport)
        .sort(byCount);
      return {
        id: region.id,
        name: region.name,
        airports,
        photoCount: airports.reduce((sum, a) => sum + a.photoCount, 0),
      };
    })
    .filter((region) => region.airports.length > 0);

  return {
    regions,
    unclassified: codes
      .filter((code) => !AIRPORTS[code])
      .map(toAirport)
      .sort(byCount),
    totals: {
      airports: byCode.size,
      photos: Array.from(byCode.values()).reduce((sum, list) => sum + list.length, 0),
      airlines: allAirlines.size,
    },
  };
}
