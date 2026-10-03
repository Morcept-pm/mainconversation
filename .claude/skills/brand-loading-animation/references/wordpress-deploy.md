# WordPress 部署：HFCM、Elementor Custom Code、demo 轉正式版、WPML

部署前先判斷網站用的是 HFCM 還是 Elementor Pro。先上單一測試頁，確認後才轉全站正式版。

## 用 HFCM 外掛注入（Enfold 等一般 WordPress 站）

**核心結論：loading 動畫這種「純前端、要蓋滿全螢幕、不需要跟 WordPress 資料庫內容整合」的程式碼，一律用 Header Footer Code Manager（HFCM）外掛注入，不要寫進頁面的 `post_content`。** 這是踩過三種坑之後得到的結論：

1. **不要用 `av_codeblock` 短碼**：Enfold 的 `av_codeblock` 短碼實際上依賴視覺化編輯器同步過去的 postmeta，不是短碼本身內容決定渲染結果。透過 REST API 直接把 `[av_codeblock]原始碼[/av_codeblock]` 寫進 `post_content`，前台會渲染出字面上的 `[avia_codeblock_placeholder uid="0"]` 文字，程式碼不會執行。
2. **不要把原始 HTML/CSS/JS 直接寫進 `post_content`**：WordPress／Enfold 的內容過濾器（wpautop 類機制）會在你意想不到的地方（甚至 `<style>`／`<script>` 標籤中間）插入 `<p>` 標籤，把 CSS/JS 字串弄斷。這個壞法很難查，畫面看起來像動畫「完全沒套用」，實際上是樣式表被腰斬。判斷方法：用瀏覽器 CSSOM (`document.styleSheets` 找對應規則是否存在) 或 `getComputedStyle()` 檢查關鍵屬性（例如 `position` 是否真的是 `fixed`）來確認，不要只看畫面。
3. **改用 HFCM**：HFCM 的程式碼片段完全繞開 WordPress 的內容過濾器，是唯一乾淨可靠的注入方式。操作方式：
   - 後台左側選單「HFCM → 新增程式碼片段」。
   - 程式碼片段類型選「HTML」（一份檔案裡同時放 `<style>` + 標記 + `<script>` 即可，不用分開建 CSS/JS 片段）。
   - 套用範圍先選「指定頁面」，只勾測試用的草稿頁；之後要轉正式版再改「整個網站」。
   - 插入位置：測試階段用「footer 標籤區段」沒問題；要當作真正的全站 loading page，改選「head 標籤區段」（理由見本檔「單頁 demo → 全站正式版」）。
   - 程式碼貼在 CodeMirror 編輯器裡，可以用瀏覽器 JS 直接操作：`document.querySelector('.CodeMirror').CodeMirror` 拿到 editor 實例，`cm.setValue(code); cm.save();` 寫入內容，比在畫面上手動貼字串可靠、也比較快。
   - **HFCM「頁面清單」欄位的自動完成輸入框在部分版本是壞的**：畫面上看起來像正常的搜尋輸入框，但打字不會連動到底層真正送出的 `<select name="data[s_pages][]">`。如果自動完成不管用，直接用 JS 建立 `<option value="頁面ID" selected>` 塞進那個 select、再 dispatch 一個 `change` 事件，存檔後用 `Array.from(sel.selectedOptions).map(o=>o.value)` 確認選取有沒有真的存進去。
   - **不要同時用兩種方式注入同一段動畫**：如果已經設定 HFCM 自動套用到某頁，就不要再手動把 `[hfcm id="X"]` 短碼貼進那頁的 `post_content`，否則同一段 loading overlay 的 markup（含重複的 `id`）會被注入兩次。

## 沒有 HFCM 的網站（Elementor Pro）：用 Custom Code

不是每個客戶網站都裝 HFCM。實際遇過的狀況：後台裝的是 Elementor Pro（不是 Enfold），完全沒有 HFCM 這個外掛。這種情況下：

