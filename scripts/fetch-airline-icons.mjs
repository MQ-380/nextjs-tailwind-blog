import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

import airlinesConfig from '../data/airlines.json' with { type: 'json' };
import galleryData from '../app/gallery-data.json' with { type: 'json' };

// 抓取航司官网 favicon 作为目录页的图标。
//
//   node scripts/fetch-airline-icons.mjs          只抓已经拍到的航司
//   node scripts/fetch-airline-icons.mjs --all    抓名单里的全部 63 家
//
// 已存在的文件不会被覆盖，手动换上更好的图之后重跑不会被冲掉。
// favicon 质量参差（有的只有 16x16、有的深色 logo 配透明底），跑完请看一眼
// 生成的对比图，难看的那几家建议从航司官方 media kit 手动替换。
const ICON_DIR = 'public/static/images/airlines';
const OUTPUT_SIZE = 64;
/** 源图小于这个尺寸的，放大到 64 会糊，值得提醒 */
const LOW_RES_BELOW = 32;

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** 名单里出现过的全部航司名（含别名，用于和照片里的写法对上） */
function rosterNames() {
  const names = [];
  airlinesConfig.alliances.forEach((alliance) =>
    alliance.members.forEach((member) =>
      names.push(typeof member === 'string' ? member : member.name)
    )
  );
  return names.concat(airlinesConfig.unaffiliated);
}

/** 照片里出现过的航司，映射回名单里的正式名 */
function shotNames() {
  const norm = (s) => s.toLowerCase().replace(/[\s\-_.]/g, '');
  const shot = new Set(
    galleryData.map((photo) => photo.fields?.['航司']).filter(Boolean).map(norm)
  );

  const matched = [];
  airlinesConfig.alliances.forEach((alliance) =>
    alliance.members.forEach((member) => {
      const name = typeof member === 'string' ? member : member.name;
      const aliases = typeof member === 'string' ? [] : (member.aliases ?? []);
      if ([name, ...aliases].some((n) => shot.has(norm(n)))) matched.push(name);
    })
  );
  airlinesConfig.unaffiliated.forEach((name) => {
    if (shot.has(norm(name))) matched.push(name);
  });
  return matched;
}

async function fetchIcon(domain) {
  const url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const all = process.argv.includes('--all');
  const targets = all ? rosterNames() : shotNames();

  await fs.mkdir(ICON_DIR, { recursive: true });
  const existing = new Set(
    (await fs.readdir(ICON_DIR)).map((file) => path.basename(file, path.extname(file)))
  );

  const saved = [];
  const lowRes = [];
  let skipped = 0;

  for (const name of targets) {
    const key = slug(name);
    if (existing.has(key)) {
      skipped += 1;
      continue;
    }

    const domain = airlinesConfig.domains[name];
    if (!domain) {
      console.warn(`  ${name.padEnd(24)} 跳过：data/airlines.json 的 domains 里没有域名`);
      continue;
    }

    try {
      const buffer = await fetchIcon(domain);
      const meta = await sharp(buffer).metadata();
      // 统一成 64x64 PNG、透明底，源图小的居中不放大糊
      await sharp(buffer)
        .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(ICON_DIR, `${key}.png`));

      const source = `${meta.width}x${meta.height}`;
      saved.push({ name, domain, source });
      if (Math.min(meta.width, meta.height) < LOW_RES_BELOW) lowRes.push({ name, source });
      console.log(`  ${name.padEnd(24)} ${domain.padEnd(24)} 源图 ${source}`);
    } catch (error) {
      console.warn(`  ${name.padEnd(24)} 抓取失败：${error.message}`);
    }
  }

  console.log(
    `\n[fetch-airline-icons] 新增 ${saved.length} 个，跳过 ${skipped} 个已存在的` +
      (all ? '' : `（只处理已拍到的航司，加 --all 抓全部 ${rosterNames().length} 家）`)
  );

  if (lowRes.length > 0) {
    console.warn(
      `\n以下 ${lowRes.length} 家的源图偏小，放大后可能发糊，建议从航司官方 media kit 手动替换：`
    );
    lowRes.forEach(({ name, source }) => console.warn(`  ${name}（${source}）`));
  }
}

main();
