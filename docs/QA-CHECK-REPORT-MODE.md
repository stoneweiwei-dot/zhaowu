# 昭梧網站檢查報告模式

Status: CURRENT WORKFLOW
Owner preference recorded: 2026-09-07 AEST

## 目的

以可核驗證據檢查昭梧唯一正式主線，不把「程式存在」「CI 通過」「已合併」「已部署」混成「已驗證」。每次檢查都優先回答：現在能不能用、哪些已完成、哪些還沒完成、風險在哪、下一步先做什麼。

## 固定報告結構

1. **先給總結**：Production 是否正常、main 與 Production SHA 是否一致、是否有明顯 runtime / deploy 阻塞，以及本次檢查的驗證邊界。
2. **已完成表**：列功能／排版／美工中已經有實際程式或正式站證據的項目，明確標示完成程度。
3. **未完成表**：按 P0 / P1 / P2 / 工程債排序；每項至少包含「問題、實際現況、應怎麼收口」。
4. **區分證據層級**：Live、Deployed、Committed、Modified、Analysed、Verified 不混用；沒有真機證據就不能寫成 iPhone 已驗證。
5. **最後給執行順序**：只列當下真正值得做的項目，避免為了看起來忙而觸發不必要部署、外掛或重複全站掃描。

## 首頁 Loading／首屏時間規則

「3 秒」是性能目標，不是死板固定值。

- 約 **3 秒**：正常網路與 runtime 已就緒時的優先退出目標。
- **3–5 秒**：允許因動畫完整度、裝置性能或 runtime readiness 自然延長。
- **5 秒**：目前 blocking Loading 的最大上限，不應把 5 秒當成每次都必須播滿的固定時長。
- 若動畫提早完成或失敗，而 runtime 已可用，可以更早退出。
- 若 bootstrap / backend 異常，必須 fail-open；Loading 不得讓首頁、登入或帳戶入口永久不可用。
- 首頁實際內容應獨立掛載在 Loading 下方，動畫只是一層暫時視覺，不是應用啟動條件。

## 平台邊界

- 唯一正式 Production：Vercel `stone-zhaowu-official`。
- GitHub `stoneweiwei-dot/zhaowu` 的 `main` 是唯一正式程式主線。
- Supabase 是正式資料／Auth／Storage 後端，非必要不得改 schema 或資料。
- Netlify 與 Lovable 只作 archive / standby / 輔助，不得變成第二正式 Production。
- 每次修復先判斷是否需要部署；能在 branch / PR 驗證的先不要無故觸發 Production build。
