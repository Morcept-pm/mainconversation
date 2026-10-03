# 交接：確認 4 個 AI 工具的 Claude API 金鑰並重新部署

> 整理日期：2026-10-03
> 用途：在**本機 session**（能連 Vercel 和工具網站）接手執行。上一個雲端 session 的網路被擋，沒辦法確認。
> ⚠️ 本文件不含任何金鑰。執行時也**不要把金鑰印出來、貼進對話或寫進檔案**。

---

## 1. 背景

- 4 個內部工具的程式都已寫好，從伺服器端呼叫 Claude API（`api/claude.js`，網站數位健檢是 `api/analyze.js`），只差在 Vercel 填入金鑰。
- GitHub：`Morcept-pm/<repo>`；Vercel 團隊：`morcept-design`。
- Anthropic 組織：**morcept**（API plan），用 `claude-pm@morcept.com` 登入；Workspace：**morcept**。
- 金鑰類型：使用者決定**先用 `sk-ant-usr-` 開頭的使用者金鑰**（Linked account 是 `claude-pm`，Scope 是 morcept Workspace）。之後可能改成 Service account 的金鑰。
- 進度：**第 1 把（`seo-architecture-tool`）已建立**，使用者說已填進 Vercel，但還沒確認，可能也還沒 Redeploy。另外 3 把還沒建。

## 2. 4 個工具對照

| # | 金鑰名稱 | 工具 | 網址 | Vercel 專案 | AI 端點 / action |
|---|---|---|---|---|---|
| 1 | `seo-architecture-tool` | SEO AI Agent | https://seo-architecture-tool.vercel.app | `seo-architecture-tool` | `POST /api/claude`，`action: extendKeywords` 等 |
| 2 | `seo-monthly-report-tool` | SEO 月報 | https://seo-monthly-report-tool.vercel.app | `seo-monthly-report-tool` | `POST /api/claude`，`action: seo-monthly-summary` |
| 3 | `site-audit-tool` | 網站數位健檢 | https://site-audit-tool-zeta.vercel.app | `site-audit-tool` | `POST /api/crawl` → `POST /api/analyze`（用到 web_search） |
| 4 | `geo-design` | GEO 設計工具 | 沒有公開網址（`geo-design-davis18.vercel.app`，要登入 Vercel） | `geo-design` | `POST /api/claude`，`action: geoCopyHealthCheck` |

Vercel 環境變數頁：`https://vercel.com/morcept-design/<專案>/settings/environment-variables`
Vercel 部署頁：`https://vercel.com/morcept-design/<專案>/deployments`

### 環境變數

| 變數 | 說明 |
|---|---|
| `ANTHROPIC_API_KEY` | 必填。對應上表的金鑰，Production，建議勾 Sensitive |
| `CLAUDE_MODEL` | 選填。建議 `claude-sonnet-5-5`；不填就用程式預設的 `claude-sonnet-5` |
| `ANTHROPIC_WORKSPACE_ID` | **先不填**。只有 API 回傳 400、錯誤訊息提到 workspace 時才加，值是 morcept Workspace 的 ID（`wrkspc_` 開頭，在 Console → Workspaces） |

## 3. 要執行的工作（先做第 1 個工具）

### 步驟 0：準備 Vercel CLI
```bash
npm i -g vercel
vercel login            # 用能管 morcept-design 團隊的帳號
vercel whoami
vercel teams ls         # 確認看得到 morcept-design
```
> 注意：`morcept-design` 團隊之前顯示**付款逾期**。如果部署失敗，先確認團隊沒有被暫停。

### 步驟 1：確認環境變數
```bash
mkdir -p ~/tmp/seo-architecture-tool && cd ~/tmp/seo-architecture-tool
vercel link --yes --project seo-architecture-tool --scope morcept-design
vercel env ls --scope morcept-design
```
確認：
- [ ] `ANTHROPIC_API_KEY` 存在、套用在 Production，更新時間是 2026-10-03（不是 2026-08-31 的舊金鑰）
- [ ] 沒有殘留的 `ANTHROPIC_WORKSPACE_ID`；有的話先問使用者再刪
- [ ] `CLAUDE_MODEL` 有沒有設、值是什麼

> 只看變數名稱和時間，**不要用 `vercel env pull` 把值拉下來**。

