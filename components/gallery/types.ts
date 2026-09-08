export interface GalleryPhoto {
  id: string;
  src: string;
  /** 主分类，来自所在文件夹名 */
  tag: string;
  /** 附加标签（航空公司、机型等），来自文件名 `ANA_787--描述.jpg` 的前缀 */
  tags: string[];
  caption: string | null;
  width: number;
  height: number;
  filename: string;
}
