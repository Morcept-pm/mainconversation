---
name: brand
description: Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
metadata:
  argument-hint: "[update|review|create] [args]"
  author: claudekit
  version: "1.0.0"
---

# Brand

## 本環境的路徑說明（2026-10 調整，優先於下文）

下文的指令和範例寫的是 Claude Code 的固定路徑（例如 `~/.claude/skills/<技能名>/`）。在 claude.ai 或 Cowork 上傳的技能，實際安裝位置不同。執行前先找出實際位置：

```bash
SKILL_DIR=$(dirname "$(find / -path '*/brand/SKILL.md' -not -path '*/proc/*' 2>/dev/null | head -1)")
SKILLS_ROOT=$(dirname "$SKILL_DIR")   # 其他技能和本技能在同一層
```

下文的 `{skills}/<技能名>/` 就是 `$SKILLS_ROOT/<技能名>/`。找不到要用的技能時，告訴使用者缺哪個技能，不要編造路徑。

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


Brand identity, voice, messaging, asset management, and consistency frameworks.

## When to Use

- Brand voice definition and content tone guidance
- Visual identity standards and style guide development
- Messaging framework creation
- Brand consistency review and audit
- Asset organization, naming, and approval
- Color palette management and typography specs

## Quick Start

**Inject brand context into prompts:**
```bash
node scripts/inject-brand-context.cjs
node scripts/inject-brand-context.cjs --json
```

**Validate an asset:**
```bash
node scripts/validate-asset.cjs <asset-path>
```

**Extract/compare colors:**
```bash
node scripts/extract-colors.cjs --palette
node scripts/extract-colors.cjs <image-path>
```

## Brand Sync Workflow

```bash
# 1. Edit docs/brand-guidelines.md (or use /brand update)
# 2. Sync to design tokens
node scripts/sync-brand-to-tokens.cjs
# 3. Verify
node scripts/inject-brand-context.cjs --json | head -20
```

**Files synced:**
- `docs/brand-guidelines.md` → Source of truth
- `assets/design-tokens.json` → Token definitions
- `assets/design-tokens.css` → CSS variables

## Subcommands

| Subcommand | Description | Reference |
|------------|-------------|-----------|
| `update` | Update brand identity and sync to all design systems | `references/update.md` |

## References

| Topic | File |
|-------|------|
| Voice Framework | `references/voice-framework.md` |
| Visual Identity | `references/visual-identity.md` |
| Messaging | `references/messaging-framework.md` |
| Consistency | `references/consistency-checklist.md` |
| Guidelines Template | `references/brand-guideline-template.md` |
| Asset Organization | `references/asset-organization.md` |
| Color Management | `references/color-palette-management.md` |
| Typography | `references/typography-specifications.md` |
| Logo Usage | `references/logo-usage-rules.md` |
| Approval Checklist | `references/approval-checklist.md` |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/inject-brand-context.cjs` | Extract brand context for prompt injection |
| `scripts/sync-brand-to-tokens.cjs` | Sync brand-guidelines.md → design-tokens.json/css |
| `scripts/validate-asset.cjs` | Validate asset naming, size, format |
| `scripts/extract-colors.cjs` | Extract and compare colors against palette |

## Templates

| Template | Purpose |
|----------|---------|
| `templates/brand-guidelines-starter.md` | Complete starter template for new brands |

## Routing

1. Parse subcommand from `$ARGUMENTS` (first word)
2. Load corresponding `references/{subcommand}.md`
3. Execute with remaining arguments
