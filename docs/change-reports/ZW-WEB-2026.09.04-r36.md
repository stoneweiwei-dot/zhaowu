# 昭梧更新報告｜ZW-WEB-2026.09.04-r36

## 本次改動

- 更新 `src/lib/report/report-visual-model.ts` 的庚、辛金命象：
  - 庚金主象明確為「礦鐵鋒刃」。
  - 辛金保留珠玉、精金本象，昭梧視覺延伸加入「月輪、月華」。
  - 弦月／殘月的鋒稜只可借作庚氣視覺；不把月亮本體改判為庚金。
  - 辛金的滿月、眉月、弦月、殘月只作命象差異，不作旺衰依據。
- 新增 `docs/STEM-VISUAL-SYMBOLISM-v1.0.md`，固定十天干主視覺、顏色與庚辛月相邊界。
- 新增回歸測試，鎖定「月相不得進入八字計算／金旺衰判斷」。
- 公開 release fallback 更新為 `ZW-WEB-2026.09.04-r36` / 累計更新 `36`。

## 為什麼改

現有視覺系統已把丙火定為日輪、丁火定為燈火、庚金定為礦石、辛金定為珠玉霜露，但沒有明確處理「月亮」及其陰晴圓缺。這次把辛金的月華意象正式納入昭梧命象，同時保留古法珠玉本象，並把庚金與月相的關係限制在弦月／殘月的鋒刃形態，避免視覺象法反過來污染八字計算。

## 影響範圍

會變更：

- `src/lib/report/report-visual-model.ts` 的庚／辛三語命象文案與「在天取象」
- 十天干命象視覺規範文件
- `scripts/report-visual-phase1.test.mjs`
- `src/lib/site-stats.ts` 的公開版本 fallback
- `scripts/release-ledger.test.mjs`

不變更：

- 八字排盤、真太陽時、四柱、藏干、十神、大運
- 日主旺衰、格局、病藥、喜忌、五行比例
- 不新增出生月相／天文月相計算
- 甲乙丙丁戊己壬癸既有 runtime 行為
- auth / login / account 權限
- payment、Supabase schema、客戶資料
- 圖像 provider、production routing、多語系架構

## 安全邊界

- 「辛＝月輪／月華」在昭梧中明確標記為視覺象義延伸，不冒充古籍原句「辛就是月亮」。
- 月相只服務命象、圖像與生成提示，不進 deterministic calculation。
- 不得用出生當日滿月、弦月、殘月直接推導金旺衰。

## 測試

`report-visual-phase1.test.mjs` 新增庚辛金回歸：

- 辛金 `在天取象 = 珠玉月華`
- 庚金 `在天取象 = 礦鐵鋒刃`
- 辛金文字必須保留「月相只作命象表現／不據出生月相判金旺衰」
- 庚金文字必須保留「弦月或殘月可借庚氣視覺／不據月相判旺衰」

`release-ledger.test.mjs` 同步鎖定 r36／36。

## 回滾

回滾本 release commit 即可恢復 r35 的庚辛金命象文字與 release fallback；本次沒有資料庫 migration、排盤邏輯或客戶資料變更。

## 驗證狀態

撰寫本檔時為 release candidate：**PENDING CI / PRODUCTION VERIFICATION**。

只有 exact commit 於唯一 Vercel 專案 `stone-zhaowu-official` 成為 Production `READY`，並確認正式站仍可載入命之書／日主命象後，才可標為完成；正式驗證後再把相同版本、update_number、source commit、deployment id 與驗證說明寫入 `public.release_history`。
