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

## 添加照片的完整流程

```bash
# 1. 把照片拷进对应的 tag 目录（新 tag 直接新建文件夹即可）
cp ~/Pictures/羽田/*.jpg public/static/images/gallery/planes/

# 2. 提交。pre-commit 钩子会自动压缩暂存的照片并重新暂存，
#    进入提交的就是压缩后的版本
git add public/static/images/gallery app/gallery-data.json
git commit -m "add: 新增羽田机场照片"
```

manifest 会在 `npm run dev` / `npm run build` 时自动重新生成，也可手动跑 `npm run generate-gallery`。

## 关于压缩

压缩由 `.githooks/pre-commit` 在提交时自动完成，无需手动操作。也可以随时手动跑：

```bash
npm run compress-gallery            # 处理目录下全部照片
npm run compress-gallery -- --staged  # 只处理暂存的照片（钩子用的就是这个）
```

钩子通过 `core.hooksPath` 生效，`npm install` 时会自动配置（见 package.json 的 `prepare`）。
手动配置用 `git config core.hooksPath .githooks`，想临时跳过用 `git commit --no-verify`。

**注意钩子只能防住未来的提交**——大图一旦进了 git 历史就会永久留在里面，仓库体积降不下来（除非用 `git filter-repo` 之类改写历史）。

脚本会**就地修改**源文件，所以刻意没有接进 build。

- **为什么必须压**：`next/image` 只优化传输（浏览器拿到的是缩放过的 WebP），但原图会原样进 git 仓库。相机直出动辄 15MB 一张，几百张就会让仓库大到难以克隆。实测一张 6000×4000 的原图 15.5MB → 814KB，省 95%。
- **顺带剥掉 EXIF**：手机和相机会把 GPS 坐标写进照片。旅行和拍飞机的照片一旦公开发布，等于公开了拍摄地点。脚本重新编码时会去掉全部元数据。
- **可以反复跑**：已经处理过的照片（尺寸达标且无 EXIF）会自动跳过，不会重复压缩导致画质逐次劣化。
- **参数**：长边上限 2560px、JPEG 质量 82。想调整改 `scripts/compress-gallery.js` 顶部的常量即可。

## 关于 manifest

`app/gallery-data.json` 由 `npm run generate-gallery` 扫描本目录生成，记录每张照片的路径、tag、尺寸和图注。该脚本已挂到 `predev` / `prebuild`，本地 `npm run dev` 和 Vercel 部署时都会自动执行，正常情况不需要手动跑。

注意 `components/Header.tsx` 会读取这个文件——**没有照片时导航栏不会显示 Gallery 入口**。
