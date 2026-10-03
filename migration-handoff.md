# AI Tool Hub 搬移交接：個人帳號 → 公司帳號

> 整理日期：2026-10-03
> 用途：交給另一個 AI 或操作者實際執行搬移。

---

## 1. 原始需求（使用者原文）

> https://ai-tool-hub-jade.vercel.app/
>
> 你能確認到這個裡面的內容和工具嗎？
> 包含他原先連結的github，但應該都是在daviswang可切換另一個帳號底下
>
> 現在想要把它們所有搬移到現在這個：Morcept-pm 帳號下，因這是屬於公司的
> 原先放在我個人帳號下不太好去管理
>
> 也要考慮連成一條線的vercel，這也是要放在公司帳號下：https://vercel.com/morcept-design
>
> 先幫我確認帳號和路徑是否可行，在幫我確認我提供網址的內容工具

### 需求摘要

| 項目 | 搬移前 | 搬移後 |
|---|---|---|
| 網站 | `https://ai-tool-hub-jade.vercel.app/` | 網址盡量保持不變 |
| GitHub repo | `daviswang` 個人帳號底下（repo 名稱**未知**） | `Morcept-pm` 公司帳號 |
| Vercel 專案 | 使用者個人的 Vercel 帳號或團隊（**未確認**） | Vercel 團隊 `morcept-design`（https://vercel.com/morcept-design） |

目標：GitHub repo 和 Vercel 專案都歸公司所有，而且兩者要接在一起：push 到 GitHub 後，Vercel 會自動部署。

---

## 2. 上一個 AI 已確認的事項

| 項目 | 結果 |
|---|---|
| GitHub `Morcept-pm` | 已連上，可讀取也可推送（Claude GitHub App 已安裝）。**這是個人帳號，不是組織（Organization）** |
| `Morcept-pm` 目前的 repo | `Morcept-pm/mainconversation`（空的）、`Morcept-pm/yellow-house` |
| `ai-tool-hub-jade.vercel.app` 的內容 | **沒有確認**。上一個 AI 的雲端環境網路設定擋掉了這個網址 |
| `vercel.com/morcept-design` | **沒有確認**。網路被擋，而且需要登入 Vercel |
| `daviswang` 底下的 repo | **沒有確認**。上一個 AI 沒有這個帳號的存取權，也不知道 repo 名稱 |

### 還需要釐清的問題

1. 網站對應的 GitHub repo 完整名稱，格式是 `daviswang/<repo>`。
2. 網站裡有哪些工具或頁面，要列出清單，搬完後才能逐一驗證。
3. 這個 Vercel 專案目前在哪個 Vercel 帳號或團隊底下，專案名稱是什麼。
4. 有沒有自訂網域。目前看到的只有 `*.vercel.app`。
5. 有沒有環境變數（API key 等）、Vercel 儲存服務（KV / Postgres / Blob 等），或其他第三方整合。
6. 是否只有一個 repo 或專案。使用者說的是「它們所有」，可能有好幾個。

---

## 3. 建議做法（先決定）

**要不要另外建一個 GitHub 組織？** 上一個 AI 建議考慮，例如命名為 `morcept`。

- 好處：比較好管成員權限，repo 可以直接轉入，不需要另一邊接受。之後人員異動也不用交出個人帳號。
- 如果決定沿用 `Morcept-pm` 個人帳號，下面的步驟一樣適用，只是轉移後要用 `Morcept-pm` 登入接受。

> ⚠️ 請先和使用者確認目標是 `Morcept-pm` 帳號，還是新建的組織，再開始操作。

---

## 4. 執行步驟

順序很重要：**先盤點 → 搬 GitHub → 搬 Vercel → 重新連 Git → 驗證**。

### 步驟 0：盤點（搬之前）

- [ ] 打開 `https://ai-tool-hub-jade.vercel.app/`，記下所有工具和頁面，最好截圖。
- [ ] 在 Vercel 找到這個專案，記下：
  - 專案名稱、所屬帳號或團隊
  - Settings → Environment Variables（列出變數名稱，**不要把值抄進文件**）
  - Settings → Domains
  - Storage / Integrations 有沒有綁東西
  - Settings → Git 目前連的是哪個 repo、哪個分支
