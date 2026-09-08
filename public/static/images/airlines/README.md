# 航司图标

把图标按航司名放这里，文件名是航司名的小写连字符形式：

```
public/static/images/airlines/
  united.png        → United
  aer-lingus.png    → Aer Lingus
  qatar.png         → Qatar
```

- 支持 png / jpg / svg / webp
- 建议 64×64 以上、背景透明，页面里按 20×20 渲染
- **没有图标的航司自动退回首字母方块**，所以不用一次配齐，配一个生效一个

## 批量抓取

```bash
npm run fetch-airline-icons          # 只抓已经拍到的航司
npm run fetch-airline-icons -- --all # 抓名单里全部 63 家
```

从航司官网 favicon 抓取，域名维护在 `data/airlines.json` 的 `domains` 里。
**已存在的文件不会被覆盖**，所以手动换上更好的图之后重跑不会被冲掉。
源图小于 32px 的会在结尾单独提示。

抓完的图统一成 64×64 PNG，页面里渲染在一个白色圆角底片上——favicon 来源
五花八门，有的是深色 logo 配透明底（深色主题下几乎看不见），有的自带白色方块，
垫底之后两种都能正常显示，整列看起来也一致。

### 实测结果（首批 8 家）

| 结果 | 航司 |
|---|---|
| 可用 | United、Brussels、ITA、Lufthansa、Delta、Aer Lingus、Allegiant |
| 不可用 | **Qatar**——源图只有 16×16，放大糊成一团，已删除让它回退首字母 |

试过直接从航司官网取 `apple-touch-icon.png` / `favicon.ico` 拿高清版，
Qatar、Allegiant、Aer Lingus 都返回 403/404（反爬或路径不同），走不通。

## 关于图标来源

航司 logo 属于商标。用它标识「你拍到的这架飞机属于哪家航司」是常见的说明性用途
（各大拍机站点都这么做），实际要解决的是「拿到一份允许你转发的文件」。几条路：

| 来源 | 情况 |
|---|---|
| 航司官方 media / press kit | 最干净，通常明确允许媒体和说明性使用，画质也最好。需要一家家找 |
| AirHex 等 logo API | 专为此设计、尺寸统一，但未授权时返回带水印的图（实测 HTTP 401） |
| 网站 favicon | 免费自动，但实测质量参差：Qatar 只有 16×16，Lufthansa 深色 logo 在深色背景上几乎看不见，背景也不统一 |
| 不配图标 | 用首字母方块，零授权问题，也是当前默认 |
