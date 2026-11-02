# 昭梧｜Buffer 自動入列工具包（待授權，非 Make 原生 Blueprint）

狀態：**已備好腳本／測試範例，但未登入 Buffer、未新增 Make 場景、未排入任何貼文。**

## 已證實的官方能力

- Buffer 官方 GraphQL API：`https://api.buffer.com`，免費方案可用；須本人 API key。參考 https://developers.buffer.com/guides/getting-started.html
- Make 官方「Buffer > Create a status update」可排程／放入 Queue；免費版 1,000 credits/月，有 AI Toolkit「Simple Text Prompt」可不另用 OpenAI API key。參考 https://apps.make.com/buffer-modules 、https://apps.make.com/ai-tools
- Instagram 自動發佈需要已連接的 Business/Creator 帳號及合法規格圖片／影片；純文字必須阻擋 IG 分支。參考 https://support.buffer.com/articles/using-instagram-with-buffer-YSjg2dXFV8
- Buffer 免費每條 Channel 最多 10 個待發貼文；官方 API 不保證平台零限流。

## 真正啟用前的最小工作

1. Make 帳號與 Buffer 帳號分別完成本人 OAuth 授權（不要把帳密貼到聊天）。
2. Buffer「Channels」或官方 API 查核：只准 **Facebook 粉專 昭梧 Zhaowu**，與經站主核准的 IG/Threads 帳號；若實際顯示 `stone1004`、`fkofflove` 等不同帳號，**停止，不能依名猜綁**。
3. Make 場景排程（澳洲悉尼時區）每天 **08:30**；`Make AI Toolkit > Simple Text Prompt` 使用 `prompt-make-ai-toolkit.txt`，輸出 JSON；`JSON > Parse JSON` 並核對必填欄位。
4. 對 FB／Threads／IG 分支分別加嚴格 Channel 過濾、按 `YYYY-MM-DD + Channel ID` 去重、排入**08:45 的指定時間**（不要選「立即發布」，也不要只靠 Buffer Queue 的下一空位等於 08:45）。若已有相同日期排程則停止。
5. IG 在公開圖片 URL 未確認、非專業帳號、尺寸不符合或只能通知發佈時，停止 IG 分支；**不得將待手機操作的 notification 冒充自動發佈**。
6. 先將場景輸出設為 Buffer Draft／停用正式發文作測試，驗證 JSON、Channel、時間、媒體；再一次性切至排入 Queue。每筆保存 Buffer Post ID、dueAt，發布後以 Sent/實際平台貼文 URL 核對。

**不用額外開兩個 Make 場景。** 一個 08:30 的場景可同時產稿並安排 08:45 發佈；多一個 08:40 中繼場景會增加故障與重複風險。

## 若要使用此包的 Buffer API 橋接腳本（選用）

專用於需精確控制 Channel、重複檢查、悉尼夏令時及 GraphQL 正式排程的模式；Make 直接使用官方 Buffer 模組時不必另部署腳本。

```bash
node buffer-bridge.mjs --dry-run --config=./config.example.json --post=./post.example.json
node buffer-bridge.mjs --check      # 需要已設 BUFFER_API_KEY（只讀）
```

1. `--check` 列出本人 Buffer organization / channel ID 與實際名稱；不暴露 Token。
2. 把核實的 channel ID 與精確顯示名稱寫入你的私有 config，不要提交金鑰。
3. 提供真實日期、三份文案與已公開且獲授權的圖片 URL。對要發佈的通道設 enabled=true。
4. 經審核後設定環境變數 `BUFFER_API_KEY`、`ENABLE_BUFFER_QUEUE=YES_I_APPROVED`，才可執行 `--enqueue`；程式會驗證正式帳號、時區、Buffer 待發佈佔位，再寫入 Post ID。

```bash
node buffer-bridge.mjs --enqueue --config=./config.private.json --post=./today-post.json
```

注意：上面 CLI 不包含背景排程器，不等於已完成每日自動化；必須由 Make/GitHub Action 等按時觸發。不要將 token、config.private.json 放入公開倉庫；只用服務端 Secret。

## 現有昭梧排程衝突

原有「昭梧每日一圖一文｜昭梧觀象內容週計畫」存在且啟用。正式發佈前須比對站內、Buffer、Metricool 的當日排程；同一主題不能同一平台連發兩次，也不能將個人帳號誤認為昭梧帳號。

## 當前阻塞

尚未拿到 Buffer 的可讀實際 Channels/Queue 狀態；無 Buffer API key、Make OAuth 與 IG 公開圖片供應鏈。**無權限不啟用自動發佈。**
