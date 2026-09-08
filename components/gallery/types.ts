export interface GalleryPhoto {
  id: string;
  src: string;
  /** 主分类，来自所在文件夹名 */
  tag: string;
  /** 可筛选的标签，形如 `航司:United`，由 schema.json 的 facets 决定 */
  tags: string[];
  /** 文件名解析出的全部字段，含不做筛选项的（如注册号），用于展示 */
  fields: Record<string, string>;
  /** 查表前的原始值，只有声明了 lookup 的字段才有（如 航司: "UA"） */
  codes: Record<string, string>;
  caption: string | null;
  width: number;
  height: number;
  filename: string;
}

/** 照片下方展示的一行说明：优先用手写图注，否则把文件名解析出的字段拼起来 */
export function describePhoto(photo: GalleryPhoto): string {
  if (photo.caption) return photo.caption;
  const values = Object.values(photo.fields);
  return values.length > 0 ? values.join(' · ') : photo.tag;
}
