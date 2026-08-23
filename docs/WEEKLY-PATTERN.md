# 每週吉祥紋樣練習紀錄

## 2026-W34｜傳統向：寶相花（Baoxianghua）

**方向：** 中國傳統吉祥紋樣（下週交錯為新中式賽博）

**象徵結構：**
寶相花不是單一植物寫生，而是唐代以降的「合成聖花」：以蓮瓣層級為骨、牡丹豐滿為肉、卷草忍冬為勢，再以金線雙鉤收束為圓滿對稱。核心是「層層展開 → 中心結珠 → 外圈祥雲／卷草迴護」，象徵福德圓滿、莊嚴具足，適合作為全站主視覺而不落入單一花卉寫實。

**本週完成圖：** 9:16 iPhone 直幅完成版，黑地金線玉青茜紅，底部 `STONE 原創` 水印。

**網站接入約定：**
- 優先讀取 `public/wallpapers/current-weekly.b64`（純 base64 JPEG）
- 若無該檔，回退到 Supabase `zhaowu-backgrounds` 既有輪播／釘選壁紙
- 不改 calendar／palm／method；不啟用 Netlify／AppDeploy

**狀態（2026-08-23）：**
- 圖片：已生成
- 程式：`site-shell` 已接 weekly 優先載入
- 資產：`current-weekly.b64` 待寫入倉庫後即可上線
