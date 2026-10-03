# Enfold 短碼對照表（常見效果怎麼做）

## 對照表

實際拆解過一個由設計師手工做好的 Enfold 網站得到的結論：多數「看起來像特效」的區塊其實是主題原生元件，不需要額外外掛或自訂程式碼。遇到以下畫面特徵，對應用這些元件：

| 畫面特徵 | 用的元件 | 重點屬性 |
|---|---|---|
| 滿版大圖 + 文字/按鈕疊加的首圖（即使只有一張圖也算） | `av_slideshow_full` 包 `av_slide_full`，裡面可以再放 `av_layout_row` / `av_cell_one_half` 疊文字 | `slide_type='image'`，圖用 `src` 網址或媒體庫 `id` 附件編號都可以 |
| 明顯的倒數計時數字（DAYS / HOURS / MINUTES） | `av_countdown`（原生元件，不是外掛） | `date='DD / MM / YYYY' hour='' minute='' timezone='Asia/Taipei'` |
| 一排卡片可以左右滑動，有箭頭或圓點分頁 | `av_content_slider` 包多個 `av_content_slide`（每個 slide 內容直接寫原生 HTML `<img><h4>文字`，不用再包短碼） | `columns='4' navigation='arrows'` |
| 純粹一排 logo（廠商/合作單位），可能會自動輪播 | `av_partner` 包多個 `av_partner_logo` | 靜態排列用 `type='grid'`；會自動滑動用 `type='slider' autoplay='true' interval='5'` |
| 「最新消息」這類會持續新增的清單 | `av_magazine`，串接 WordPress 文章分類，**不是手寫內容** | `link='category,分類ID' items='2'` |
| 需要真正送出資料的表單（聯絡我們、訂閱） | `av_codeblock` 包 Contact Form 7 外掛短碼 | `[contact-form-7 id="xxx" title="表單名稱"]`，需要對方後台已安裝 Contact Form 7 外掛，AI 不需要自己生表單邏輯 |
| 多欄圖示＋文字（例如四色塊功能列） | `av_layout_row` 包多個 `av_cell_one_half`／`av_cell_one_third` 等，各自設 `background_color`，裡面放 `av_image` + `av_heading` | 每欄底色不同就在對應 cell 各自設定 `background_color` |
| 不規則對角線 / 手繪形狀分割的視覺 | **通常不是短碼能生出來的**，是設計師另外做好的透明背景 PNG／SVG 素材疊上去的 | 遇到這種效果就跟使用者說明「需要設計提供帶透明背景的形狀素材圖」，不要嘗試用純色塊硬湊相似效果 |
