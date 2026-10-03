# 版面疑難排解：滿版、透明 Header、Header 選單樣式、全站頁尾

每一節都是「照設計圖做了但前台不對」的實際案例。驗證一律用 JS 量測，不只看截圖。

## 滿版（Full-bleed）版面

設計圖上常見「整個區塊左右貼齊瀏覽器邊緣、沒有留白」的滿版效果（例如 Hero 首圖、左右兩張大圖並排）。這種效果**不需要自訂 CSS**，Enfold 主題本身就有原生機制，但有一個很容易踩的結構陷阱：

**根本原因**：Enfold 一般的內容區塊短碼 `av_section`，其渲染輸出會被主題包在 `.container`（`max-width:1310px`）裡，所以裡面的任何元素都不可能滿版，最多撐到 1310px 寬、左右留白。而 `av_layout_row`（Enfold 的「Full Width Row」元件，用來做左右並排的儲存格 `av_cell_one_half`／`av_cell_one_third`）本身是設計成**必須直接放在內容最上層（top level）**才會輸出成真正的全寬結構。如果把 `av_layout_row` 包在 `av_section` 裡面用，短碼文字本身語法正確、標籤配對也正確，但實際渲染出來的 HTML 巢狀結構會壞掉（`av_layout_row` 的內容會脫離父層 `av_section`，變成直接掛在 `#main` 底下，而 `av_section` 自己則會產生一份空的、多餘包裹的容器）。這個壞法很難查——原始短碼文字看起來完全沒問題，要實際用瀏覽器開發者工具量測渲染後的 DOM 才看得出來。

**判斷是否該用滿版寫法**：畫面中「單一或左右並排的大圖區塊，貼齊左右瀏覽器邊緣」都算，不限於 Hero，頁面中間的滿版對比區塊也適用。

**正確寫法**：不要用 `av_section` 包 `av_layout_row`。改成把區塊層級的屬性（`id`、背景色 `color='custom' custom_bg='#xxxxxx'`、`min_height_pixel`）直接寫在 `av_layout_row` 標籤上，`av_layout_row` 本身就放在頁面內容的最上層（跟其他 `av_section` 平級，不要巢狀）：

```
[av_layout_row border='' min_height_pixel='800' extra_padding_row='no-extra-padding' color='custom' custom_bg='#111111' mobile='av-flex-cells' id='區塊id' av_uid='...']
[av_cell_one_half first vertical_align='middle' padding='60px' padding_sync='true' background_color='#111111' src='圖片網址' attachment='媒體庫附件ID' attachment_size='full' background_position='center center' background_repeat='no-repeat' av_uid='...']
  [av_heading ...][/av_heading]
  [av_textblock ...]文字[/av_textblock]
  [av_button ...]
[/av_cell_one_half]
[av_cell_one_half vertical_align='middle' padding='60px' padding_sync='true' background_color='#111111' src='圖片網址' attachment='媒體庫附件ID' attachment_size='full' background_position='center center' background_repeat='no-repeat' av_uid='...']
  ...第二欄，寫法同上...
[/av_cell_one_half]
[/av_layout_row]
```

要點：
- 圖片放在 `av_cell_one_half` 的 `src` + `attachment`（媒體庫附件 ID）當作 cell 背景圖，而不是用 `av_image` 元件塞圖片——這樣圖片才會真正撐滿整個 cell。若圖片是外部網址（不在該站媒體庫），要先透過 WP REST API（`fetch` 抓外部圖片 blob → `POST /wp-json/wp/v2/media`，帶 `X-WP-Nonce`）side-load 進媒體庫，拿到附件 ID 後才能正常運作；純外部 URL 不一定能撐滿背景。
- 若畫面是「單張滿版大圖＋文字疊加」而非左右並排，改用 shortcode-map.md 對照表裡的 `av_slideshow_full` 包 `av_slide_full`（同樣不能包在 `av_section` 裡）。
- 這類全寬元件不會自動置中對齊頁面其他 `av_section` 內容，視覺上下方銜接處可視需要調整 padding。

