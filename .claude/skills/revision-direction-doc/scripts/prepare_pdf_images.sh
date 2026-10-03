#!/usr/bin/env bash
# 把客戶 PDF 轉成可嵌入 docx 的 PNG 並裁切常用區塊
# 用法：./prepare_pdf_images.sh <PDF 路徑>
#
# 產出在當前目錄下的 pdf_pages/ 子資料夾
#   p-NN.png      — 每頁全頁 PNG（110 dpi）
#   banner_sample.png / news_list.png / news_detail.png 等 — 你需要自己依專案調整裁切

set -euo pipefail

PDF="${1:?用法：$0 <PDF 路徑>}"
OUT_DIR="pdf_pages"

mkdir -p "$OUT_DIR"

echo "[1/2] PDF → PNG（110 dpi）"
pdftoppm -r 110 -png "$PDF" "$OUT_DIR/p"
ls "$OUT_DIR" | head -5

cat <<'TIP'

[2/2] 裁切提示（需依各 PDF 微調座標；PNG 預設 1238 × 2200）

# 範例：banner 樣式區（取頁面上半部）
convert pdf_pages/p-02.png -crop 1100x700+80+260 +repage pdf_pages/banner_sample.png

# 範例：列表頁 + 內頁並排（左右各取一頁的中下半）
convert pdf_pages/p-05.png -crop 1100x1300+80+700  +repage pdf_pages/news_list.png
convert pdf_pages/p-06.png -crop 1100x1700+80+400  +repage pdf_pages/news_detail.png
convert pdf_pages/news_list.png pdf_pages/news_detail.png \
  -gravity center +append -resize 1800x pdf_pages/news_combined.png

# 範例：聯絡頁 icon 區（取左半中段）
convert pdf_pages/p-21.png -crop 600x900+80+700 +repage pdf_pages/contact_icon.png

完成裁切後，回到 build_revision_doc.js 把對應的 ImgInline(...) 取消註解即可。

TIP
