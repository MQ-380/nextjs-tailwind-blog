import fs from 'fs/promises';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';

import { GALLERY_DIR, INDEXABLE_EXT } from './gallery-config.js';

// 每张照片放在 public/static/images/gallery/<tag>/ 下，
// 文件夹名即为该照片的 tag（飞机 / 城市名 / 任意分类），支持中文文件夹名。
const OUTPUT_FILE = 'app/gallery-data.json';

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
    const captions = await readCaptions(tagDir);

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

      photos.push({
        id: `${tag}/${file.name}`,
        src: `/${filePath.replace(/^public\//, '')}`,
        tag,
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
    const { id, src, tag, caption, width, height, filename } = photo;
    return { id, src, tag, caption, width, height, filename };
  });

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n');
  console.log(`[generate-gallery] 生成 ${output.length} 张照片 -> ${OUTPUT_FILE}`);
}

generateGallery();
