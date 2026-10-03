---
name: design
description: "Comprehensive design skill: brand identity, design tokens, UI styling, logo concepts (55 styles, Canva AI images + hand-written SVG), corporate identity mockups, HTML presentations (Chart.js), banner design, SVG icon design, social photos (HTML to screenshot). Use for logo, CIP, mockups, banners, icons, social media images, brand identity, design system."
license: MIT
metadata:
  argument-hint: "[design-type] [context]"
  author: claudekit
  version: "2.1.0"
---

# Design

## 本環境的路徑說明（2026-10 調整，優先於下文）

下文的指令和範例寫的是 Claude Code 的固定路徑（例如 `~/.claude/skills/<技能名>/`）。在 claude.ai 或 Cowork 上傳的技能，實際安裝位置不同。執行前先找出實際位置：

```bash
SKILL_DIR=$(dirname "$(find / -path '*/design/SKILL.md' -not -path '*/proc/*' 2>/dev/null | head -1)")
SKILLS_ROOT=$(dirname "$SKILL_DIR")   # 其他技能和本技能在同一層
```

下文的 `{skills}/<技能名>/` 就是 `$SKILLS_ROOT/<技能名>/`。找不到要用的技能時，告訴使用者缺哪個技能，不要編造路徑。

## 本環境的生圖方式（2026-10 調整，優先於下文）

本技能原本假設模型自己就能生圖（例如 Codex／ChatGPT 內建的生圖功能）。Claude 沒有內建生圖，所以改用下面的方式。下文提到 generate image、image call、render 等生圖動作時，一律照這裡執行。

1. **Canva 連接器（優先）**：呼叫 Canva 連接器的 `generate-image` 工具。
   - `prompt`：這張圖的完整提示詞（用英文寫，效果較穩定）。
   - `aspectRatio`：網頁區塊用 `LANDSCAPE_16_9` 或 `LANDSCAPE_2_1`；手機畫面用 `PORTRAIT_9_16`；品牌板用 `LANDSCAPE_16_9`；logo 或圖示用 `SQUARE_1_1`。
   - 一次呼叫只生一張。每個區塊或畫面各自呼叫一次，不要合併成一張。
   - 要延續同一套風格時，把前一張圖的 media_id 放進 `imageReferences`。
   - 呼叫後只會拿到 jobId。有顯示預覽元件就不用自己輪詢；沒有的話，用 `get-generate-image-job` 查到 SUCCESS 為止，並附上「Open generated image」連結。
   - 生成完要實際看圖分析之後才往下做，本技能的分析步驟照常適用。
2. **沒有 Canva 連接器，或生圖失敗**：改成交接提示詞。把每張圖的提示詞整理成編號清單，每張一段、可以直接複製，開頭寫一句「請依序為每一段各生成一張圖，不需要先跟我確認」。請使用者貼到 ChatGPT 或 Codex 生圖，再把圖片傳回來；拿到圖片後從分析步驟繼續。
3. 只有在工具回傳 SUCCESS、或使用者已經提供圖片時，才能說圖已經生好。沒看過圖就不要假裝分析過。
4. Canva 生圖會用掉 Canva 帳號的 AI 額度。需要大量生圖（例如 8 張以上）時，先告訴使用者張數再開始。

## 相依技能對照（2026-10 調整，優先於下文）

下文提到的部分技能和服務沒有安裝，改用以下替代：

| 下文提到 | 改用 |
|---|---|
| ai-artist、ai-multimodal、Gemini 生圖（Nano Banana、gemini-*-image） | 上面「本環境的生圖方式」（Canva 連接器） |
| Gemini 產生 SVG 圖示 | 直接撰寫 SVG 程式碼，不需要任何 API |
| chrome-devtools | 環境內可用的瀏覽器工具，或用 Playwright 截圖 |
| frontend-design | design-taste-frontend 或 hallmark 技能 |
| project-management、assets-organizing | 不需要，略過 |
| `/ckm:xxx`、`/ck:xxx` 指令 | 直接讀對應的技能（brand、design-system、ui-ux-pro-max） |
| `GEMINI_API_KEY`、`pip install google-genai` | 不需要；需要 Gemini 的 `generate.py` 腳本預設不使用 |

本地搜尋腳本（各技能裡的 `search.py`、`core.py` 這類 BM25 查詢）不需要 API，可以照常使用。


Unified design skill: brand, tokens, UI, logo, CIP, slides, banners, social photos, icons.

## When to Use

- Brand identity, voice, assets
- Design system tokens and specs
- UI styling with shadcn/ui + Tailwind
- Logo design and AI generation
- Corporate identity program (CIP) deliverables
- Presentations and pitch decks
- Banner design for social media, ads, web, print
- Social photos for Instagram, Facebook, LinkedIn, Twitter, Pinterest, TikTok

## Sub-skill Routing

