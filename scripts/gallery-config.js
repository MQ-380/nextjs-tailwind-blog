// 相册脚本的共享配置。格式列表曾经在 generate / compress 两个脚本里各写一份，
// 导致 webp 被 manifest 收录却不会被压缩，8MB 的原图能直接进仓库。统一放在这里。

export const GALLERY_DIR = 'public/static/images/gallery';

/** 会被收录进 manifest、显示在相册页的格式 */
export const INDEXABLE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

/** 能被压缩脚本处理的格式。gif 可能是动图，重新编码会丢帧，故不处理 */
export const COMPRESSIBLE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