**驗證方式（不要只用肉眼看截圖，數字量測才準）**：改完存檔、重新整理前台後，在瀏覽器 console 對區塊 id 執行：
```js
document.getElementById('區塊id').getBoundingClientRect()
```
確認回傳的 `x` 為 `0`、`width` 等於 `window.innerWidth`（viewport 寬度）。只要 `x` 不是 0 或 `width` 小於 viewport 寬度，就代表還沒真正滿版，要回頭檢查是不是又把全寬元件包進了 `av_section` 或其他有 `.container` 限制的父層裡。

## 透明 Header + 滿版首屏

**現象**：後台已經把該頁 Header 設成「Transparent Header」、也隱藏了標題列，但前台看到的還是一條實心色塊擋在最上面，滿版首圖沒有真的「穿透」到 header 後面，反而像隔了一層看不出原因的空白。

**根本原因**：Enfold 把所有頁面內容包在 `<main class="template-page content ...">` 裡，這層預設有 `padding-top:50px；padding-bottom:50px`（給一般文章頁用的呼吸空間）。這段 padding **不會**因為設定了 Header Transparency 就自動消失——就算滿版元件（`av_layout_row`／`av_slideshow_full`）語法完全正確、也放在內容最上層（沒有犯上一節「滿版」講的巢狀陷阱），視覺上還是會被這 100px 的內距整個往下推，header 後面露出的其實是一片空白背景，不是首圖。

**判斷方法**：不要只憑螢幕截圖判斷「有沒有透明」，用 JS 量測比較準：
```js
document.getElementById('header').getBoundingClientRect() // 確認 header 是 position:fixed、背景真的透明
document.querySelector('#main .container_wrap_first').getBoundingClientRect().height
// 這個值如果明顯大於 0（常見會落在 90~120px 左右），通常就是 main 的預設 padding 在搞鬼
```

**修法**：在頁面自己的 CSS（例如放在頁首一個 `[av_codeblock]` 裡的 `<style>`）加一條頁面專屬 override：
```css
#top main.template-page{padding-top:0;padding-bottom:0}
```
這樣滿版首屏才會真正頂到瀏覽器最上緣，header 才有東西可以「透」過去。

**連帶影響（容易漏掉的下一步）**：main 的 padding 歸零之後，滿版首屏裡原本靠這段 padding 撐出間距的標題／文字／按鈕，可能會因為少了緩衝，緊貼在（此刻已覆蓋在圖片上的）透明 header 底下，跟 header 選單文字視覺重疊。要另外幫首屏內容區塊補一段 `padding-top`，數值約等於 header 實際高度加一些緩衝空間（例如量出來 header 高 90px，就補到 120~130px），讓標題往下讓開：
```css
#hero區塊id .flex_cell{padding-top:130px !important}
```
Enfold 產生的 cell padding 是透過它自己動態注入的 class 控制、不是寫在元素的 inline style 上，蓋掉它一定要用 `!important`，直接改 inline style 沒有用。

## Header 選單客製化樣式（顏色、按鈕、隨捲動變色）

**情境**：需要讓 Header 選單文字顏色跟著頁面內容變化（例如疊在深色首圖上要白字，捲動到白底內容區之後要變回深色），或是把某個選單項目做成膠囊外框／實心按鈕樣式（例如語言切換、CTA 按鈕）。這類需求如果 Enfold 原生的「header 自動變色」選項被關閉（後台看到 header 的 class 裡有 `av_header_shrinking_disabled`／`av_header_unstick_top_disabled`），就要自己用 CSS/JS 刻。

**陷阱一：純 CSS + `!important` 常常「看起來沒生效」**——其實不是 `!important` 沒作用，是 Enfold 的選單自己帶了響應式重繪 JS（手機版選單複製、resize 重新初始化等機制），**會在頁面載入後不定期重新產生選單的 DOM 節點**，把你剛套用的樣式一起洗掉。用瀏覽器一開始截圖看起來是對的，隔幾秒再看又變回原本顏色，很容易誤判成「規則沒生效」而在原本已經對的 CSS 選擇器上一直繞圈除錯。

