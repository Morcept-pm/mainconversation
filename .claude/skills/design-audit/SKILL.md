---
name: design-audit
description: "默聲創意（Morcept）產出或審查前端網頁／HTML 成品（客戶網站、產檔工具範本、demo 頁、內部工具介面）時，檢查有沒有「一看就是 AI 做的」通病，例如過度圓角、漸層文字、每段都有 eyebrow 小標、卡片疊卡片、對比不足。使用者說「做網頁／落地頁／demo」「review 這個 HTML」「會不會太像 AI 做的」，或視覺成品要交付前使用。建立品牌 DESIGN.md 時也用來選格式。"
---

# Design Audit（默聲創意的前端設計品質把關）

整理自三個開源專案（2026-07 吸收）：
- **impeccable**：AI 生成前端介面的「一眼假貨」通病清單
- **open-design**：DESIGN.md 的敘事型寫法（和我們用的 Google token 格式互補）
- **graphify**：「建一次索引、查很多次」的效率思維（用在大型檔案）

## 什麼時候用

1. 要產出給客戶看的網頁／HTML（客戶官網、產檔工具的五種方案樣板、demo 頁）。即使使用者沒說要審查，交付前也先自我檢查一次——這類問題自己看不出來，客戶一眼就看得出來。
2. 使用者要 review、檢查，或擔心「太像 AI」。
3. 建立或更新品牌 DESIGN.md，要決定用哪種格式。

## 工作流程

### 產出新設計
1. 草稿完成後，對照 `references/design-smells.md` 的「絕對禁止」和一般規則逐條檢查。
2. 跑一次「AI 一眼假貨測試」（在 design-smells.md 最後）：如果任何人一看就會說「這是 AI 做的」，重做那個部分。
3. 專案已有默聲 DESIGN.md 時（深藍 #151C31、琥珀 #F7B52E、亮黃 #F8CB2A、米 #FEF0C7），優先沿用既有色票與字體，不另外發明視覺語言。客戶案則以該客戶的品牌規範為準。

### 審查既有設計
把 `references/design-smells.md` 當檢查清單逐條核對，依嚴重度分類回報（例如：對比不足＝必修；eyebrow 小標過多＝建議修）。用清單回報，不要整份重寫。

### 建立 DESIGN.md
參考 `references/design-md-formats.md`：
- 給 coding agent 精確套用數值、要跑 lint 驗證 → Google token 格式（`@google/design.md`，默聲主品牌檔使用中）
- 給人看、偏品牌故事／語氣／氛圍的規範（例如客戶視覺提案）→ Open Design 敘事格式（九段式）

### 處理大型既有檔案（數百 KB 的 HTML）
不要每次整檔重讀。先建立檔案結構摘要當作快取，只在需要時深讀特定段落；修改時依 `morcept-harness` 的大檔錨點替換規則。

## 參考檔案

- `references/design-smells.md`：完整通病清單（顏色／字體／版面／動效／互動／絕對禁止）與一眼假貨測試
- `references/design-md-formats.md`：兩種 DESIGN.md 格式的差異和選用時機
