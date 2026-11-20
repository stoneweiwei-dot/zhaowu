# 昭梧更新報告｜ZW-WEB-2026.08.31-r16

日期：2026-08-31（AEST）
狀態：待 Production 驗證

## 本次改動

1. 新增 `src/lib/report/cultivation-environment-advice.ts`，建立「修心與環境」建議模組；此模組只負責報告建議文案，不進八字或紫微 Calculation Truth Layer。
2. 模組固定總綱：真正需要調整的不只是一個方位，而是人與環境、家人、言語、萬物之間的長期關係；外局可調，內心亦須調；風水只能作參考，不能取代選擇、行動與現實處理。
3. 建立八個可調用主題：境隨心轉、慈悲／不傷生、孝親／根源關係、口德／謙卑／敬物、相由心生／習慣投射、二元執念／放下分別心、家人各自課題、無為不妄為。
4. `buildMindAdviceLines` 先按問題語義嘗試命中「修心與環境」；命中時最多回傳兩條，直接併入既有總體概括，不新增 report section 或 session；未命中則維持原有關係、健康、行動、自我與通用建議。
5. 加入安全護欄：不得宣稱物件會聽見人的話、不得把殺生寫成直接破財因果、不得用孝親要求承受傷害、不得用凌亂／字跡診斷人格或心理疾病、不得讓風水與修心建議取代住宅安全、醫療、法律、財務或關係中的現實處理。
6. 新增回歸測試，覆蓋住家／風水、父母家庭、口舌衝突、慈悲不傷生、英文無中文殘留、健康醫療邊界，以及每次最多兩條建議。

## 為什麼改

站主指定把 DeepSeek 文件中的「境隨心轉、慈悲不傷生、孝親、口德與敬物、環境作為長期習慣投射」整理成昭梧可調用的命理／修心建議，並與既有「二元執念、家人各自課題、無為不妄為」合併成同一模組。原始材料中的擬人化物件、殺生直接導致財福消失等說法不適合作為客觀事實，因此本版保留其文化與修心方向，移除魔法因果與恐嚇式輸出。

## 影響範圍

- 完整報告總體概括中的 owner-curated 修心／命理建議選擇
- `src/lib/report/mind-advice.ts`
- 新增 `src/lib/report/cultivation-environment-advice.ts`
- 修心建議回歸測試
- 全站 release footer fallback 升級為 r16

## 不改範圍

- 四柱、時區、夏令時、真太陽時、節氣、月令、格局、喜用、病藥與歲運計算 Truth
- 紫微 Calculation Truth Layer
- 報告既有「總體概括 → 身體需要注意」連續紙面結構
- Auth、payment、Supabase schema／permissions／資料與 Edge Functions
- 觀世錄、圖庫、背景與命誥圖選擇邏輯

## 回滾

如新建議命中過度或文案造成回歸，回滾 `src/lib/report/mind-advice.ts` 並移除 `src/lib/report/cultivation-environment-advice.ts`；恢復 r15 的 `src/lib/site-stats.ts` 與 `scripts/release-ledger.test.mjs`。本版不涉及資料庫 schema 或命理計算核心。

## Production 驗證欄

- GitHub commit：待寫入
- CI / Build：待驗證
- Vercel deployment：待驗證
- Production commit：待驗證
- Supabase：未修改 schema／permissions／data；`release_history` 需在 Production VERIFIED 後另依授權處理
- 驗證重點：新建議每題最多兩條；風水／家庭／口德／不傷生語義正確命中；健康醫療邊界保留；三語尤其英文無中文殘留；首頁與報告核心流程不受影響。
