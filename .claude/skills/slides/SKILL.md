---
name: slides
description: Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
metadata:
  argument-hint: "[topic] [slide-count]"
  author: claudekit
  version: "1.0.0"
---

# Slides

## 本環境的路徑說明（2026-10 調整，優先於下文）

下文的指令和範例寫的是 Claude Code 的固定路徑（例如 `~/.claude/skills/<技能名>/`）。在 claude.ai 或 Cowork 上傳的技能，實際安裝位置不同。執行前先找出實際位置：

```bash
SKILL_DIR=$(dirname "$(find / -path '*/slides/SKILL.md' -not -path '*/proc/*' 2>/dev/null | head -1)")
SKILLS_ROOT=$(dirname "$SKILL_DIR")   # 其他技能和本技能在同一層
```

下文的 `{skills}/<技能名>/` 就是 `$SKILLS_ROOT/<技能名>/`。找不到要用的技能時，告訴使用者缺哪個技能，不要編造路徑。


Strategic HTML presentation design with data visualization.

## When to Use

- Marketing presentations and pitch decks
- Data-driven slides with Chart.js
- Strategic slide design with layout patterns
- Copywriting-optimized presentation content

## Subcommands

| Subcommand | Description | Reference |
|------------|-------------|-----------|
| `create` | Create strategic presentation slides | `references/create.md` |

## References (Knowledge Base)

| Topic | File |
|-------|------|
| Layout Patterns | `references/layout-patterns.md` |
| HTML Template | `references/html-template.md` |
| Copywriting Formulas | `references/copywriting-formulas.md` |
| Slide Strategies | `references/slide-strategies.md` |

## Routing

1. Parse subcommand from `$ARGUMENTS` (first word)
2. Load corresponding `references/{subcommand}.md`
3. Execute with remaining arguments
