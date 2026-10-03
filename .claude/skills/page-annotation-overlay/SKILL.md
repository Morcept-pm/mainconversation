---
name: page-annotation-overlay
description: "要在既有網頁上框選、圈選、標記區塊並記錄精確位置時使用，例如網頁修改標註工具、UAT 驗收工具、品牌稽核工具、互動式教學導覽。說明覆蓋層＋canvas 繪製、整頁絕對座標換算、CSS selector 產生，以及沒有截圖時的座標百分比換算。"
---

# 頁面標記與定位工具

## 什麼時候用這個 skill
使用者想在一個「本來就存在、不是自己能改原始碼」的網頁上，讓人用滑鼠標出特定區塊，並且要能：（a）精確記錄那個位置、（b）事後知道標的是哪個 DOM 元素、（c）畫面上要看得到標記本身。

## 1. 覆蓋層＋Canvas：畫圖但不干擾原頁面

在 `document.body` 加一個絕對定位、鋪滿整頁（含捲動範圍）的容器，裡面放一個同尺寸的 `<canvas>` 負責畫框線／筆跡：

```js
var docW = Math.max(document.documentElement.scrollWidth, innerWidth);
var docH = Math.min(Math.max(document.documentElement.scrollHeight, innerHeight), 20000); // 設上限避免超長頁面爆記憶體
var layer = el('div', 'position:absolute;left:0;top:0;width:' + docW + 'px;height:' + docH + 'px;z-index:2147483640;pointer-events:none;');
var canvas = document.createElement('canvas');
canvas.width = docW; canvas.height = docH;
layer.appendChild(canvas);
var ctx = canvas.getContext('2d');
```

`pointer-events:none` 一定要設在整個覆蓋層上，讓滑鼠事件穿透到底下的原始網頁；只有真的要互動的元素（標記編號、工具列按鈕）才個別設回 `pointer-events:auto`。

## 2. 框選：算出「整頁絕對座標」

`getBoundingClientRect()` 回傳的是相對於目前可視窗口的座標，捲動後會變。要換算成頁面絕對座標，需要加回捲動量：

```js
function pageRect(t) {
  var r = t.getBoundingClientRect();
  return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY),
           w: Math.round(r.width), h: Math.round(r.height) };
}
ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
```

## 3. 圈選（自由手繪）：路徑 → 反查元素

監聽 `pointerdown / pointermove / pointerup`（**第四個參數要傳 `true` 用 capture 模式**，確保比原頁面自己的事件更早攔截到，並搭配 `preventDefault()/stopPropagation()`，避免圈選同時誤觸底下的連結或按鈕）：

```js
var stroke = null;
on(document, 'pointerdown', function (e) { stroke = [[e.pageX, e.pageY]]; }, true);
on(document, 'pointermove', function (e) {
  stroke.push([e.pageX, e.pageY]);
  ctx.beginPath();
  stroke.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
  ctx.stroke();
}, true);
on(document, 'pointerup', function (e) {
  var xs = stroke.map(function (p) { return p[0]; }), ys = stroke.map(function (p) { return p[1]; });
  var cx = (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2 - scrollX;
  var cy = (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2 - scrollY;
  var target = document.elementFromPoint(cx, cy);  // 用路徑外框中心點反查底下是哪個元素
});
```

## 4. 產生穩定、唯一的 CSS Selector

要在文字紀錄裡精準描述「就是這個元素」，從目標元素往上層層走：優先用 `id`；沒有就用「標籤名＋前兩個 class」；同層有多個同名兄弟元素就加 `:nth-of-type()`；每組合一層就用 `document.querySelectorAll()` 測試是否已唯一，唯一就提早停止：

```js
function cssPath(t) {
  if (t.id) return '#' + CSS.escape(t.id);
  var parts = [], n = t;
  while (n && n.nodeType === 1 && n !== document.documentElement) {
    var part = n.tagName.toLowerCase();
    if (n.id) { parts.unshift('#' + CSS.escape(n.id)); break; }
    var cls = Array.prototype.slice.call(n.classList).slice(0, 2);
    if (cls.length) part += '.' + cls.map(function (c) { return CSS.escape(c); }).join('.');
    var p = n.parentElement;
    if (p) {
      var same = Array.prototype.filter.call(p.children, function (s) { return s.tagName === n.tagName; });
      if (same.length > 1) part += ':nth-of-type(' + (same.indexOf(n) + 1) + ')';
    }
    parts.unshift(part);
    if (document.querySelectorAll(parts.join(' > ')).length === 1) break;
    n = p;
  }
  return parts.join(' > ');
}
```

## 5. 沒有真的截圖時，怎麼讓 AI「看懂」位置

如果標記結果只會用純文字傳給 AI（沒有夾帶真的圖片），把絕對座標換算成「佔頁面寬高的百分比」，讓 AI 可以理解相對位置並畫出示意圖：

```js
function toPct(rect) {
  var d = { w: Math.max(document.documentElement.scrollWidth, innerWidth), h: Math.max(document.documentElement.scrollHeight, innerHeight) };
  return { xPct: +(rect.x / d.w * 100).toFixed(1), yPct: +(rect.y / d.h * 100).toFixed(1),
           wPct: +(rect.w / d.w * 100).toFixed(1), hPct: +(rect.h / d.h * 100).toFixed(1) };
}
```

圈選路徑點數可能很多，塞進 JSON 前先降採樣（例如最多留 24 個點），並在給 AI 的指令裡講清楚「這是示意用座標，不是真的截圖，不用畫得很精確」。

## 常見坑
- 忘記加回 `scrollX/scrollY`：頁面一捲動，標記位置就對不上。
- 圈選判定元素時直接用滑鼠放開那一刻的座標，而不是整條路徑的外框中心點：使用者手繪一圈，滑鼠放開的位置常常在圓圈邊緣而不是圈的內容物上，用外框中心點更準。
- `querySelectorAll` 測試唯一性時忘記處理「這個 class 名稱本身包含特殊字元」，記得用 `CSS.escape()`。
