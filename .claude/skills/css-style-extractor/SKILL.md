---
name: css-style-extractor
description: "要擷取網頁元素的視覺樣式時使用：收集設計靈感、從網站反推品牌／DESIGN token、比對元素是否符合設計規範（搭配 design-audit）。說明用白名單加預設值過濾，只抓出真正被設計過的 CSS，而不是整包 getComputedStyle()。"
---

# 視覺樣式擷取（只抓「質感」，不是全部 CSS）

## 什麼時候用這個 skill
需要從一個 DOM 元素身上「打包它為什麼好看／為什麼不符合規範」的樣式資訊，用途包括：收集別人網站的設計靈感、稽核自家頁面是否符合 DESIGN.md 規範、把某個元素的視覺特徵轉成可以講給 AI 聽的描述。

## 為什麼不能直接丟 getComputedStyle()
`getComputedStyle()` 會回傳幾百個屬性，包含大量瀏覽器預設值與跟視覺無關的雜訊（例如 `unicode-bidi`、`writing-mode`）。直接整包丟給人或 AI，訊噪比太低，抓不到重點。

## 做法：白名單 + 預設值過濾

先定一份「視覺相關屬性」白名單，只抓這些：

```js
var LOOK_PROPS = [
  'color', 'background-color', 'background-image', 'background',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
  'text-transform', 'text-shadow', 'text-decoration',
  'border', 'border-radius', 'box-shadow',
  'padding', 'margin', 'width', 'height',
  'display', 'gap', 'align-items', 'justify-content',
  'backdrop-filter', '-webkit-backdrop-filter',
  'opacity', 'transition', 'animation', 'filter'
];
```

再定一份「等於預設值就跳過」的字典，過濾掉沒有被特別設計過的屬性：

```js
var SKIP = {
  'border': '0px none rgb(0, 0, 0)',
  'box-shadow': 'none',
  'background-image': 'none',
  'text-shadow': 'none',
  'transition': 'all 0s ease 0s',
  'animation': 'none 0s ease 0s 1 normal none running',
  'filter': 'none',
  'backdrop-filter': 'none',
  '-webkit-backdrop-filter': 'none',
  'text-decoration': 'none solid rgb(0, 0, 0)',
  'letter-spacing': 'normal',
  'text-transform': 'none',
  'margin': '0px',
  'padding': '0px',
  'gap': 'normal',
  'opacity': '1'
};

function grabCSS(t) {
  var cs = getComputedStyle(t), out = {};
  LOOK_PROPS.forEach(function (p) {
    var v = cs.getPropertyValue(p);
    if (!v || v === 'normal' || v === 'auto' || v === 'none') return;
    if (SKIP[p] && v === SKIP[p]) return;
    out[p] = v;
  });
  return out;
}
```

輸出結果會是一個只剩「這個元素真的被特別設計過的地方」的物件，例如卡片可能只剩 `border-radius`、`box-shadow`、`background-color` 三項——這正是它「看起來好看」的關鍵，直接拿這個去描述給 AI 或做規範比對都很乾淨。

## 延伸應用
- **品牌稽核**：拿一份 DESIGN.md 的 token 清單（顏色、圓角、字重範圍）跟 `grabCSS()` 抓出來的值比對，超出範圍的自動標記出來。
- **設計靈感收集**：連同 `cssPath()`（見 page-annotation-overlay skill）和元素文字內容一起打包，讓 AI 理解「這個位置的這個元素長什麼樣」並在別的網站重現類似質感。
- **DESIGN.md 建置**：對頁面上一批代表性元素跑一輪 `grabCSS()`，彙整出常見的顏色值、字級、圓角，反推出一份 token 草稿。

## 常見坑
- 白名單和 SKIP 字典要隨專案調整：不同瀏覽器對同一個預設值的字串表示法可能不同（例如 `rgb(0, 0, 0)` vs `rgba(0, 0, 0, 0)`），拿到奇怪的殘留值時先印出來確認實際字串再補進 SKIP。
- `background` 和 `background-color` / `background-image` 會有重疊，視需求決定要不要同時保留（保留兩者比較保險，但顯示時記得去重）。
