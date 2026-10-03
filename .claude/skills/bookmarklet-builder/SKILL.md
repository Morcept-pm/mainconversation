---
name: bookmarklet-builder
description: "要做瀏覽器書籤小工具（bookmarklet），或需要「不裝套件、不架後端、在任何網站上點一下就能跑」的輕量工具時使用。說明 javascript: 書籤的包裝、再點一次就關閉的開關、乾淨銷毀，以及編碼建置與驗證流程。"
---

# 書籤小工具（Bookmarklet）建置器

## 什麼時候用這個 skill
使用者想要一個「裝在瀏覽器書籤列、點一下就能在目前網站上跑」的小工具，且不想要求對方安裝擴充套件、不想架後端、不想登入。典型情境：網頁標註工具、頁面快篩／稽核工具、任何「臨時想在別人網站上跑一段邏輯」的需求。

## 核心結構

書籤的網址不是 `https://...`，而是 `javascript:(function(){ ... })();`。瀏覽器點到這種書籤時不會跳轉，而是直接在目前頁面的 context 裡執行這段 JS。

```js
javascript:(function(){
  'use strict';
  if (window.__mytool) { window.__mytool.destroy(); return; }   // 再點一次＝關閉

  var nodes = [], listeners = [];
  function on(t, ty, fn, o) { t.addEventListener(ty, fn, o); listeners.push([t, ty, fn, o]); }
  function el(tag, css, parent) {
    var n = document.createElement(tag);
    n.setAttribute('data-mytool', '1');
    if (css) n.style.cssText = css;
    (parent || document.body).appendChild(n);
    if (!parent) nodes.push(n);
    return n;
  }

  // ...工具邏輯放這裡，用 el()/on() 建立 UI 和事件...

  function destroy() {
    listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
    nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    window.__mytool = null;
  }
  window.__mytool = { destroy: destroy };
})();
```

## 四個一定要做的設計

1. **開關模式**：一進來先檢查 `window.__namespace` 是否存在，存在就呼叫 `destroy()` 並 `return`。不要另外做開關按鈕，「再點一次書籤」本身就是關閉的動作。
2. **統一建立節點／綁事件**：所有 DOM 節點都透過同一個 `el()` 建立、所有事件都透過同一個 `on()` 綁定，兩者分別把建立的東西塞進 `nodes[]` / `listeners[]`。這是為了 destroy() 能一次清乾淨。
3. **`destroy()` 要徹底**：跑過 `listeners[]` 呼叫 `removeEventListener`、跑過 `nodes[]` 呼叫 `removeChild`。書籤工具會被同一頁反覆開關，沒清乾淨會累積殭屍節點跟殭屍監聽器，越用越卡。
4. **所有自建節點都打一個共同標記**（例如 `data-mytool="1"`），方便判斷「使用者點到的是我自己工具的 UI，還是原本網頁的內容」（`el.closest('[data-mytool]')`），避免工具自己的按鈕誤觸底下的攔截邏輯。

## 建置流程（不要手動處理編碼字串）

1. 工具邏輯寫成一支正常縮排、好維護的獨立 `.js` 檔案，不要一開始就手動壓成一行。
2. 需要包成書籤連結時，用程式（Python `urllib.parse.quote(src, safe="-_.!~*'()")` 或 Node `encodeURIComponent`）把整支 `.js` 編碼，前面接上 `javascript:`，塞進安裝頁的 `<a href="...">`。
3. 之後要改工具內容，只改那支 `.js`，重跑一次編碼腳本即可，不要手動去改一大串網址編碼字串。
4. **一定要做一次「解碼回原始碼、逐字比對＋跑語法檢查」的驗證**：
   ```python
   import urllib.parse, subprocess
   raw = urllib.parse.unquote(href[len('javascript:'):])
   assert raw == open('mytool.js', encoding='utf-8').read()
   subprocess.run(['node', '--check', 'mytool.js'])
   ```
   這能抓出編碼過程中任何字元跑掉、或原始碼本身有語法錯誤的問題，避免使用者拖到書籤列後點了卻沒反應。

## 安裝頁該有的內容
一個獨立的說明頁（不是工具本身），至少要有：
1. 提醒使用者確認瀏覽器書籤列有顯示（不同瀏覽器快捷鍵不同，Mac Chrome 是 `⌘+Shift+B`）。
2. 一個可以「拖曳」的按鈕（`<a draggable="true" href="javascript:...">`），並用 `onclick` 加一個提示：這個要拖，不是用點的（避免使用者誤點導致工具直接在安裝頁上執行）。
3. 手機瀏覽器大多不支援拖曳書籤，要註明建議先在電腦上用，並提供「複製連結網址、手動貼進書籤網址欄」的備案。

## 常見坑
- 忘記 `return` 在 destroy 分支之後，會導致再點一次書籤時「先關閉又立刻重新執行」。
- `z-index` 沒設夠高，工具 UI 會被原本網站自己的 `position:fixed` 元素蓋住——用接近 32 位元上限的值（如 `2147483646`）。
- 沒有把覆蓋層預設成 `pointer-events:none`，會擋掉使用者對原本網頁的點擊。
