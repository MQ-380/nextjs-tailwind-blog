import fs from 'fs/promises';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';

import { GALLERY_DIR, INDEXABLE_EXT } from './gallery-config.js';

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
    return { fields, facets: new Set(facets) };
  } catch {
    return null;
  }
}

/**
 * 按 schema 把文件名逐段解析成字段。分隔符是下划线，段内允许空格和连字符，
 * 所以 `Aer Lingus_A321-200LR_IAD_EI-LRD.jpg` 能正确拆成四段。
 */
function parseFilename(filename, schema) {
  if (!schema) return { fields: {}, tags: [] };

  const base = filename.slice(0, filename.length - path.extname(filename).length);
  const segments = base.split('_').map((s) => s.trim());

  const fields = {};
  const tags = [];
  schema.fields.forEach((name, i) => {
    const value = segments[i];
    if (!value) return;
    fields[name] = value;
    // 只有 facets 里的字段进 tags，注册号这种每张都不同的放进来只会让筛选栏爆炸
    if (schema.facets.has(name)) tags.push(`${name}:${value}`);
  });

  return { fields, tags, extraSegments: segments.length - schema.fields.length };
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

      const { fields, tags, extraSegments } = parseFilename(file.name, schema);
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
    const { id, src, tag, tags, fields, caption, width, height, filename } = photo;
    return { id, src, tag, tags, fields, caption, width, height, filename };
  });

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n');
  console.log(`[generate-gallery] 生成 ${output.length} 张照片 -> ${OUTPUT_FILE}`);
}

generateGallery();
