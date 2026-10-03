---
name: revision-direction-doc
description: "使用者提供初稿（HTML、PPTX、設計圖）和客戶回饋 PDF，要整理成內部用的「修改方向／修改說明」Word 檔時使用。觸發語如「整理修改方向」「客戶回饋整理」「做一份修改說明」「0505修改」「看 PDF 出修改文件」。產出扁平條列式 .docx，含 PDF 局部截圖、重現客戶綠底標註，並回指原 PDF；沒說 Word 也產出 .docx。"
---

# 初稿修改方向文件 (Revision Direction Doc)

## 用途

當客戶針對初稿（網站、視覺、企劃）回饋一份 PDF（含綠底高亮、紅圈、文字註解），使用者希望快速產出一份**內部用的修改方向文件**時使用本 skill。

讀者通常是設計／工程／PM。文件的功能是「讓他們看一眼就知道要動哪裡」，**不是**重抄客戶 PDF 內容。

---

## 設計理念（為什麼這樣寫）

過去團隊常犯兩個極端：寫太細（變成把 PDF 抄一遍，沒加值）、或寫太粗（只列項目，缺視覺脈絡）。本 skill 採用以下折衷：

1. **不重抄 PDF**：細節文案、位置、內容請讀者直接看原 PDF。本文件只提綱挈領。
2. **架構用文字、視覺用圖**：
   - 客戶調整**分類／IA／選單層級** → 用巢狀條列文字呈現比截圖直覺
   - 客戶調整**樣式／版型／視覺** → 一句話 + 附 PDF 局部截圖
3. **客戶綠底標註是核心**：客戶在 PDF 中以綠底高亮的字句通常是「最具體、最不可妥協的要求」，必須**逐條重現為綠底 bullet**，並各自附上對應頁面截圖。
4. **扁平勝於分大段**：不要用 H1/H2 章節切割 — 一個文件標題 + 一串巢狀 bullet + 內嵌圖即可。讀者要能 30 秒掃過。

---

## 工作流程

### 第一步：蒐集輸入

確認三類檔案：
- **初稿檔**：.html / .pptx / .png / 截圖
- **客戶回饋 PDF**：含綠底高亮、註解
- **（選用）團隊撰寫範例**：用來判斷標題格式（如 `MMDD修改N`）與用語慣例

### 第二步：細讀 PDF，找出綠底標註

讀 PDF 時要看到頁面圖像（綠底高亮只存在於視覺上，純文字擷取會漏掉）。逐頁紀錄：

- 客戶以**綠底高亮**的字 → 必須在文件中以綠底 bullet 重現
- **結構／架構**改動（新版選單、區塊順序）→ 用文字條列呈現
- **視覺／樣式**改動（如「不要 Z 字形 banner」、「icon 小一點」）→ 一句話 + PDF 截圖
- 客戶**沒標但提到**的圖片來源、待補資訊 → 列入文件中以提醒

### 第三步：把 PDF 頁面轉為可嵌入的圖片

```bash
# 1. PDF → 全頁 PNG（110 dpi 足夠閱讀）
mkdir -p pdf_pages
pdftoppm -r 110 -png "<原 PDF 路徑>" pdf_pages/p

# 2. 視需要裁切局部（如 banner 樣式區、最新消息 mockup、icon 區）
convert pdf_pages/p-02.png -crop 1100x700+80+260 +repage banner_sample.png

# 3. 並排雙圖（呈現「列表頁 + 內頁」對照效果佳）
convert news_list.png news_detail.png -gravity center +append -resize 1800x news_combined.png
```

裁切座標需依各 PDF 排版微調，PNG 預設約 1238 × 2200。

### 第四步：產出 docx

使用 `scripts/build_revision_doc.js`（Node + docx-js）作為起點。腳本裡的 children 陣列是一份真實案例的示範內容，複製到輸出目錄後要整段換成這次的內容。執行方式：

```bash
cd <output dir>
npm install docx
node build_revision_doc.js <輸出 .docx 路徑>
```

