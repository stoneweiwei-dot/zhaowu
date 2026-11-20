# 昭梧更新報告｜ZW-WEB-2026.08.31-r14

日期：2026-08-31（AEST）
狀態：Production 已驗證

## 本次改動

1. 手機端青玉小龍改為頁面內元件；按鈕與展開面板都參與正常排版，不再浮在表單或文章正文上。
2. 青玉小龍快捷入口、本地判斷、AI 允許路由與 fallback 文案全部移除「性格兩面」。
3. 「昭梧・觀世錄」移除列表整圖縮略圖與展開後整張大圖；只在文章段落間呈現一至兩塊小幅裁切，左右錯落並以文章 ID 穩定選位，避免重排與閃動。
4. 新增回歸測試，鎖定手機端不覆蓋、舊入口不回流，以及文章不再渲染完整大圖。

## 為什麼改

手機端固定定位的小龍按鈕與展開面板會遮住答卷表單和觀世錄正文；文章配圖也把完整直幅圖片當成縮略圖和大圖重複貼入，偏離「裁成小塊、散落在文章中」的排版要求。此版修正兩個實際版面回歸，並清掉已不應由小龍推薦的舊功能入口。

## 影響範圍

- 全站手機端青玉小龍位置與展開方式
- 青玉小龍三語快捷入口、本地導航與 Edge Function 路由白名單
- 首頁「昭梧・觀世錄」文章摘要與展開正文配圖
- 全站 release footer 版本資訊更新為 r14

## 不改範圍

- 四柱、真太陽時、月令、格局、喜用、歲運等八字核心計算
- 紫微、七政、一掌經計算核心
- `/tianji-dual` 獨立頁面與其計算邏輯；本版只移除小龍內的舊入口
- Auth、payment、Supabase schema 與報告文字結論
- 首頁答卷本身的欄位、提交與結果流程

## 回滾

如排版造成回歸，可回滾 `src/content-layout-fixes.css`、`src/components/site-shell.tsx` 與 `src/components/life-view-section.tsx`；如導航回歸，可回滾青玉小龍元件、站內導航規則與 `site-guide` Edge Function。本版不涉及命理核心，回滾時也不得改動相關引擎。

## Production 驗證欄

- GitHub PR：#179
- Merge commit：`e4aaebd1a4eceddc188a27da157ea1e331411d06`
- CI：Production CI #837 通過（283 項 deterministic tests、TypeScript、Vite build、24/24 iPhone Safari）
- Vercel deployment：`dpl_FvHBmYxbxVHd1mqiYzsRFQEQpEe9`（READY，production alias 已指向）
- Supabase Edge Function：`site-guide` v8（ACTIVE，`verify_jwt=true`）
- Production routes：`/`
- 驗證重點：iPhone 390×844 下小龍收合與展開均不覆蓋表單/正文；小龍無「性格兩面」；觀世錄只顯示裁切小圖且無橫向溢出
- 結果：正式站 r14 可見；無 Vite error overlay、無橫向溢出；小龍不含舊入口；觀世錄已無整張大圖，正文使用左右錯落的裁切小圖。Supabase `release_history` 已寫入 r14。