- [ ] 在 GitHub 確認 `daviswang/<repo>`：
  - 有沒有 GitHub Actions、Secrets、Webhooks、Deploy keys
  - 有沒有 fork 或其他協作者

### 步驟 1：搬 GitHub repo

操作者必須是 `daviswang` 帳號的擁有者。

1. 用 `daviswang` 登入 GitHub。
2. 進入 repo → **Settings → General → Danger Zone → Transfer ownership**。
3. New owner 填 `Morcept-pm`（或新建的組織名稱），輸入 repo 名稱確認。
4. 如果目標是個人帳號 `Morcept-pm`：改用 `Morcept-pm` 登入，到 email 或通知裡**接受轉移**。
5. 確認：
   - [ ] `https://github.com/Morcept-pm/<repo>` 可以打開
   - [ ] commit、issues、PR 都還在（GitHub 轉移會保留這些，舊網址也會自動導到新網址）
   - [ ] **Actions Secrets 要重新檢查**，必要時重新設定
   - [ ] 本機的 clone 可以改 remote：`git remote set-url origin https://github.com/Morcept-pm/<repo>.git`

### 步驟 2：搬 Vercel 專案

操作者要同時是原本 Vercel 帳號和 `morcept-design` 團隊的成員，而且有權限。

1. 登入 Vercel，進入原本的專案。
2. **Settings → General → Transfer Project**，目標選 `morcept-design`。
3. 轉移前先看清楚 Vercel 列出的注意事項，特別是 Storage 和 Integrations 會不會一起搬。
4. 轉移後確認：
   - [ ] 專案出現在 `https://vercel.com/morcept-design`
   - [ ] 環境變數都還在
   - [ ] `ai-tool-hub-jade.vercel.app` 這個網域還在，並指向這個專案
   - [ ] `morcept-design` 團隊的方案能支援這個專案的用量（Hobby 和 Pro 的限制不同）

### 步驟 3：重新連 GitHub 和 Vercel

1. 確認 **Vercel 的 GitHub App** 已經裝在 `Morcept-pm`（或組織），並允許存取這個 repo：
   - 到 GitHub → Settings → Applications → Installed GitHub Apps → Vercel → Configure
2. 在 Vercel 專案 → **Settings → Git**：
   - 先中斷舊的 `daviswang/<repo>`（如果還顯示的話）
   - 改連 `Morcept-pm/<repo>`，確認 Production Branch（通常是 `main`）

### 步驟 4：驗證整條流程

- [ ] 對 `Morcept-pm/<repo>` 推一個小 commit，例如改 README。
- [ ] Vercel 有自動開始部署，而且部署成功。
- [ ] 打開 `https://ai-tool-hub-jade.vercel.app/`，對照步驟 0 的清單，逐一確認每個工具都正常。
- [ ] 舊的 Vercel 帳號裡不再有這個專案，或已停用。
- [ ] 舊的 `daviswang/<repo>` 已導到新位置，不要另外新建同名 repo，不然導向會失效。

### 步驟 5：如果有多個 repo 或專案

每一組 repo + Vercel 專案都重複步驟 0–4。

---

## 5. 給執行 AI 的環境注意事項

上一個 AI 是在 Claude Code 雲端環境裡執行，遇到這些限制：

- 雲端環境預設的網路設定會擋 `*.vercel.app`、`vercel.com`、`api.vercel.com`。要開放的話，在 session 標題列點雲端環境選單 → Edit → Network access → Custom，把這些網域加進 Allowed domains。說明：https://code.claude.com/docs/en/cloud-environments#network-access
- GitHub repo 轉移和 Vercel 專案轉移，都需要擁有者在網頁上點按鈕確認。**AI 沒辦法代替擁有者完成**，只能引導或檢查結果。
- 如果要讓 AI 透過 Vercel CLI 或 API 操作，需要一組屬於 `morcept-design` 團隊的 Vercel token，放在環境的 secrets 裡，**不要貼進對話或文件**。