腳本內已預先設計：
- 三層巢狀條列（●／○／■）
- 綠底高亮樣式（fill `D9EAD3`、文字色 `274E13`）
- 圖片自動依 PNG 原比例縮放至指定寬度
- 微軟正黑體 22pt 內文

實際撰寫時，**修改腳本中的 children 陣列**，依下方文件骨架填入內容。

### 第五步：驗證

如果環境裡有 docx skill，用它附的驗證腳本（路徑依環境而定，通常在 docx skill 資料夾的 `scripts/office/validate.py`）：

```bash
python3 <docx skill 路徑>/scripts/office/validate.py "<輸出.docx>"
```

確認 `All validations PASSED!`。沒有驗證腳本時，至少用 `python3 -c "import zipfile; zipfile.ZipFile('輸出.docx').testzip()"` 確認檔案結構完整，並把 docx 轉成 PDF 或圖片看一次版面。常見問題：

- 若使用 `ExternalHyperlink` 連到本地 PDF 檔名（無 https），會產生 broken relationship → 改用純文字加底線藍色（`TextRun({ underline, color: '1155CC' })`）模擬即可。

### 第六步：交付

命名建議 `MMDD修改N_<專案名>_修改方向.docx`。依當下環境的交付方式提供檔案：有連接使用者的資料夾就存進去，否則用環境提供的檔案分享方式交付。

---

## 文件骨架（依此順序填入 build script 的 children 陣列）

```
標題：MMDD修改N（如「0505修改1」，無框、粗體、約 32pt）

● 客戶提供　📄 0505修改.pdf（連結樣式，純文字底線藍）
● 圖片更新　🖼 網站圖片（說明圖片來源／是否客戶後續補）
● 主分類架構調整：
  ○ 首頁
    ■ 區塊依序為：A、B、C、D…
  ○ 公司介紹
    ■ 區塊依序為：…
  ○ ……
  ○ 中/英文
● <視覺重點 1，例：Banner 改為單一版面，取消 Z 字形排版>
  [內嵌 banner 樣式截圖]
● <視覺重點 2，例：僅最新消息頁面需調整，其餘版型與背景依初稿不變>
  [內嵌列表頁 + 內頁並排截圖]
● <整體性原則，例：圖片全數移除>

＊ 客戶於 PDF 中綠底標註之重點：（粗體、綠色 24pt）
● <綠底 bullet 1>
  [對應 PDF 頁面截圖]
● <綠底 bullet 2>
● <綠底 bullet 3>
  [對應 PDF 頁面截圖]
● ……

其他頁面文案內容與細節請參考 0505修改.pdf。（灰色、22pt）
```

---

## 撰寫風格小抄

- 標題後直接條列，**不分大段**（不用 H2 切章節）
- bullet 層級：● → ○ → ■（已在 build script 設定 LevelFormat.BULLET）
- 客戶綠底重點：`ShadingType.CLEAR` + `fill: 'D9EAD3'` + 文字色 `274E13`
- 連結色：`1155CC` + 單線底線
- 註解／補充文字：灰色 `595959`、字級略小（20pt）
- 內嵌圖片寬度：480px（單張）／540px（並排雙圖）／280px（icon 局部）
- 字體：微軟正黑體 22pt（中英混排都讀得舒服）

---

## 互動建議：產出前可先問使用者

挑 1–2 題問即可，避免一次轟炸：

- 文件命名格式偏好？（如 `MMDD修改N` 或 `YYYYMMDD修改N_專案名`）
- 圖片要保留 PDF 標註痕跡（綠底、紅圈）還是只取乾淨截圖？
- 要不要在文件末加「待客戶確認事項」清單？
- 客戶 PDF 中的「待補欄位／空白格」要不要在文件中提醒？

---

## 不適用情境（請改用其他 skill）

- 客戶回饋是 Slack / Email 純文字 → 改用 `project-brief` 或一般 docx
- 要產出**完整版型新規格**（不是修改方向） → 改用 `project-brief`
- 要產出可勾選的驗收清單 → 改用 `acceptance-test-generator`
- 要逐字對照新舊文案差異 → 改用「原本→改為」對照表式文件
