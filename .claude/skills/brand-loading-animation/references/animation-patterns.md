# Demo 動畫的設計語彙與 CSS 技法

## 設計語彙（以「設計工作室」品牌為例）

如果使用者本身是設計/創意相關業務（網頁設計、品牌識別、平面製作），動畫方向可以直接扣「設計過程」本身當敘事，比單純的「淡入」「呼吸」更有記憶點、更貼業務定位。實際做過並得到使用者青睞的方向：

- **藍圖構成／Blueprint Construction**：先出現製圖網格＋十字參考線（`clip-path: inset()` 從中心向外展開），logo 各部件從畫面外極遠處（超出螢幕邊界的 `translate` 值，例如 `-900px,-40px`）用不同角度甩入定位，落地瞬間先以線框（`stroke`，向量藍）呈現、閃一下亮度後切換成實色 `fill`，網格線隨後淡出。動作幅度大，直接講「從草圖到完稿」的設計過程感。
- 其他曾經比較過但未被選中的方向：呼吸循環（scale 呼吸律動）、描邊顯影（`stroke-dashoffset` 描邊）、套色對位／CMYK 對版（`mix-blend-mode:multiply` 疊色 + 邊角十字對位記號）、錨點裝配（用向量錨點當作小圓點從外部飛入再連成外框）。同一套 `paths_baked.json` 可以直接餵給任何一種方向的 demo，不用重新處理素材。

CSS 動畫技法備忘：
- 每個部件的 `transform-origin` 要設 `transform-box: fill-box`，否則 SVG `<path>` 的旋轉/縮放支點預設是整個 viewBox 左上角，不是形狀自己的中心，動畫軌跡會怪怪的。
- 用 CSS 自訂屬性（`--off`、`--rot`、`--delay`、`--dur`）掛在每個部件的 inline style 上，所有部件共用同一組 `@keyframes`，只靠自訂屬性表現差異，比每個部件寫一組獨立 keyframes 好維護。
- 線框→實色的交叉淡出，用兩個疊在一起的 `<path>`（一個只有 `stroke` 無 `fill`，一個只有 `fill`），靠 `opacity` 動畫切換，並在切換瞬間用 `filter:brightness()` 快速閃一下，比單純淡入淡出更有「定案」的視覺重量感。
- 記得加 `@media (prefers-reduced-motion: reduce)` fallback，把大動作動畫關掉、只留必要的淡入。
