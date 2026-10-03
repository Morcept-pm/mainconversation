# Claude 技能庫（Morcept）

共 38 個技能，每個資料夾都是一個技能（內含 `SKILL.md`）。放在 `.claude/skills/` 下，Claude Code 在這個 repo 裡工作時會自動載入。

## 01 自製技能（已更新）

acceptance-test-generator、ai-handoff-payload、bookmarklet-builder、brand-loading-animation、css-style-extractor、design-audit、enfold-image-to-page、morcept-harness、page-annotation-overlay、project-brief、revision-direction-doc

## 02 第三方（原樣保留）

best-in-world-research、best-in-world-strategy、design-system、design-taste-frontend、gsap-core、gsap-frameworks、gsap-performance、gsap-plugins、gsap-react、gsap-scrolltrigger、gsap-timeline、gsap-utils、hallmark、high-end-visual-design、industrial-brutalist-ui、minimalist-ui、redesign-existing-projects、ui-styling

## 03 第三方（已調整）

banner-design、brand、brandkit、design、image-to-code、imagegen-frontend-mobile、imagegen-frontend-web、slides、ui-ux-pro-max

## 上傳到 claude.ai

claude.ai 的技能要在網頁上傳：Settings → Capabilities → Skills → Upload skill，一次上傳一個 zip。
要重新打包某個技能：在 `.claude/skills/` 執行 `zip -r <技能名稱>.zip <技能名稱>/`。