### 步驟 2：確認是否已部署，沒有就 Redeploy
```bash
vercel ls seo-architecture-tool --scope morcept-design --prod
```
- 最新 Production 部署的時間**晚於**環境變數的更新時間 → 已生效，跳到步驟 3。
- 否則重新部署（環境變數要重新部署才會生效）：
```bash
vercel redeploy <最新 production 部署的網址> --scope morcept-design
```
- [ ] 等狀態變成 **Ready**

### 步驟 3：實測 API
```bash
curl -sS -X POST https://seo-architecture-tool.vercel.app/api/claude \
  -H 'Content-Type: application/json' \
  -d '{"action":"extendKeywords","payload":{"prompt":"產業：室內設計。服務：住宅裝潢、商空設計。請延伸 5 個關鍵字。"}}' \
  | head -c 600
```
判讀：

| 回應 | 意思 / 處理 |
|---|---|
| `{"result": "..."}` 有內容 | ✅ 成功 |
| `ANTHROPIC_API_KEY not configured` | 變數沒套到 Production，或沒 Redeploy |
| `Claude API 回傳錯誤 (401)` | 金鑰錯誤或已停用，請使用者重建 |
| `Claude API 回傳錯誤 (400)` 且提到 workspace | 加 `ANTHROPIC_WORKSPACE_ID` 後 Redeploy |
| `Claude API 回傳錯誤 (400)` 提到 model | `CLAUDE_MODEL` 打錯 |
| `Claude API 回傳錯誤 (429)` | 頻率太高或 Credits 用完（組織目前有 US$100） |

- [ ] 請使用者到 https://console.anthropic.com/usage 確認用量出現在 **morcept** 組織

### 步驟 4：回報使用者
回報第 1 個工具的結果。成功後，請使用者在 Console 建另外 3 把金鑰（Create key → 名稱照上表 → Workspace 選 morcept），**自己貼進 Vercel**。
然後對另外 3 個專案重複步驟 1–3。

## 4. 其他 3 個工具的測試指令

```bash
# 2. SEO 月報
curl -sS -X POST https://seo-monthly-report-tool.vercel.app/api/claude \
  -H 'Content-Type: application/json' \
  -d '{"action":"seo-monthly-summary","payload":{"prompt":"本月點擊 1200（上月 1000），曝光 30000，平均排名 12.3。請寫 3 句摘要。"}}' | head -c 600

# 3. 網站數位健檢（先 crawl，再 analyze；analyze 會跑 web_search，約 30–60 秒，會另外計費）
curl -sS -X POST https://site-audit-tool-zeta.vercel.app/api/crawl \
  -H 'Content-Type: application/json' -d '{"url":"https://www.morcept.com"}' > crawl.json
node -e 'const c=require("./crawl.json");console.log(JSON.stringify({crawl:c.crawl??c,brandKeyword:"默聲",categoryKeywords:[]}))' > analyze-body.json
curl -sS -m 90 -X POST https://site-audit-tool-zeta.vercel.app/api/analyze \
  -H 'Content-Type: application/json' -d @analyze-body.json | head -c 800
# ↑ crawl 回傳的格式請先看 crawl.json 確認；若格式不同，改用網頁介面測試

# 4. GEO 設計工具（沒有公開網址；用 vercel ls 找部署網址，可能需要 Vercel 登入保護）
#    建議改在網頁介面按「AI 檢查此頁」測試
```

> 網站數位健檢的 `/api/analyze` 需要 morcept 組織在 Console → **Capabilities** 開啟 **Web search**。

## 5. 已知限制和注意事項

- **不要**為了觸發部署而推空 commit；Vercel 規定 commit 作者必須是 `morcept-design` 團隊成員，否則部署會被擋。
- `lead-gen-tool`（業務尋找潛在客戶）的 repo 不在 `Morcept-pm` 底下，沒有確認它有沒有用到 AI。
- 網站數位健檢的 `vercel.json` 把 `api/analyze.js` 限制在 60 秒，搜尋次數多時可能超時。
- `seo-architecture-tool/README.md` 寫的預設模型 `claude-sonnet-4-20250514` 已過時，和程式（`claude-sonnet-5`）不一致，可以之後修。
