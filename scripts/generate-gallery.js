import fs from 'fs/promises';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';

import airlinesConfig from '../data/airlines.json' with { type: 'json' };
import airportsConfig from '../data/airports.json' with { type: 'json' };
import { GALLERY_DIR, INDEXABLE_EXT } from './gallery-config.js';
import { writeIconIndex } from './icon-index.mjs';

/**
 * schema 的 lookup 指向的查找表。文件名里写短代码，这里换成展示用的全称：
 * `UA_B757-200_IAD_N41135.jpg` 的航司段 UA 会变成 United Airlines。
 * 代码改名时只改 data/airlines.json，不用重命名照片。
 */
const LOOKUPS = {
  airlines: Object.fromEntries(
    Object.entries(airlinesConfig.airlines).map(([code, info]) => [code, info.name])
  ),
  airports: Object.fromEntries(
    Object.entries(airportsConfig.airports).map(([code, info]) => [code, info.name])
  ),
};

// 每张照片放在 public/static/images/gallery/<tag>/ 下，
// 文件夹名即为该照片的 tag（飞机 / 城市名 / 任意分类），支持中文文件夹名。
const OUTPUT_FILE = 'app/gallery-data.json';

/**
 * 读取分类目录下的 schema.json，声明文件名各段的字段名：
 *   ["航司", "机型", "机场", "注册号"]                       —— 全部字段都做筛选项
 *   { "fields": [...], "facets": ["航司", "机型"] }          —— 只有 facets 里的做筛选项，
 *                                                              其余字段仅在图注/大图里展示
 * 没有 schema.json 的目录不解析文件名，照片只归属于所在分类。
 */
async function readSchema(tagDir) {
  try {
    const raw = await fs.readFile(path.join(tagDir, 'schema.json'), 'utf8');
    const parsed = JSON.parse(raw);
    const fields = Array.isArray(parsed) ? parsed : parsed.fields;
    if (!Array.isArray(fields) || fields.length === 0) return null;
    const facets = Array.isArray(parsed.facets) ? parsed.facets : fields;
    return { fields, facets: new Set(facets), lookup: parsed.lookup ?? {} };
  } catch {
    return null;
  }
}

/**
 * 按 schema 把文件名逐段解析成字段。分隔符是下划线，段内允许空格和连字符，
 * 所以 `Aer Lingus_A321-200LR_IAD_EI-LRD.jpg` 能正确拆成四段。
 *
 * 末尾多出的纯数字段是「同一架飞机的第几张」——文件名必须唯一，而同一架机身
 * 迟早会拍到第二张（如 NH_B767-300_HND_JA614A_SA_2.jpg）。它只用于区分文件，
 * 不参与字段解析，也不算「多余段」。
 */
function parseFilename(filename, schema) {
  if (!schema) return { fields: {}, codes: {}, tags: [] };

  const base = filename.slice(0, filename.length - path.extname(filename).length);
  const segments = base.split('_').map((s) => s.trim());
  if (segments.length > schema.fields.length && /^\d+$/.test(segments[segments.length - 1])) {
    segments.pop();
  }

  const fields = {};
  const codes = {};
  const tags = [];
  const unresolved = [];

  schema.fields.forEach((name, i) => {
    const raw = segments[i];
    if (!raw) return;

    // 声明了 lookup 的字段：文件名里是代码，查表换成全称。
    // 查不到就原样保留代码，并记下来交由调用方提示补录。
    const table = schema.lookup[name] ? LOOKUPS[schema.lookup[name]] : null;
    if (table) {
      codes[name] = raw;
      if (!table[raw]) unresolved.push(`${name}=${raw}`);
    }
    const value = table?.[raw] ?? raw;

    fields[name] = value;
    // 只有 facets 里的字段进 tags，注册号这种每张都不同的放进来只会让筛选栏爆炸
    if (schema.facets.has(name)) tags.push(`${name}:${value}`);
  });

  return {
    fields,
    codes,
    tags,
    unresolved,
    extraSegments: segments.length - schema.fields.length,
  };
}

async function readCaptions(tagDir) {
  try {
    const raw = await fs.readFile(path.join(tagDir, 'captions.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function generateGallery() {
  let tagEntries;
  try {
    tagEntries = await fs.readdir(GALLERY_DIR, { withFileTypes: true });
  } catch {
    console.warn(`[generate-gallery] 目录不存在，跳过：${GALLERY_DIR}`);
    await fs.writeFile(OUTPUT_FILE, '[]\n');
    return;
  }

  const photos = [];

  for (const entry of tagEntries) {
    if (!entry.isDirectory()) continue;
    const tag = entry.name;
    const tagDir = path.join(GALLERY_DIR, tag);
    const [captions, schema] = await Promise.all([readCaptions(tagDir), readSchema(tagDir)]);

    const files = await fs.readdir(tagDir, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile()) continue;
      const ext = path.extname(file.name).toLowerCase();
      if (!INDEXABLE_EXT.has(ext)) continue;

      const filePath = path.join(tagDir, file.name);
      const [stat, dimensions] = await Promise.all([
        fs.stat(filePath),
        imageSizeFromFile(filePath),
      ]);

      const { fields, codes, tags, unresolved, extraSegments } = parseFilename(file.name, schema);
      if (unresolved.length > 0) {
        console.warn(
          `[generate-gallery] ${tag}/${file.name} 查不到 ${unresolved.join('、')}，` +
            `已按原值处理，请在 data/airlines.json 补录`
        );
      }
      if (extraSegments > 0) {
        console.warn(
          `[generate-gallery] ${tag}/${file.name} 比 schema 多了 ${extraSegments} 段，多出的部分已忽略`
        );
      }

      photos.push({
        id: `${tag}/${file.name}`,
        src: `/${filePath.replace(/^public\//, '')}`,
        tag,
        tags,
        fields,
        codes,
        caption: captions[file.name] ?? null,
        width: dimensions.width,
        height: dimensions.height,
        filename: file.name,
        mtime: stat.mtimeMs,
      });
    }
  }

  photos.sort((a, b) => b.mtime - a.mtime);
  // mtime 只用于排序，不需要输出给前端
  const output = photos.map((photo) => {
    const { id, src, tag, tags, fields, codes, caption, width, height, filename } = photo;
    return { id, src, tag, tags, fields, codes, caption, width, height, filename };
  });

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n');
  console.log(`[generate-gallery] 生成 ${output.length} 张照片 -> ${OUTPUT_FILE}`);

  await writeIconIndex();
}

generateGallery();
