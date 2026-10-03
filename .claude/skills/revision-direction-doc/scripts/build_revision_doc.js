/**
 * 修改方向文件 - docx 產生器模板
 *
 * 使用方式：
 *   1. 將此檔案複製到輸出目錄旁
 *   2. 把 PDF 轉成 PNG 並裁切，放在同目錄的 pdf_pages/ 子資料夾下
 *   3. 修改下方的 children 陣列，填入該專案的內容
 *   4. 執行：node build_revision_doc.js <輸出.docx 路徑>
 *
 * 必要套件：npm install docx
 */

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  LevelFormat, ImageRun, ShadingType,
} = require('docx');
const fs = require('fs');
const path = require('path');

const PDIR = path.join(__dirname, 'pdf_pages');

// =============== Helpers ===============

// 讀取 PNG 並回傳 buffer + 寬高（自 IHDR 取出）
const pngSize = (file) => {
  const buf = fs.readFileSync(path.join(PDIR, file));
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { w, h, buf };
};

// 內嵌圖片（依原比例縮放至指定寬度）
const ImgInline = (file, displayWidth = 480, indent = 720) => {
  const { w, h, buf } = pngSize(file);
  const dh = Math.round(displayWidth * h / w);
  return new Paragraph({
    indent: { left: indent },
    children: [new ImageRun({ data: buf, transformation: { width: displayWidth, height: dh } })],
    spacing: { before: 60, after: 120 },
  });
};

// 一般段落
const P = (textOrRuns, opts = {}) => new Paragraph({
  children: Array.isArray(textOrRuns) ? textOrRuns : [new TextRun({ text: textOrRuns, ...(opts.run || {}) })],
  ...(opts.para || {}),
});

// 條列項（多層）
// level 0 = ● 大項、1 = ○ 子項、2 = ■ 孫項
const Bullet = (textOrRuns, level = 0, runOpts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level },
  children: Array.isArray(textOrRuns) ? textOrRuns : [new TextRun({ text: textOrRuns, ...runOpts })],
  spacing: { before: 40, after: 40 },
});

// 客戶綠底高亮 bullet（重現 PDF 中的綠色高亮）
const GreenBullet = (text, level = 0) => new Paragraph({
  numbering: { reference: 'bullets', level },
  shading: { type: ShadingType.CLEAR, fill: 'D9EAD3', color: 'auto' },
  children: [new TextRun({ text, color: '274E13' })],
  spacing: { before: 40, after: 40 },
});

// =============== 內容（依專案修改） ===============

const children = [];

// ---- 文件標題 ----
children.push(new Paragraph({
  children: [new TextRun({ text: '0505修改1', bold: true, size: 32, color: '1F1F1F' })],
  spacing: { after: 200 },
}));

// ---- 客戶提供 ----
children.push(Bullet([
  new TextRun({ text: '客戶提供　' }),
  new TextRun({ text: '📄 ', size: 22 }),
  new TextRun({ text: '0505修改.pdf', color: '1155CC', underline: { type: 'single', color: '1155CC' } }),
], 0));

// ---- 圖片更新 ----
children.push(Bullet([
  new TextRun({ text: '圖片更新　' }),
  new TextRun({ text: '🖼 網站圖片（客戶將自行提供，後續陸續補上）', color: '595959' }),
], 0));

// ---- 主分類架構調整 ----
children.push(Bullet('主分類架構調整：', 0));
children.push(Bullet('首頁', 1));
children.push(Bullet('區塊依序為：公司介紹、最新消息、產品與服務、氫能科技、人才招募、聯絡洽詢', 2));
children.push(Bullet('公司介紹', 1));
children.push(Bullet('區塊依序為：公司簡介、經營理念、發展里程碑', 2));
children.push(Bullet('最新消息', 1));
children.push(Bullet('子選單：文章一', 2));
children.push(Bullet('產品與服務', 1));
children.push(Bullet('子選單依序為：燃料電池電堆、無人飛行器、系統工程', 2));
children.push(Bullet('氫能科技', 1));
children.push(Bullet('區塊依序為：氫能的應用、氫燃料電池介紹、氫燃料電池發電原理、燃料電池結構', 2));
children.push(Bullet('人才招募', 1));
children.push(Bullet('子選單依序為：研發工程師、機電工程師、燃料電池系統整合工程師、助理工程師、業務助理、行政人員、工讀生', 2));
children.push(Bullet('聯絡洽詢', 1));
children.push(Bullet('中/英文', 1));

// ---- 視覺／版型重點（含截圖） ----
children.push(Bullet('Banner 改為單一版面，取消 Z 字形排版（依客戶提供的範例樣式）', 0));
// children.push(ImgInline('banner_sample.png', 480));

children.push(Bullet('僅最新消息頁面需調整，其餘版型與背景依初稿不變', 0));
// children.push(ImgInline('news_combined.png', 540));

children.push(Bullet('圖片全數移除（客戶會提供自己的照片，後續陸續補上）', 0));

// ---- 客戶綠底標註重點 ----
children.push(P(''));
children.push(P([
  new TextRun({ text: '＊ 客戶於 PDF 中綠底標註之重點：', bold: true, color: '38761D', size: 24 }),
], { para: { spacing: { before: 200, after: 120 } } }));

children.push(GreenBullet('里程碑想要活潑一點的形式', 0));
// children.push(ImgInline('milestone.png', 460));

children.push(GreenBullet('最新消息與新聞內頁：有些新聞不一定會有圖素，這裡要保留空間', 0));

children.push(GreenBullet('人才招募：尚未找到圖，但想留圖的空位；其餘按照初稿形式，只改變內文', 0));
// children.push(ImgInline('talent.png', 460));

children.push(GreenBullet('聯絡洽詢：希望 icon 可以小一點，或是不要漸層', 0));
// children.push(ImgInline('contact_icon.png', 280));

// ---- 結尾 ----
children.push(P(''));
children.push(P('其他頁面文案內容與細節請參考 0505修改.pdf。', {
  run: { color: '595959', size: 22 },
  para: { spacing: { before: 160 } },
}));

// =============== 文件設定 ===============

const doc = new Document({
  styles: { default: { document: { run: { font: '微軟正黑體', size: 22 } } } },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: '●', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 240 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '○', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 240 } } } },
        { level: 2, format: LevelFormat.BULLET, text: '■', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 240 } } } },
      ],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

const outPath = process.argv[2] || 'revision_doc.docx';
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('Wrote:', outPath, buf.length, 'bytes');
});
