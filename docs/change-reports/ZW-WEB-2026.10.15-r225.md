# 昭梧更新報告｜ZW-WEB-2026.10.15-r225

## 本次改動
- `src/lib/sky-events.ts`：新增冥王星恢復視順行，提供繁／簡／英三語、天文事實、占星象徵、相關宮位及來源。
- `src/lib/site-stats.ts`：fallback 版本從 r224 更新至 r225；三語摘要反映本次變更。
- `lib/zhaowu-verification.js`：對齊 r225 release 常數（不修改引擎版本）。

## 天文核對（修正原 PDF 來源的時區與星曆錯誤）
- 冥王星轉順：**2026-10-16 02:40 UTC = 悉尼 2026-10-16 13:40 AEDT**（美東 2026-10-15 22:40）；地心熱帶黃道約水瓶 3°04′。
- 視逆行開始：2026-05-06，水瓶約 5°30′–5°31′；原附件寫約 8°屬錯誤。
- 月亮進射手：約 2026-10-14 悉尼中午；上弦月於 2026-10-19 03:12 悉尼（2026-10-18 16:12 UTC），月亮位於摩羯，**不是射手上弦月**。
- 來源：
  - [Cafe Astrology · Pluto turns direct in Aquarius 2026](https://cafeastrology.com/events/pluto-turns-direct-in-aquarius-2026/)
  - [Lunary · Pluto retrograde 2026, time zones](https://lunary.app/blog/transits/pluto-retrograde-aquarius-2026)
  - [Cafe Astrology · October 2026 Moon Calendar](https://cafeastrology.com/calendars/moon-calendar-2026.html)
  - [Space.com · Lunar phases 2026](https://www.space.com/18880-moon-phases.html)

## 改動與保護邊界
- 只動近日天象資料、公開版本 fallback、驗證常數與變更報告。
- 不動八字／紫微／D60 演算、付款、Auth、RLS、資料庫 schema、PWA、其他 UI。
- 根據 AGENTS.md §7，CI 不是例行合併門檻；只做任務範圍內核對。

## 發布核驗
- 合併後，以 Vercel Production **READY + GitHub SHA**、線上 `/release.json`、`/`、`/sky-events`、`/updates` 為證據。
- 正式站核對完成後，將 PR 號、合併 commit SHA、deployment ID 與實際結果寫入 Supabase `release_history`。
- 本報告記錄**待驗證步驟**，不代表已上線或已驗收。

## 回滾
- Revert 本 PR 即可撤回新增事件及版本 fallback；資料庫中的 r225 紀錄如已建立，需依正式回滾流程保留歷史並標註狀態，不刪除歷史。
