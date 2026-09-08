import { execFileSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

import { COMPRESSIBLE_EXT, GALLERY_DIR, INDEXABLE_EXT } from './gallery-config.js';

// 就地压缩 public/static/images/gallery 下的照片：缩到合理尺寸、重新编码、剥掉 EXIF。
//
//   node scripts/compress-gallery.js            处理目录下全部照片
//   node scripts/compress-gallery.js --staged   只处理本次提交暂存的照片，压完自动重新暂存
//
// --staged 供 .githooks/pre-commit 调用。不要接进 build——它会修改源文件，
// 而且照片一旦压过就没必要在每次部署时重复处理。
/** 长边上限。相册里单张最大显示约为 90vw，2560 对 Retina 屏也够用 */
const MAX_EDGE = 2560;
const JPEG_QUALITY = 82;

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
}

function isGalleryImage(filePath) {
  const normalized = filePath.split(path.sep).join('/');
  return (
    normalized.startsWith(`${GALLERY_DIR}/`) &&
    INDEXABLE_EXT.has(path.extname(normalized).toLowerCase())
  );
}

async function compressFile(filePath) {
  const before = (await fs.stat(filePath)).size;
  const metadata = await sharp(filePath).metadata();
  const longEdge = Math.max(metadata.width ?? 0, metadata.height ?? 0);

  // 已处理过的照片：尺寸达标且没有 EXIF（相机原图必定带 EXIF，本脚本会剥掉，
  // 所以“无 EXIF”正好可以当作已处理的标记）。跳过它们，避免反复重编码掉画质。
  if (longEdge <= MAX_EDGE && !metadata.exif) {
    return { skipped: true, before, after: before, longEdge };
  }

  const ext = path.extname(filePath).toLowerCase();
  // sharp 默认不保留元数据，EXIF（含 GPS 定位）会在重新编码时被剥掉
  let pipeline = sharp(filePath).rotate().resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  });

  pipeline =
    ext === '.png'
      ? pipeline.png({ compressionLevel: 9, palette: true })
      : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true });

  // 先写临时文件，成功后再替换，避免中途失败把原图弄坏
  const tempPath = `${filePath}.tmp`;
  await pipeline.toFile(tempPath);
  const after = (await fs.stat(tempPath)).size;

  if (after >= before) {
    // 压完反而更大就保留原图（已经优化过的图片可能出现这种情况）
    await fs.unlink(tempPath);
    return { skipped: true, before, after: before, longEdge };
  }

  await fs.rename(tempPath, filePath);
  return { skipped: false, before, after, longEdge };
}

/** 按能否压缩把文件分成两组 */
function split(files) {
  const compressible = [];
  const uncompressible = [];
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (COMPRESSIBLE_EXT.has(ext)) compressible.push(file);
    else if (INDEXABLE_EXT.has(ext)) uncompressible.push(file);
  }
  return { compressible, uncompressible };
}

/** 本次提交暂存的照片（含新增与修改，排除已删除的） */
function stagedPhotos() {
  const output = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACM', '-z', '--', GALLERY_DIR],
    { encoding: 'utf8' }
  );
  return split(output.split('\0').filter((file) => file && isGalleryImage(file)));
}

/** 目录下的全部照片 */
async function allPhotos() {
  let tagDirs;
  try {
    tagDirs = await fs.readdir(GALLERY_DIR, { withFileTypes: true });
  } catch {
    return null;
  }

  const files = [];
  for (const dir of tagDirs) {
    if (!dir.isDirectory()) continue;
    const tagDir = path.join(GALLERY_DIR, dir.name);
    for (const file of await fs.readdir(tagDir, { withFileTypes: true })) {
      if (file.isFile()) files.push(path.join(tagDir, file.name));
    }
  }
  return split(files);
}

async function compressGallery() {
  const stagedOnly = process.argv.includes('--staged');

  const found = stagedOnly ? stagedPhotos() : await allPhotos();
  if (found === null) {
    console.warn(`[compress-gallery] 目录不存在，跳过：${GALLERY_DIR}`);
    return;
  }

  const { compressible: photos, uncompressible } = found;
  if (photos.length === 0 && uncompressible.length === 0) {
    if (!stagedOnly) console.log('[compress-gallery] 没有找到照片');
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;
  const rewritten = [];
  let skipped = 0;

  for (const filePath of photos) {
    const result = await compressFile(filePath);
    totalBefore += result.before;
    totalAfter += result.after;

    if (result.skipped) {
      skipped += 1;
      continue;
    }

    rewritten.push(filePath);
    const saved = Math.round((1 - result.after / result.before) * 100);
    console.log(
      `  ${filePath.replace(`${GALLERY_DIR}/`, '')}  ${formatBytes(result.before)} → ${formatBytes(result.after)}  (-${saved}%)`
    );
  }

  // 压缩后的文件要重新暂存，否则进入提交的仍是压缩前的原图
  if (stagedOnly && rewritten.length > 0) {
    execFileSync('git', ['add', '--', ...rewritten]);
  }

  // gif 会被收录进相册但无法压缩（重新编码会丢掉动图帧），大文件要提醒一声
  for (const filePath of uncompressible) {
    const size = (await fs.stat(filePath)).size;
    if (size > 1024 * 1024) {
      console.warn(
        `[compress-gallery] 警告：${filePath.replace(`${GALLERY_DIR}/`, '')} ` +
          `为 ${formatBytes(size)} 且无法自动压缩，建议手动处理后再提交`
      );
    }
  }

  if (rewritten.length === 0 && stagedOnly) return;

  const saved = totalBefore - totalAfter;
  console.log(
    `[compress-gallery] 压缩 ${rewritten.length} 张，跳过 ${skipped} 张，` +
      `共 ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}（省下 ${formatBytes(saved)}）`
  );
}

compressGallery();
