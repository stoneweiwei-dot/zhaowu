# 昭梧｜Buffer 預檢橋接（待授權）

此 PR 是獨立 Node 20+ 工具，未接通 Buffer、Make，亦未建立排程或發布。全部示例頻道預設停用；不提供憑證，也不提交私有 config。`stone1004` 是待核實的預期帳號，不代表已連接。

## 離線檢查

準備私有 config、指定已核實的 Buffer Channel ID、帳號名稱，以及 Facebook 粉專在 Meta 的 service ID。只啟用已確認的目標。以本地檔案提供日期及各平台文案：

```bash
node buffer-bridge.mjs --dry-run --config=./config.private.json --post=./today-post.json
node --test buffer-bridge.test.mjs
```

`--dry-run` 驗證啟用頻道的 ID、名稱、文案、悉尼時間、Threads 字數和 IG 輸入欄位，無網路操作。全部停用、缺必要資料或無效時會失敗。**它不驗證帳戶、真實圖片、公開 URL 或排程。** 範例 config 全部停用，故不能直接作為成功案例。

## 授權後的 Buffer 唯讀檢查

在安全環境提供 Buffer API key（勿寫進檔案或輸出），再使用相同的私有 config 和文章檔：

```bash
node buffer-bridge.mjs --list-channels
node buffer-bridge.mjs --check --config=./config.private.json --post=./today-post.json
```

`--list-channels` 只列出可見組織與頻道資料，供核對 ID；列出不代表已授權發布。

此命令只發 GraphQL 查詢：核對頻道 ID、平台、名稱、是否斷線／鎖定／暫停，Facebook 類型及 Meta 粉專 ID；再查各目標頻道的 scheduled / sent，以悉尼日期核對。帳號欄位或回應不完整、記錄超過第一頁 100 筆、當日已有貼文時即失敗。由於 API 日期篩選依 createdAt 或 dueAt，檢查不使用日期篩選，避免漏掉實際 sentAt 落在當日的貼文；大量歷史記錄會保守停止。這只是 Buffer 預檢，**仍須人工核對 Metricool、站內及其他渠道**，也不能防止並行操作者競爭入列。

IG 的圖片 URL 可達性、實際檔案尺寸與帳號可否直接自動發布尚未驗證；當 IG 啟用時，Queue 寫入路徑會直接停止。不能把圖片長寬標籤或專業帳號假設當作實際驗收。

## 後續與限制

- `--enqueue` 原有功能仍需額外的 `ENABLE_BUFFER_QUEUE=YES_I_APPROVED` 和有效 Buffer API key；本次未使用。
- 預定方案是 Make 單一場景於悉尼 08:30 產稿，並指定 08:45 發布；場景、授權和去重尚未完成，不能把 Buffer 下一個空位假定為 08:45。
- 啟用任何發布前，需獨立核對三個目標頻道、Buffer／Metricool／站內排程，驗證 IG 原創公開圖片及直接發布能力，再完成受控端到端驗收。
- 此腳本沒有背景排程器或 Make 場景；合併 PR 不等於授權、已入列、已發布或已上線。
- 未經真實 Buffer 權限實測，GraphQL schema 與帳號返回資料仍有待驗證；API 回錯誤時應停止，不能改用猜測值。
