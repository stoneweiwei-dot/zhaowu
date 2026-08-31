# 昭梧更新報告｜ZW-WEB-2026.08.31-r18

日期：2026-08-31（AEST）
狀態：待 Production 驗證

## 本次改動

1. 正式結果頁的「製作我的命誥圖」按鈕改為明確呼叫 `generateDecreeImage(session, reportId, true)`，優先進入 OpenAI provider 個性化生成路徑。
2. 保留 Edge Function 既有的 Gallery-direct 回退：provider 憑據、額度或生成失敗時，仍交付站主圖庫匹配圖，不阻塞文字答案與完整報告。
3. 新增回歸測試，鎖定正式客戶按鈕必須傳送 `force=true`，同時確認後端 Gallery 回退仍存在。
4. 更新 `docs/CURRENT-STATE.md`，停用「正式客戶預設只走 Gallery-direct」的舊指令；後台 Gallery 重新匹配能力不變。

## 為什麼改

Issue #59 的驗收要求是真實圖像 provider 生成。生產資料雖已有非空 `image_path`，但目前全數不是 `visual_profile.imageSource = provider-edit`；原正式按鈕傳送 Gallery 重新匹配請求，無法形成 OpenAI 生成證據。站主最新指令要求正式按鈕改走 provider，因此本版只替換該衝突執行路徑。

## 影響範圍

- 客戶結果頁「製作我的命誥圖」按鈕
- 命誥圖 provider／Gallery fallback 呼叫選擇
- 命誥圖與 release ledger 回歸測試
- `docs/CURRENT-STATE.md` 的當前行為說明
- 全站 release footer fallback 升級為 r17

## 不改範圍

- 四柱、月令、喜用、歲運與其他 Calculation Truth
- 最終 Reading 與完整報告文字結構
- Auth、owner 權限、Supabase schema、RLS、Storage bucket 與 Edge Function 程式
- Gallery 排名、母圖選擇、signed URL 與既有圖片自動載入
- provider 失敗時的 Gallery-direct 回退

## 回滾

將 `src/components/result-view.tsx` 的正式按鈕呼叫恢復為不帶 `true` 的 Gallery 重新匹配路徑，並回退對應測試、`CURRENT-STATE.md`、`src/lib/site-stats.ts` 與 release ledger。無資料庫 schema 變更。

## Production 驗證欄

- GitHub commit：待寫入
- CI / Build：待驗證
- Vercel deployment：待驗證
- Production commit：待驗證
- Supabase schema／permissions／data：未修改
- 外部阻塞：OpenAI API credits 目前不足；credits 恢復前只能驗證 provider 請求已發出及 Gallery fallback，不能宣稱 `provider-edit` 真實成圖成功
- 最終驗收：真實登入報告需得到非空 `image_path` 與 `signedUrl`，資料庫 `visual_profile.imageSource = provider-edit`、`generation_error` 為空，Storage 實體存在，iPhone 畫面可見