1. **Elementor 本身（不管免費版還是 Pro 版）沒有原生的「loading page／載入畫面」功能**，不要在設定裡到處找一個不存在的開關。
2. **Elementor Pro 有功能對等的替代方案：Custom Code**。路徑是後台側邊欄「Elementor → 範本 → Custom Elements → Code」（網址型式：`wp-admin/edit.php?post_type=elementor_snippet`）。用法跟 HFCM 幾乎一樣：新增一筆程式碼片段、貼上整份 `<style>+markup+<script>`、設定「位置」（`<head>` / `<body> - Start` / `</body> - End`，loading 動畫建議選 `<body> - Start`，理由跟 HFCM 選 head 讓瀏覽器把內容搬到 body 最前面是同樣的道理——這裡則是直接就有 body-start 的選項，不用繞一手）、再用右側「Conditions」欄位設定要套用在哪些頁面（Entire site / 文章列表 / 單頁，單頁底下可再選 All singular / Front page / 指定頁面 / by author 等）。
3. **先判斷網站用的是 HFCM 還是 Elementor Custom Code**，兩者操作介面、程式碼片段清單位置都不一樣，不要預設對方一定有 HFCM。判斷方式：後台外掛清單看有沒有 "Header Footer Code Manager"，或直接找左側選單裡有沒有獨立的「HFCM」項目；如果是 Elementor 站，找「Elementor → 範本 → Custom Elements → Code」。
4. 部署前如果只是要「進去看一下」而不是要動手改，記得只用瀏覽器 JS 讀取頁面上既有元素（例如程式碼片段清單、下拉選單的 `<option>`）做唯讀查詢，不要用 JS 去 `dispatchEvent` 改動任何表單欄位的值——這類「改表單欄位」的自動化動作在部分環境會被權限分類器擋下（見 lessons.md），純讀取不會被擋。

### 給使用者的操作說明範本（後台不熟悉時，用簡單文字說明操作路徑）

如果使用者對後台操作不熟，被問到「我要怎麼把這個貼上去」「後台要做哪些操作」時，不要假設對方知道術語，直接給步驟：

1. 後台找到程式碼片段管理介面（HFCM 是「HFCM → 新增程式碼片段」；Elementor 是「Elementor → 範本 → Custom Elements → Code → New code」），把準備好的一整份程式碼**整段**貼進去（`<style>` 到最後一個 `</script>` 全部都要，不是只貼中間某一段）。
2. 選好「插入位置」（loading page 選 body 最前面／head，讓它比網站正常內容更早顯示）跟「套用範圍」（先「指定頁面」測試，滿意後再改「整個網站」）。
3. 存檔／發佈。
4. 提醒使用者：**交付正式版前務必先問清楚使用者拿到的是「測試 demo 版」還是「正式版」程式碼**——demo 版通常還留著「重播動畫」按鈕跟一段說明文字，這些是給人在後台反覆確認效果用的，不能真的貼上正式網站；正式版才是乾淨、沒有任何示範用 UI 的版本（見本檔「單頁 demo → 全站正式版」）。如果使用者已經把 demo 版整份貼上去了，看到多出來的按鈕/文字很合理會覺得奇怪，要主動說明並補一份正式版檔案給對方替換。

## 單頁 demo → 全站正式版

單頁測試版跟全站正式版，程式碼邏輯完全不同，不是「把套用範圍改成整個網站」就結束，實際上有三處要一起改：