| Task | Sub-skill | Details |
|------|-----------|---------|
| Brand identity, voice, assets | `brand` | External skill |
| Tokens, specs, CSS vars | `design-system` | External skill |
| shadcn/ui, Tailwind, code | `ui-styling` | External skill |
| Logo creation, AI generation | Logo (built-in) | `references/logo-design.md` |
| CIP mockups, deliverables | CIP (built-in) | `references/cip-design.md` |
| Presentations, pitch decks | Slides (built-in) | `references/slides.md` |
| Banners, covers, headers | Banner (built-in) | `references/banner-sizes-and-styles.md` |
| Social media images/photos | Social Photos (built-in) | `references/social-photos-design.md` |
| SVG icons, icon sets | Icon (built-in) | `references/icon-design.md` |

## Logo Design (Built-in)

55+ styles, 30 color palettes, 25 industry guides. Images via the Canva connector.

### Logo: Generate Design Brief

```bash
python3 {skills}/design/scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"
```

### Logo: Search Styles/Colors/Industries

```bash
python3 {skills}/design/scripts/logo/search.py "minimalist clean" --domain style
python3 {skills}/design/scripts/logo/search.py "tech professional" --domain color
python3 {skills}/design/scripts/logo/search.py "healthcare medical" --domain industry
```

### Logo: Generate with AI

1. Run the design-brief search above to pick style, palette and industry cues.
2. Turn the brief into an image prompt (see `references/logo-prompt-engineering.md`) and generate with the Canva connector `generate-image`, `aspectRatio: SQUARE_1_1`, white background, one call per variant.
3. For a clean, editable logo, also hand-draw the chosen direction as SVG code (simple geometry, 1–2 colors) — generated raster logos are concepts, not final artwork.
4. Ask the user whether they want an HTML preview gallery of the variants.

## CIP Design (Built-in)

50+ deliverables, 20 styles, 20 industries. Mockups via the Canva connector.

### CIP: Generate Brief

```bash
python3 {skills}/design/scripts/cip/search.py "tech startup" --cip-brief -b "BrandName"
```

### CIP: Search Domains

```bash
python3 {skills}/design/scripts/cip/search.py "business card letterhead" --domain deliverable
python3 {skills}/design/scripts/cip/search.py "luxury premium elegant" --domain style
python3 {skills}/design/scripts/cip/search.py "hospitality hotel" --domain industry
python3 {skills}/design/scripts/cip/search.py "office reception" --domain mockup
```

### CIP: Generate Mockups

Use the CIP brief/search output (deliverable, style, mockup scene) to write one prompt per deliverable, then generate each with the Canva connector `generate-image`. If the user has a logo file, upload it to Canva first (`create-upload-url`) and pass its media id in `imageReferences` so the mockup carries the real logo. Generate one deliverable per call (business card, letterhead, signage…).

### CIP: Render HTML Presentation

```bash
python3 {skills}/design/scripts/cip/render-html.py --brand "TopGroup" --industry "consulting" --images /path/to/cip-output
```

**Tip:** If no logo exists, use Logo Design section above first.

## Slides (Built-in)

Strategic HTML presentations with Chart.js, design tokens, copywriting formulas.

Load `references/slides-create.md` for the creation workflow.

### Slides: Knowledge Base

| Topic | File |
|-------|------|
| Creation Guide | `references/slides-create.md` |
| Layout Patterns | `references/slides-layout-patterns.md` |
| HTML Template | `references/slides-html-template.md` |
| Copywriting | `references/slides-copywriting-formulas.md` |
| Strategies | `references/slides-strategies.md` |

## Banner Design (Built-in)

22 art direction styles across social, ads, web, print. Full workflow lives in the `banner-design` skill.

Load `references/banner-sizes-and-styles.md` for complete sizes and styles reference.

### Banner: Workflow

1. **Gather requirements** via `AskUserQuestion` — purpose, platform, content, brand, style, quantity
2. **Research** — Activate `ui-ux-pro-max`, browse Pinterest for references
3. **Design** — Create HTML/CSS banner, generate visuals with the Canva connector
4. **Export** — Screenshot to PNG at exact dimensions with Playwright
5. **Present** — Show all options side-by-side, iterate on feedback

### Banner: Quick Size Reference

| Platform | Type | Size (px) |
|----------|------|-----------|
| Facebook | Cover | 820 x 312 |
| Twitter/X | Header | 1500 x 500 |
| LinkedIn | Personal | 1584 x 396 |
| YouTube | Channel art | 2560 x 1440 |
| Instagram | Story | 1080 x 1920 |
| Instagram | Post | 1080 x 1080 |
| Google Ads | Med Rectangle | 300 x 250 |
| Website | Hero | 1920 x 600-1080 |

### Banner: Top Art Styles

| Style | Best For |
|-------|----------|
| Minimalist | SaaS, tech |
| Bold Typography | Announcements |
| Gradient | Modern brands |
| Photo-Based | Lifestyle, e-com |
| Geometric | Tech, fintech |
| Glassmorphism | SaaS, apps |
| Neon/Cyberpunk | Gaming, events |

