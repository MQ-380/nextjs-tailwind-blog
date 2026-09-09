# 航司图标

文件名是**航司 IATA 二字码的小写**，和 `data/airlines.json` 的键一一对应：

```
public/static/images/airlines/
  ua.png    → United Airlines
  fm.png    → Shanghai Airlines
  qr.png    → Qatar Airways
```

- 支持 png / jpg / svg / webp
- 建议 64×64 以上、背景透明，页面里按 20×20 渲染
- **没有图标的航司自动退回首字母方块**，所以不用一次配齐，配一个生效一个

页面不在渲染时扫这个目录，读的是构建期生成的 `app/airline-icons.json`。
`npm run generate-gallery`（`predev` / `prebuild` 会自动跑）和 `fetch-airline-icons`
都会刷新它，所以手动加图标后不用额外做什么——但如果想马上在本地看到，
dev server 缓存 JSON 模块，重启一下。

## 批量抓取

```bash
npm run fetch-airline-icons          # 只抓已经拍到的航司
npm run fetch-airline-icons -- --all # 抓名单里全部航司
```

从航司官网 favicon 抓取，域名是 `data/airlines.json` 里每家的 `domain` 字段。
没有独立官网的写 `null`，脚本会跳过（如上航已并入东航，填 `ceair.com`
只会抓到东航的图标，是错的）。

**已存在的文件不会被覆盖**，所以手动换上更好的图之后重跑不会被冲掉。
源图小于 32px 的会在结尾单独提示。

抓完的图统一成 64×64 PNG，页面里渲染在一个白色圆角底片上——favicon 来源
五花八门，有的是深色 logo 配透明底（深色主题下几乎看不见），有的自带白色方块，
垫底之后两种都能正常显示，整列看起来也一致。

## 手动换图

favicon 质量参差，遇到糊的就手动换。以上航（`fm`）为例：

```bash
# 下载来源图后，统一成和抓取脚本一样的规格
node -e 'require("sharp")("源图.png")
  .resize(64,64,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}})
  .png().toFile("public/static/images/airlines/fm.png")'
```

判断好不好用要**按实际渲染尺寸（20–40px）看**，不要放大了挑刺——放大后糊成一团的
16×16 图，缩到 20px 往往是够用的。

## 关于图标来源

航司 logo 属于商标。用它标识「你拍到的这架飞机属于哪家航司」是常见的说明性用途
（各大拍机站点都这么做），实际要解决的是「拿到一份允许你转发的文件」。几条路：

| 来源 | 情况 |
|---|---|
| 航司官方 media / press kit | 最干净，通常明确允许媒体和说明性使用，画质也最好。需要一家家找 |
| 透明 PNG 素材站（StickPNG 等） | 画质好、背景干净，但授权状况要自己确认。`fm.png` 来自 StickPNG |
| AirHex 等 logo API | 专为此设计、尺寸统一，但未授权时返回带水印的图（实测 HTTP 401） |
| 网站 favicon | 免费自动，当前默认。质量参差：不少只有 16×16，深色 logo 在深色背景上几乎看不见 |
| 不配图标 | 用首字母方块，零授权问题 |

直接从航司官网取 `apple-touch-icon.png` / `favicon.ico` 拿高清版试过，
Qatar、Allegiant、Aer Lingus 都返回 403/404（反爬或路径不同），走不通。