1. **拿掉測試用 UI**：單頁 demo 通常會有「重播動畫」按鈕跟一段給使用者看的說明文字（h1/p/button），這些是為了方便使用者反覆確認效果才加的，正式版全站套用時必須整段拿掉——不然全站每一頁都會冒出一顆測試按鈕跟一段內部備註文字。
2. **觸發時機從固定計時器改成真正偵測頁面載入完成**：demo 版通常用 `setTimeout(hideLoader, 2200)` 這種固定秒數，方便展示；正式版要改成監聽 `window.addEventListener('load', ...)`，同時做兩件事保護體驗：
   - 設一個 `MIN_VISIBLE`（例如 1300ms）下限，確保頁面秒開時動畫至少把組裝過程播完，不會被瞬間截斷；
   - 設一個 `MAX_WAIT`（例如 6000ms）上限，避免萬一 `load` 事件因為某些資源卡住遲遲不觸發，導致 loading 畫面卡死擋住整個網站。
   - 兩個條件都用旗標變數（`pageLoaded` / `minTimeDone`）各自非同步更新，最後統一判斷「兩者都滿足才收起」，不要只靠單一 `setTimeout`。
3. **CSS/JS 全部重新命名空間，不要沿用單頁測試版的 id/class**：單頁版常常會用頁面 ID 當前綴（例如 `bpdemoOverlay743`），這是為了避免跟同一頁其他測試元件衝突；轉正式版時因為要套用到「所有頁面」，用頁面 ID 命名反而語意不對，應該換成一個穩定、跟頁面無關的命名空間（例如 `mcloadOverlay` / `mcload-*`），同時要記得 JS 裡所有字串常數也要一起改，不要漏改（漏改會變成 CSS 類名跟 JS 操作的類名對不起來，動畫完全沒反應但又找不到原因）。

**插入位置為什麼正式版建議選「head 標籤區段」而不是「footer 標籤區段」**：HFCM 的「footer 標籤區段」是掛在 `wp_footer` hook，實際輸出位置在整個頁面主要內容（含網站真正的 header/導覽列）都已經寫進 HTML 之後。雖然 loading overlay 用 `position:fixed` 蓋滿全螢幕，視覺上通常還是能蓋住，但因為它在原始碼順序上排在真正內容「之後」，理論上在網速很慢時有極小機率讓瀏覽器先畫出一瞬間的真實頁面才蓋上動畫，不是真正意義上的「最先出現」。改選「head 標籤區段」（掛在 `wp_head`）雖然語意上是插進 `<head>`，但因為 `<div>` 不是 `<head>` 允許的內容，瀏覽器的 HTML5 解析規則會自動把它「搬」到 `<body>` 最開頭、比網站自己的 header/導覽列還早，這樣才是真正保證動畫永遠最先蓋住畫面、不會有任何 FOUC（畫面閃現）風險的做法。

**額外保護**：正式版建議在動畫顯示期間鎖住捲動（例如 `html.mcload-active { overflow:hidden }`，動畫收起時移除這個 class），避免使用者在動畫播放的一兩秒內誤觸捲動。

## 多語言網站（WPML）：只在特定語言顯示

如果目標網站用 WPML 做多語言（尤其是「不同語言掛不同網域」的設定，例如中文版在 `brand.com`、日文版在完全獨立的網域 `brand.co.jp`，但後台其實是同一套 WordPress／同一個資料庫），而使用者要求「loading page 只要在某一個語言版本出現就好」，會踩到一個不容易發現的坑：

**根本原因**：WPML 對 Elementor 的「顯示條件」（不管是 Theme Builder 樣板還是 Custom Code／HFCM 這類的「Conditions」設定）有內建的跨語言同步機制——只要條件鎖定「指定頁面 #X」，WPML 會自動把同一條規則也套用到頁面 #X 在其他語言的翻譯版本上（例如中文首頁跟日文首頁在 WPML 裡是同一組翻譯關係的兩個不同 post ID）。**這個同步是雙向對稱的**：不管你把條件設成中文首頁的 ID 還是日文首頁的 ID，兩個語言版本都會一起生效，沒有辦法只鎖住其中一個。實測驗證方法：改條件後，直接用瀏覽器 JS 分別開兩個語言版本的網址，檢查 `document.getElementById('你的overlay id')` 是否存在、`document.body.className` 裡的 `page-id-xxx` 是哪個 ID，兩邊都測過一輪，不要只測其中一個語言就下結論。