解法：改用 JS **持續套用**樣式，而不是只跑一次。scroll、DOMContentLoaded 之外，加一個 `MutationObserver` 監看 header DOM 變化、再加一個 `setInterval` 定時重套當雙保險：
```js
function applyHeaderStyle(){ /* 你的顏色/樣式邏輯，直接用 el.style.setProperty(prop, value, 'important') */ }
window.addEventListener('scroll', applyHeaderStyle);
document.addEventListener('DOMContentLoaded', applyHeaderStyle);
new MutationObserver(function(){
  clearTimeout(window.__baHT);
  window.__baHT = setTimeout(applyHeaderStyle, 50);
}).observe(document.getElementById('header'), {childList:true, subtree:true, attributes:true});
setInterval(applyHeaderStyle, 1000); // 保底，即使前面兩種偵測都沒抓到變化也會定期修正
```

**陷阱二：用「倒數第幾個項目」判斷選單位置容易索引錯位**——Enfold 選單在 `ul.menu` 最後會自動多塞一個手機版漢堡選單的 `<li class="menu-item-avia-special" ...>`（`display:none` 但仍在 DOM 裡）。如果直接用「最後一個是聯絡按鈕、倒數第二個是語言切換」這種索引邏輯，會整個錯位一位，導致樣式套到錯的項目上（實測發生過：聯絡按鈕套到外框樣式、語言切換反而變成純文字）。務必先過濾掉這個隱藏項目再算索引：
```js
var items = Array.prototype.filter.call(
  header.querySelectorAll('.main_menu ul.menu > li'),
  function(li){ return li.className.indexOf('menu-item-avia-special') === -1; }
);
```

**陷阱三：按鈕/膠囊外框整個被拉到跟 header 一樣高、文字沒有垂直置中**——Enfold 的選單連結預設有 `height:100%`（讓整條 header 高度都可以點擊），只靠 padding 決定按鈕大小不會覆蓋掉這個 height，會做出一個文字卡在最上緣、下面留一大截空白的怪按鈕。要一併覆寫：
```css
height:auto !important;
display:inline-flex !important;
align-items:center !important;
justify-content:center !important;
```

**陷阱四（設計感）：小型 UI 元件的比例不要用猜的**——語言切換、CTA 按鈕這類小元件，padding／border-radius／font-size 隨便抓數字容易做得太大太滿、看起來廉價（例如整顆做成過大的橢圓膠囊）。有參考設計/網站的話，直接在該網站按 F12 對目標元素跑：
```js
getComputedStyle(document.querySelector('目標元素'))
```
量出實際的 `padding`、`border-radius`、`font-size`、`font-weight`，照抄數值再依自己配色微調，比自己憑感覺猜準很多、也比較不會被反饋「這個外框有點醜」。

## 全站頁尾（Custom Footer Page）：避免頁尾重複

**現象**：頁面最下面同時出現兩份看起來都像頁尾的內容，一份是自己在頁面內容裡寫的，另一份風格明顯不搭（例如出現另一組公司資訊、佔位電話號碼、不相關的地圖）。

**原因**：部分 Enfold 站台（尤其是設計師/代管環境事先架設好的）會設定一個「Custom Footer Page（自訂頁尾頁面）」機制——**該頁面的內容會被系統自動附加在全站每一頁的最下方**，不需要在每個頁面自己重複貼一份頁尾短碼。

**動工前務必先確認**：進外觀 → 選單畫面，看左側「頁面」清單裡有沒有某個頁面被標示「Active Custom Footer Page」；或者直接找有沒有一個 slug／標題叫 `footer` 的頁面。如果有，頁尾內容要改到那個獨立頁面裡（用 rest-api-write.md 的方法），**不要**又在正在製作的目標頁面內容尾端自己貼一份，否則會疊出兩份頁尾。

**如果已經誤貼了怎麼辦**：把目標頁面裡那段內聯頁尾的短碼片段整段剪下來（可以直接拿來當 Custom Footer Page 的新內容，一魚兩吃），從目標頁面內容裡移除重複的那份，貼到 Custom Footer Page 頁面存檔即可——這樣全站頁尾會一起變成正確版本，不用兩邊分別維護。
