# 用 REST API 安全寫入頁面內容

頁面已有正式內容、或用 Advanced Layout Editor 建置過時，優先用這個方法，完全不進編輯器 UI。

## 做法與救援

當目標頁面本來就是用 Advanced Layout Editor（ALE）建置過、且已經有正式內容，需要大幅覆寫全頁短碼時，就算切到「文字」分頁貼上再按「更新」，還是有風險：ALE 會在瀏覽器 `sessionStorage` 快取一份跟資料庫不同步的舊版積木資料；WordPress 的 heartbeat 自動儲存機制（尤其是**草稿**狀態的頁面）也可能在你操作途中，把畫面上當時顯示的內容（可能是空的、半成品、或 ALE 快取的舊版）直接寫回資料庫——一旦誤觸就會整頁清空，而且**不會跳出任何警告**，是這個 skill 目前踩過最嚴重的一種壞法。

**更安全的做法：完全不進頁面編輯器 UI，改用瀏覽器 console 直接呼叫 WordPress REST API 讀寫 `post_content`。**

- 取得授權：從任一個已登入的後台**頁面編輯器**畫面（`wp-admin/post.php?post=X&action=edit`）執行 `window.wpApiSettings.nonce` 取得 nonce（有些後台列表頁，例如選單編輯畫面，不一定有這個全域變數，要用頁面編輯器畫面取）。
- 讀取現有內容：
  ```js
  const res = await fetch('/wp-json/wp/v2/pages/{id}?context=edit', {headers:{'X-WP-Nonce': nonce}});
  const data = await res.json();
  const content = data.content.raw; // 完整短碼原始文字
  ```
- 寫回新內容（整頁或局部修改都適用）：
  ```js
  await fetch('/wp-json/wp/v2/pages/{id}', {
    method: 'POST',
    headers: {'X-WP-Nonce': nonce, 'Content-Type': 'application/json'},
    body: JSON.stringify({content: 新內容}) // 不帶 status：維持頁面原本的狀態
  });
  ```
- **`status` 的處理**：新建或原本就是草稿的頁面，可以帶 `status: 'draft'` 確保不會誤發布；**已經上線的頁面不要帶 `status: 'draft'`**，那會讓線上頁面直接下架。寫入前先看讀取結果裡的 `data.status`。
- 全程都在瀏覽器分頁的 JS context 執行，**完全不用打開任何編輯器 UI**，天然避開 ALE 快取與 heartbeat autosave 的風險。
- 局部修改比整頁重貼更安全：不必每次整頁重寫，可以 `content.indexOf(...)` 找到要改的短碼片段位置，用字串 `slice`/`replace` 做局部編輯後再整段寫回——改壞的範圍也比較小，方便定位問題。
- 每次寫入前，先把要改的**完整比對字串**（marker）用 `indexOf` 確認真的存在、位置正確，再動手拼接，避免因為前一版內容跟預期不同而改錯地方或改壞語法。

**萬一還是不小心把內容清空了**：先查修訂記錄，不一定要從零手動重建：
```
GET /wp-json/wp/v2/pages/{id}/revisions?context=edit
```
WordPress 通常會在每次 REST 更新時自動存一份修訂，可以從舊版本的 `content.raw` 裡用字串搜尋定位、擷取出想要救回的片段（例如某個特定短碼區塊），重組後貼回目前版本，比憑記憶重新手刻可靠很多。