**已確認無效的做法**：Elementor 的 Conditions 下拉選單本身（Entire site / 文章列表 / 單頁，單頁底下的 All singular / Front page / 指定頁面 / by author 等）完全沒有「語言」這個篩選維度，不管怎麼在這個 UI 裡選都繞不開 WPML 的跨語言同步，不用一直在這個選單裡找解法。

**修法：改用「網域判斷」取代「頁面 ID 條件」**。如果不同語言剛好是掛在不同網域（多數 WPML「domain per language」的站台都是這樣設定），最可靠的做法是放棄用 Elementor/WPML 的頁面條件去限制範圍，改成：條件設定保持寬鬆（例如「Entire site」或「Front page」，讓它在所有語言都能載入），但在程式碼本身最前面加一段網域判斷，不符合目標網域就直接整個移除 overlay、不執行後續動畫邏輯：

```js
(function(){
  var overlay = document.getElementById('你的overlay id');
  if (!overlay) return;
  if (!/你的目標網域\.co\.jp$/.test(location.hostname)) { overlay.remove(); return; }
  // ...原本的動畫啟動邏輯...
})();
```

要點：
- 這一行判斷要放在「拿到 overlay 變數」之後、「加上任何 active/鎖捲動 class」之前，如果順序反了（例如先加了 `html.classList.add('xxx-active')` 才判斷網域），會導致不該出現動畫的頁面雖然沒看到 overlay，但捲動被鎖住一段時間，變成另一種使用者看不見原因的怪異體驗。
- `overlay.remove()` 要用「整個移除」而不是只做 `display:none`，因為如果只是隱藏，原本 `MIN_VISIBLE`/`MAX_WAIT` 那些計時器邏輯還是會繼續跑（雖然使用者看不到，但徒增不必要的 JS 執行跟少量 layout 成本），移除整個節點比較乾淨。
- 因為插入位置通常是「body 最前面」，這段判斷式是頁面最早執行的程式碼之一，`overlay.remove()` 發生在瀏覽器有機會畫出這個節點之前，不會有畫面閃一下又消失的問題，不需要額外用 `document.write` 之類更早期的技巧去搶時間。
- 這個修法只需要改動「既有程式碼裡的一小段」，不要整份重寫——先用瀏覽器讀出目前程式碼編輯器（CodeMirror）裡的內容定位插入點（例如搜尋 `getElementById('overlay id')` 那一行在第幾行），再做最小範圍的插入，改完存檔後一樣要照上面「實測驗證方法」把兩個語言版本都重新檢查一次。

## 部署後驗證清單

1. 用瀏覽器 JS 檢查目標元素是否真的存在、class 狀態是否正確，例如：
   ```js
   document.getElementById('你的overlay id') // 應該存在
   getComputedStyle(overlay).position // 應該是 "fixed"
   ```
2. 檢查有沒有殘留舊版測試內容：搜尋 `document.body.innerHTML` 裡有沒有舊命名空間前綴的字串殘留（代表新舊版本混雜、沒有徹底取代）。
3. 檢查套用範圍是否正確：拿一個「非測試頁」的其他頁面（例如首頁或任一篇文章）實際打開檢查，確認全站套用時真的每頁都有、單頁測試時真的只有那一頁有、沒有的頁面也要確認真的沒有（避免誤判「範圍設定生效」）。
4. 實際體感看一次動畫：用強制重新整理（`cmd+shift+r` / `ctrl+shift+r`）避開瀏覽器快取，仔細看頁面載入的頭一兩秒，不要只看動畫結束後的靜態畫面就判斷「沒作用」——全站正式版動畫通常一兩秒內就會自動播完收起，用一般整理或截圖時機不對很容易誤以為沒生效。
5. 用 DOM 順序確認插入位置是否符合預期（例如比對 `document.body.children` 陣列中，你的 overlay 元素排在網站真正 header 元素之前還是之後），不要只看後台下拉選單顯示的文字，要用前台實際結果驗證。
