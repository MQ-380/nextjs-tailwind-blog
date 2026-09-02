import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// 就地压缩 public/static/images/gallery 下的照片：缩到合理尺寸、重新编码、剥掉 EXIF。
// 这是提交前手动跑的一次性步骤，不要接进 build——它会修改源文件，
// 而且照片一旦压过就没必要在每次部署时重复处理。
const GALLERY_DIR = 'public/static/images/gallery';
/** 长边上限。相册里单张最大显示约为 90vw，2560 对 Retina 屏也够用 */
const MAX_EDGE = 2560;
const JPEG_QUALITY = 82;
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png']);

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
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

async function compressGallery() {
  let tagDirs;
  try {
    tagDirs = await fs.readdir(GALLERY_DIR, { withFileTypes: true });
  } catch {
    console.warn(`[compress-gallery] 目录不存在，跳过：${GALLERY_DIR}`);
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let compressed = 0;
  let skipped = 0;

  for (const dir of tagDirs) {
    if (!dir.isDirectory()) continue;
    const tagDir = path.join(GALLERY_DIR, dir.name);
    const files = await fs.readdir(tagDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile()) continue;
      if (!IMAGE_EXT.has(path.extname(file.name).toLowerCase())) continue;

      const filePath = path.join(tagDir, file.name);
      const result = await compressFile(filePath);

      totalBefore += result.before;
      totalAfter += result.after;

      if (result.skipped) {
        skipped += 1;
      } else {
        compressed += 1;
        const saved = Math.round((1 - result.after / result.before) * 100);
        console.log(
          `  ${dir.name}/${file.name}  ${formatBytes(result.before)} → ${formatBytes(result.after)}  (-${saved}%)`
        );
      }
    }
  }

  if (compressed === 0 && skipped === 0) {
    console.log('[compress-gallery] 没有找到照片');
    return;
  }

  const saved = totalBefore - totalAfter;
  console.log(
    `[compress-gallery] 压缩 ${compressed} 张，跳过 ${skipped} 张，` +
      `共 ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}（省下 ${formatBytes(saved)}）`
  );
}

compressGallery();
