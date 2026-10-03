# 動畫轉影片檔（給客戶參考／分享用）

## 錄製流程

如果使用者要一份 `.mp4` 而不是活的網頁動畫（例如要分享給不會自己開網站後台的人看效果），用 Playwright 直接錄製動畫實際播放過程最可靠，不要用「截圖拼幀」這種間接做法：

1. 準備一個乾淨的 HTML 頁面（不要有多餘的展示用文字/按鈕/邊框，背景就用動畫本身預期的底色），用 Playwright 的 `browser.new_context(record_video_dir=..., record_video_size={"width":1280,"height":720})` 開一個 context、載入頁面、等動畫實際播放完（用固定秒數或等某個「動畫已結束」的 class/flag 出現），再關閉 context——Playwright 會在 `record_video_dir` 產生一支 `.webm`。
2. 用 ffmpeg 轉成通用相容的 `.mp4`：`ffmpeg -i input.webm -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow -movflags +faststart output.mp4`，`+faststart` 讓檔案在瀏覽器/聊天工具裡可以邊下載邊播放，不用等下載完。
3. 先確認環境裡有沒有預裝的瀏覽器（例如檢查 `PLAYWRIGHT_BROWSERS_PATH` 環境變數，或執行 `which chromium`）。已預裝就直接用，不要重新執行 `playwright install` 下載；沒有才安裝。
