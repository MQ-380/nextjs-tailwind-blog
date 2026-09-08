import airlinesConfig from '@/data/airlines.json';

import type { GalleryPhoto } from '../gallery/types';

/** 航司字段在文件名 schema 里的名字，也是 tag 的前缀（`航司:United`） */
export const AIRLINE_FIELD = '航司';
/** 机型字段，用于在目录页列出该航司拍到过的机型 */
export const AIRCRAFT_FIELD = '机型';

export interface DirectoryAirline {
  /** 展示名。拍到过的用照片里的写法，没拍到的用名单里的写法 */
  name: string;
  photoCount: number;
  aircraft: string[];
  /** 该航司的详情页地址，没拍到的为 null */
  href: string | null;
  /** 图标路径，public/static/images/airlines/<slug>.* 存在时才有 */
  icon: string | null;
}

/** 航司名 → 图标文件名。`Aer Lingus` → `aer-lingus` */
export function airlineSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface DirectoryAlliance {
  id: string;
  name: string;
  en: string;
  shot: DirectoryAirline[];
  /** 名单里但还没拍到的航司名 */
  missing: string[];
  memberCount: number;
  photoCount: number;
}

export interface Directory {
  alliances: DirectoryAlliance[];
  /** 不属于任何联盟、且已拍到的航司。没有全集，所以不做进度 */
  unaffiliated: DirectoryAirline[];
  /** 拍到了但不在任何名单里的航司——映射表漏了，需要补录 */
  unclassified: DirectoryAirline[];
  totals: { airlines: number; photos: number; airports: number };
}

type RawMember = string | { name: string; aliases?: string[] };

/** 匹配时忽略大小写、空格和连字符，让 `Aer Lingus` 和 `aerlingus` 等价 */
function normalize(name: string): string {
  return name.toLowerCase().replace(/[\s\-_.]/g, '');
}

function memberName(member: RawMember): string {
  return typeof member === 'string' ? member : member.name;
}

function memberKeys(member: RawMember): string[] {
  const names = typeof member === 'string' ? [member] : [member.name, ...(member.aliases ?? [])];
  return names.map(normalize);
}

/** 航司详情页的地址。/gallery?tag=… 那种筛选链接仍然可用，只是不再从目录页进入 */
export function airlineHref(name: string): string {
  return `/airlines/${airlineSlug(name)}`;
}

/**
 * @param icons 可用图标的 slug → 文件名。由调用方（服务端）扫描目录得到，
 *   这样这个模块不依赖 fs，也就不会把 Node API 拖进客户端包。
 */
export function buildDirectory(
  photos: GalleryPhoto[],
  icons: Record<string, string> = {}
): Directory {
  // 照片里写 `Qatar`，名单里是 `Qatar Airways`，图标文件按名单命名。
  // 两个名字都试一遍，别名写法才不会漏掉图标。
  const iconFor = (...names: (string | undefined)[]) => {
    for (const name of names) {
      if (!name) continue;
      const file = icons[airlineSlug(name)];
      if (file) return `/static/images/airlines/${file}`;
    }
    return null;
  };

  // 先按航司归拢照片
  const byAirline = new Map<string, { name: string; photos: GalleryPhoto[] }>();
  const airports = new Set<string>();

  photos.forEach((photo) => {
    const airline = photo.fields[AIRLINE_FIELD];
    if (photo.fields['机场']) airports.add(photo.fields['机场']);
    if (!airline) return;
    const key = normalize(airline);
    if (!byAirline.has(key)) byAirline.set(key, { name: airline, photos: [] });
    byAirline.get(key)!.photos.push(photo);
  });

  const toAirline = (key: string, canonicalName?: string): DirectoryAirline => {
    const entry = byAirline.get(key)!;
    const aircraft = Array.from(
      new Set(entry.photos.map((p) => p.fields[AIRCRAFT_FIELD]).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return {
      name: entry.name,
      photoCount: entry.photos.length,
      aircraft,
      href: airlineHref(entry.name),
      icon: iconFor(canonicalName, entry.name),
    };
  };

  const claimed = new Set<string>();

  const alliances: DirectoryAlliance[] = airlinesConfig.alliances.map((alliance) => {
    const members = alliance.members as RawMember[];
    const shot: DirectoryAirline[] = [];
    const missing: string[] = [];

    members.forEach((member) => {
      const hit = memberKeys(member).find((key) => byAirline.has(key));
      if (hit) {
        claimed.add(hit);
        shot.push(toAirline(hit, memberName(member)));
      } else {
        missing.push(memberName(member));
      }
    });

    shot.sort((a, b) => b.photoCount - a.photoCount || a.name.localeCompare(b.name));

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

  // 已确认不属于任何联盟的，和映射表还没覆盖到的，必须分开：
  // 混在一起的话，新拍到的航司会被静默归进无联盟组，自动分类就失灵了。
  const confirmedUnaffiliated = new Set((airlinesConfig.unaffiliated as string[]).map(normalize));
  const byCount = (a: DirectoryAirline, b: DirectoryAirline) =>
    b.photoCount - a.photoCount || a.name.localeCompare(b.name);

  const rest = Array.from(byAirline.keys()).filter((key) => !claimed.has(key));

  return {
    alliances,
    unaffiliated: rest
      .filter((key) => confirmedUnaffiliated.has(key))
      .map((key) => toAirline(key))
      .sort(byCount),
    unclassified: rest
      .filter((key) => !confirmedUnaffiliated.has(key))
      .map((key) => toAirline(key))
      .sort(byCount),
    totals: {
      airlines: byAirline.size,
      photos: photos.filter((p) => p.fields[AIRLINE_FIELD]).length,
      airports: airports.size,
    },
  };
}
