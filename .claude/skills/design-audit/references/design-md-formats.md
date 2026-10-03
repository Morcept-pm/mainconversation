# DESIGN.md 兩種格式怎麼選

默聲目前已經有一份用 Google `@google/design.md` 格式建立的主品牌 DESIGN.md（2026-07-07，已通過 lint 驗證）。以下整理另一種常見格式，供之後視情況選用。

## 格式一：Google token 格式（`@google/design.md`）— 目前默聲主品牌檔用的格式

**結構**：YAML front matter（機器可讀 token：colors / typography / rounded / spacing / components）+ Markdown 說明文字。

**適合場合**：
- 需要給 coding agent 精確套用「數值」（hex 色碼、確切字級、間距 px 值）
- 需要跑 CLI lint 驗證正確性、對比度、token 有沒有斷掉的引用
- 需要匯出成 Tailwind config 或其他程式可讀格式

**指令**：
```bash
npx @google/design.md lint DESIGN.md
npx @google/design.md export --format css-tailwind DESIGN.md
```

**章節順序**（出現的話必須照此順序）：Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts

## 格式二：Open Design 敘事格式

**結構**：純 Markdown，H1 品牌名稱 + 一段引言（類別＋一句話定位）+ 編號 H2 段落，沒有強制的 YAML token 層，比較像「品牌創意簡報」而非「程式規格」。

**典型段落**：
```
# Design System Inspired by <品牌名稱>

> 類別：<例如 E-Commerce & Retail>
> <一句話定位>

## 1. Visual Theme & Atmosphere（視覺氛圍）
## 2. Color Palette & Roles（色彩與角色）
## 3. Typography（字體）
## 4. Layout & Spacing（版面與間距）
## 5. Components（元件）
## 6. Motion & Interaction（動效與互動）
## 7. Iconography & Imagery（圖示與影像風格）
## 8. Voice & Tone（語氣）
## 9. Edge Cases & Variations（邊界案例）
```

**適合場合**：
- 給客戶看的品牌提案文件，需要偏故事性/情境描述（例如某客戶案的「這個網站給人的感覺」）
- 不需要程式化 lint 驗證，段落順序也相對寬鬆（只要求跟其他參考系統有結構上的重疊，不強制逐字對應標題）
- 需要涵蓋「語氣（Voice & Tone）」「圖示風格」「邊界案例」這些 Google 格式沒有明確涵蓋的敘事類別

## 建議用法

- **默聲主品牌規範**（放在 Claude Code 專案根目錄給 agent 讀）→ 繼續用 Google token 格式，維持可 lint 驗證的精確性。
- **個別客戶案的品牌提案文件**（例如要跟 GEROX、Gitek 客戶溝通「這個網站設計走什麼調性」）→ 可以考慮用 Open Design 敘事格式的段落架構，補充默聲 token 格式沒有的「Voice & Tone」「Iconography & Imagery」等敘事類別，讓提案文件更容易讓非技術背景的客戶理解。
- 兩種格式不衝突，甚至可以並存：程式讀 Google 格式的 token，人讀 Open Design 格式的敘事說明。
