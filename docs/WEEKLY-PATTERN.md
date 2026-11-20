# 每週吉祥紋樣練習紀錄

## 2026-W34｜傳統向：寶相花（Baoxianghua）

**方向：** 中國傳統吉祥紋樣（下週交錯為新中式賽博）

**象徵結構：**
寶相花不是單一植物寫生，而是唐代以降的「合成聖花」：以蓮瓣層級為骨、牡丹豐滿為肉、卷草忍冬為勢，再以金線雙鉤收束為圓滿對稱。核心是「層層展開 → 中心結珠 → 外圈祥雲／卷草迴護」，象徵福德圓滿、莊嚴具足。

**本週完成圖：** 9:16 iPhone 直幅完成版，底部 `STONE 原創` 水印。

## 當前有效網站接入規則

本段取代 2026-08-23 的「weekly 優先載入」舊約定。

- Supabase `background_assets` 中目前啟用／釘選／輪播的站主圖片永遠優先。
- `public/wallpapers/current-weekly.b64` 只能作為沒有可用 Supabase 背景時的 fallback，不得覆蓋站主圖片。
- 每週紋樣任務原則上只產出／替換單一圖像資產；不得順手修改登入版面、SiteShell、卡片透明度、Logo 排列、路由或核心邏輯。
- 不得恢復 Netlify / AppDeploy production，也不得建立第二個 Vercel project 或平行 production。
- 不改 calendar／palm／method／排盤／報告生成／登入權限。
- 若更換週圖需要改 loader、base64 multipart 流程、核心元件或其他 runtime 邏輯，停止自動接入並把它視為需要單獨驗收的網站改動。

**目前狀態：**
- 這份文件只保留每週圖像練習與安全接入規則。
- 網站背景優先級以當前 `main`、`docs/CURRENT-STATE.md` 與 production 實況為準。