### Banner: Design Rules

- Safe zones: critical content in central 70-80%
- One CTA per banner, bottom-right, min 44px height
- Max 2 fonts, min 16px body, ≥32px headline
- Text under 20% for ads (Meta penalizes)
- Print: 300 DPI, CMYK, 3-5mm bleed

## Icon Design (Built-in)

15 styles, 12 categories. Write the SVG directly — icons are XML text, no API needed. Use `references/icon-design.md` for style rules (stroke width, grid, corner radius). Keep a consistent 24×24 viewBox, `stroke="currentColor"` for outlined styles, and export multiple sizes by changing width/height only.

### Icon: Top Styles

| Style | Best For |
|-------|----------|
| outlined | UI interfaces, web apps |
| filled | Mobile apps, nav bars |
| duotone | Marketing, landing pages |
| rounded | Friendly apps, health |
| sharp | Tech, fintech, enterprise |
| flat | Material design, Google-style |
| gradient | Modern brands, SaaS |



## Social Photos (Built-in)

Multi-platform social image design: HTML/CSS → screenshot export. Uses `ui-ux-pro-max`, `brand`, `design-system` skills.

Load `references/social-photos-design.md` for sizes, templates, best practices.

### Social Photos: Workflow

1. **Analyze** — Parse prompt: subject, platforms, style, brand context, content elements
2. **Ideate** — 3-5 concepts, let the user pick
3. **Design** — apply brand + design-system tokens, use ui-ux-pro-max for palette/typography; build HTML per idea × size (generate background visuals with the Canva connector if needed)
4. **Export** — Playwright screenshot at exact px (2x device_scale_factor)
5. **Verify** — look at every exported PNG yourself; fix layout/styling issues and re-export
6. **Report** — short summary of design decisions and file list

### Social Photos: Key Sizes

| Platform | Size (px) | Platform | Size (px) |
|----------|-----------|----------|-----------|
| IG Post | 1080×1080 | FB Post | 1200×630 |
| IG Story | 1080×1920 | X Post | 1200×675 |
| IG Carousel | 1080×1350 | LinkedIn | 1200×627 |
| YT Thumb | 1280×720 | Pinterest | 1000×1500 |

## Workflows

### Complete Brand Package

1. **Logo** → brief search + Canva `generate-image` → Generate logo variants
2. **CIP** → Canva `generate-image` with the logo as reference → Create deliverable mockups
3. **Presentation** → Load `references/slides-create.md` → Build pitch deck

### New Design System

1. **Brand** (brand skill) → Define colors, typography, voice
2. **Tokens** (design-system skill) → Create semantic token layers
3. **Implement** (ui-styling skill) → Configure Tailwind, shadcn/ui

## References

| Topic | File |
|-------|------|
| Design Routing | `references/design-routing.md` |
| Logo Design Guide | `references/logo-design.md` |
| Logo Styles | `references/logo-style-guide.md` |
| Logo Colors | `references/logo-color-psychology.md` |
| Logo Prompts | `references/logo-prompt-engineering.md` |
| CIP Design Guide | `references/cip-design.md` |
| CIP Deliverables | `references/cip-deliverable-guide.md` |
| CIP Styles | `references/cip-style-guide.md` |
| CIP Prompts | `references/cip-prompt-engineering.md` |
| Slides Create | `references/slides-create.md` |
| Slides Layouts | `references/slides-layout-patterns.md` |
| Slides Template | `references/slides-html-template.md` |
| Slides Copy | `references/slides-copywriting-formulas.md` |
| Slides Strategy | `references/slides-strategies.md` |
| Banner Sizes & Styles | `references/banner-sizes-and-styles.md` |
| Social Photos Guide | `references/social-photos-design.md` |
| Icon Design Guide | `references/icon-design.md` |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/logo/search.py` | Search logo styles, colors, industries |
| `scripts/logo/generate.py` | (Gemini, not used by default) |
| `scripts/logo/core.py` | BM25 search engine for logo data |
| `scripts/cip/search.py` | Search CIP deliverables, styles, industries |
| `scripts/cip/generate.py` | (Gemini, not used by default) |
| `scripts/cip/render-html.py` | Render HTML presentation from CIP mockups |
| `scripts/cip/core.py` | BM25 search engine for CIP data |
| `scripts/icon/generate.py` | (Gemini, not used by default) |

## Prerequisites

**Python:** This skill uses Python scripts. On Windows, use `python` instead of `python3` (e.g., `python scripts/logo/search.py` instead of `python3 scripts/logo/search.py`).

Check if Python is installed:
```bash
python3 --version || python --version
```

## Setup

Local search scripts need only Python 3. The Gemini-based `generate.py` scripts are kept for reference but not used by default (no API key needed).

## Integration

**External sub-skills:** brand, design-system, ui-styling
**Related Skills:** ui-ux-pro-max, banner-design, design-taste-frontend, hallmark
