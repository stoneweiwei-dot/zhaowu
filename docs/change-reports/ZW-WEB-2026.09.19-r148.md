# 昭梧更新報告｜ZW-WEB-2026.09.19-r148

## 本次改動

- 修正 `currentMasterRuntimeInstructionRule` 仍殘留「23 步主線」的舊字樣。
- 改為直接使用 `BAZI_ANALYSIS_MAINLINE.length` 生成步數，避免未來主線增減時 prompt 文案再次漂移。
- `src/lib/bazi/instruction-database.ts` 的 canonical router 註解明確標示 P3 會由 base database 注入，並同步 Instruction Database 更新時間。
- 不改動 P3 六態、病藥功能化、ODL→FC 或任何 deterministic calculation truth。

## 為什麼改

r147 已把 machine-readable 主線升為 24 步並正式載入 P3，但 canonical runtime instruction 的 `purpose` 字串仍寫「23 步主線」。這不影響陣列本身與 r147 CI，但會造成後台 prompt／稽核文案自相矛盾，因此立即收口。

## 影響範圍

- 八字 canonical runtime instruction 的文字描述。
- Instruction Database router 的 P3 可讀性與更新時間。
- 公開 release metadata。

## 受保護範圍

- 不修改四柱、節氣、真太陽時、藏干、十神、起運、大運等 calculation truth。
- 不修改 P3 判定規則本體。
- 不修改 D60、紫微、七政、一掌經、auth、payment、Supabase schema、首頁 UI。
- Paid Visual PR #295 維持暫停。

## 驗證狀態

- 合併前必須 Deploy gate／Engine suite／iPhone Safari 全綠。
- Engine suite 需確認 runtime contract 仍為 24 步且 P2 + P3 同時載入。
- 合併後必須確認 Vercel Production exact SHA 與首頁 HTTP 200。

## 回滾

回滾本版 instruction prompt 文案、router metadata 與 r148 release metadata 即可；不涉及資料 migration。
