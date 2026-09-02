# 相册照片

把照片按 tag 分文件夹放在这里，文件夹名就是照片的 tag（例如飞机、某个城市），支持中文文件夹名：

```
public/static/images/gallery/
  planes/
    IMG_0001.jpg
    IMG_0002.jpg
  tokyo/
    IMG_0101.jpg
  osaka/
    IMG_0201.jpg
```

- 支持的格式：jpg / jpeg / png / webp / avif / gif
- 想给某张照片加说明文字，可以在对应 tag 文件夹里新建一个 `captions.json`，内容形如：

  ```json
  {
    "IMG_0001.jpg": "羽田机场 ANA 787 起飞"
  }
  ```

  没有配置 caption 的照片，hover 时只显示 tag。

添加/删除照片后运行：

```bash
npm run generate-gallery
```

会重新扫描这个目录并生成 `app/gallery-data.json`。这个脚本也接到了 `predev` / `prebuild`，本地跑 `npm run dev` 或部署到 Vercel 跑 `npm run build` 时都会自动执行一次，正常情况不需要手动跑。
