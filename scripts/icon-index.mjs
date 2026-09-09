import fs from 'fs/promises';
import path from 'path';

const ICON_DIR = 'public/static/images/airlines';
const OUTPUT_FILE = 'app/airline-icons.json';

/**
 * 把可用的航司图标扫成一份清单供页面 import。
 *
 * 页面不在渲染时读文件系统——那样一旦页面变成动态渲染，Vercel 的函数环境里
 * 没有 public/ 目录，读取会失败且难以察觉（曾导致线上图标整体消失）。
 *
 * generate-gallery 和 fetch-airline-icons 都会调用它，所以两个脚本无论谁先跑，
 * 索引都不会过期。
 */
export async function writeIconIndex({ quiet = false } = {}) {
  let files = [];
  try {
    files = await fs.readdir(ICON_DIR);
  } catch {
    if (!quiet) console.warn(`[icon-index] 图标目录不存在，跳过：${ICON_DIR}`);
  }

  const icons = Object.fromEntries(
    files
      .filter((file) => /\.(png|jpe?g|svg|webp)$/i.test(file))
      .map((file) => [path.basename(file, path.extname(file)).toLowerCase(), file])
      .sort(([a], [b]) => a.localeCompare(b))
  );

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(icons, null, 2) + '\n');
  if (!quiet) {
    console.log(`[icon-index] 生成 ${Object.keys(icons).length} 个航司图标索引 -> ${OUTPUT_FILE}`);
  }
  return icons;
}
