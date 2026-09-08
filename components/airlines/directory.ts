import airlinesConfig from '@/data/airlines.json';

import type { GalleryPhoto } from '../gallery/types';

/** 航司字段在文件名 schema 里的名字，也是 tag 的前缀（`航司:United Airlines`） */
export const AIRLINE_FIELD = '航司';
/** 机型字段，用于在目录页列出该航司拍到过的机型 */
export const AIRCRAFT_FIELD = '机型';

export interface DirectoryAirline {
  /** IATA 二字码，同时是详情页地址和图标文件名 */
  code: string;
  /** 展示用全称，来自 data/airlines.json */
  name: string;
  photoCount: number;
  aircraft: string[];
  href: string;
  /** 图标路径，public/static/images/airlines/<code>.* 存在时才有 */
  icon: string | null;
}

export interface DirectoryAlliance {
  id: string;
  name: string;
  en: string;
  shot: DirectoryAirline[];
  /** 名单里但还没拍到的航司全称 */
  missing: string[];
  memberCount: number;
  photoCount: number;
}

export interface Directory {
  alliances: DirectoryAlliance[];
  /** 已确认不属于任何联盟、且已拍到的。没有全集，所以不做进度 */
  unaffiliated: DirectoryAirline[];
  /** 代码不在 data/airlines.json 里的——映射表漏了，需要补录 */
  unclassified: DirectoryAirline[];
  totals: { airlines: number; photos: number; airports: number };
}

type AirlineInfo = { name: string; alliance: string | null; domain: string };
const AIRLINES = airlinesConfig.airlines as Record<string, AirlineInfo>;

/** 详情页地址与图标文件名都用小写代码 */
export function airlineSlug(code: string): string {
  return code.toLowerCase();
}

export function airlineHref(code: string): string {
  return `/airlines/${airlineSlug(code)}`;
}

/**
 * @param icons 可用图标的 slug → 文件名。由调用方（服务端）扫描目录得到，
 *   这样这个模块不依赖 fs，也就不会把 Node API 拖进客户端包。
 */
export function buildDirectory(
  photos: GalleryPhoto[],
  icons: Record<string, string> = {}
): Directory {
  // 按 IATA 代码归拢照片
  const byCode = new Map<string, GalleryPhoto[]>();
  const airports = new Set<string>();

  photos.forEach((photo) => {
    if (photo.fields['机场']) airports.add(photo.fields['机场']);
    const code = photo.codes?.[AIRLINE_FIELD];
    if (!code) return;
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code)!.push(photo);
  });

  const toAirline = (code: string): DirectoryAirline => {
    const matched = byCode.get(code)!;
    const aircraft = Array.from(
      new Set(matched.map((p) => p.fields[AIRCRAFT_FIELD]).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    const iconFile = icons[airlineSlug(code)];
    return {
      code,
      // 查不到代码时退回照片里的原值，这类航司会进「未分类」组
      name: AIRLINES[code]?.name ?? matched[0].fields[AIRLINE_FIELD] ?? code,
      photoCount: matched.length,
      aircraft,
      href: airlineHref(code),
      icon: iconFile ? `/static/images/airlines/${iconFile}` : null,
    };
  };

  const byCount = (a: DirectoryAirline, b: DirectoryAirline) =>
    b.photoCount - a.photoCount || a.name.localeCompare(b.name);

  const alliances: DirectoryAlliance[] = airlinesConfig.alliances.map((alliance) => {
    // 成员名单由 airlines 表按 alliance 分组得出，不再单独维护一份
    const members = Object.entries(AIRLINES).filter(([, info]) => info.alliance === alliance.id);
    const shot = members
      .filter(([code]) => byCode.has(code))
      .map(([code]) => toAirline(code))
      .sort(byCount);
    const missing = members
      .filter(([code]) => !byCode.has(code))
      .map(([, info]) => info.name)
      .sort((a, b) => a.localeCompare(b));

    return {
      id: alliance.id,
      name: alliance.name,
      en: alliance.en,
      shot,
      missing,
      memberCount: members.length,
      photoCount: shot.reduce((sum, a) => sum + a.photoCount, 0),
    };
  });

  const codes = Array.from(byCode.keys());

  return {
    alliances,
    // 已确认不属于任何联盟（alliance: null），和代码根本不在表里的，必须分开：
    // 混在一起的话，新航司会被静默归进无联盟组，自动分类就失灵了。
    unaffiliated: codes
      .filter((code) => AIRLINES[code]?.alliance === null)
      .map(toAirline)
      .sort(byCount),
    unclassified: codes
      .filter((code) => !AIRLINES[code])
      .map(toAirline)
      .sort(byCount),
    totals: {
      airlines: byCode.size,
      photos: Array.from(byCode.values()).reduce((sum, list) => sum + list.length, 0),
      airports: airports.size,
    },
  };
}
