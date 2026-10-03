---
name: brand-loading-animation
description: "默聲創意要把品牌 logo 或識別圖案（含帶文字的 lockup／wordmark）做成 loading page／進場動畫，並部署到 WordPress（Enfold+HFCM 或 Elementor Pro）時使用，包含 WPML 多語言站只在特定語言顯示的情況。觸發語如「幫我做 loading page」「logo 做成進場動畫」「先做幾個方向給我看」「放到網站上試試」「改成全站正式版」「網站沒有 HFCM」「兩個語言都出現了」。"
---

# 品牌 Logo → Loading Page 動畫（設計 → Demo → WordPress 部署）

從「有靈感」到「穩定跑在客戶 WordPress 上」有三層容易出包：
1. 客戶通常只有 PNG，直接拿 PNG 做動畫只能整張位移，做不出部件分別組裝的效果。
2. 動畫方向是品味判斷，悶頭做一版丟出去很容易白做。
3. WordPress／Enfold 有好幾個「看起來對、其實沒生效或被改壞」的注入陷阱。

這個 skill 記錄三層都走過一次的做法。細節在 references/，需要時再讀。

## 流程（照順序）

1. **只有 PNG → 先重建成可動畫的 SVG**，存成共用 JSON。帶文字的 lockup，文字也走向量化，**不能用網頁字型代替**（客戶要的是和原圖一模一樣）。→ `references/svg-vectorize.md`
2. **先用文字討論方向，再做 demo。** 列 2–3 個方向的文字描述讓使用者選（例如藍圖構成、描邊顯影、呼吸循環），選定才動手。→ `references/animation-patterns.md`
3. **做成獨立的 demo HTML**，在本機把動畫做對、做順，再往 WordPress 放。在 WordPress 裡邊除錯邊改動畫很慢。
4. **使用者說「先放上去試試」→ 只部署到一個測試頁。** 先判斷網站是 HFCM 還是 Elementor Pro，範圍設「指定頁面」，保留一顆「重播動畫」按鈕方便反覆確認。→ `references/wordpress-deploy.md`
5. **使用者確認滿意、要正式 loading page → 才轉全站版。** 三處要一起改：拿掉測試 UI、改成偵測真正載入完成（加最短顯示和最長等待時間）、CSS/JS 命名空間和頁面 ID 脫鉤。→ `references/wordpress-deploy.md`「單頁 demo → 全站正式版」
6. **WPML 多語言站只想在某個語言顯示 → 用網域判斷，不用頁面 ID 條件**（WPML 會把頁面條件同步到所有語言的翻譯頁）。→ `references/wordpress-deploy.md`「多語言網站」
7. **使用者要影片檔** → 用 Playwright 錄製再轉 mp4。→ `references/video-export.md`

## 部署的關鍵規則

這些是踩過坑後的結論（完整紀錄在 `references/lessons.md`）：

- **用 HFCM（或 Elementor Pro 的 Custom Code）注入，不要寫進頁面的 `post_content`。** `av_codeblock` 短碼會渲染成字面上的 placeholder；直接寫 `<style>/<script>` 會被 wpautop 插入 `<p>` 腰斬，畫面看起來只是「沒套用」。
- **不要同一段動畫用兩種方式注入**（HFCM 自動套用＋手動貼 `[hfcm]` 短碼），會出現重複的 id。
- **正式版插入位置選 head（HFCM）或 body - Start（Elementor）**，讓 overlay 排在網站 header 之前，避免慢網速時先閃出真實頁面。
- **交付程式碼時講清楚是「測試 demo 版」還是「正式版」。** demo 版的重播按鈕和說明文字不能上正式站。
- **改後台表單欄位的自動化操作可能被權限機制擋下。** 卡住時請使用者自己點那 1–2 個下拉選單，再用唯讀 JS 檢查前台結果。

## 驗證（不要只看截圖）

部署後用瀏覽器 JS 檢查：overlay 元素存在、`getComputedStyle(overlay).position === 'fixed'`、沒有舊命名空間殘留、非測試頁的套用狀態正確、DOM 順序在 header 之前。強制重新整理後看頭一兩秒的實際播放。完整清單在 `references/wordpress-deploy.md` 最後一節。

## 不適用的部分

- 客戶已有乾淨的分層向量檔：跳過第 1 步。
- 網站不是 WordPress，或既沒有 HFCM 也不是 Elementor Pro：部署那段不適用，但向量化、動畫設計、demo 轉正式版的邏輯照樣通用，改用其他方式掛進網站（改主題檔或請工程師串接）。
- 不是多語言站：跳過網域判斷。
