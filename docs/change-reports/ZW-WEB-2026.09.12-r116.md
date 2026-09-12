# 昭梧更新報告｜ZW-WEB-2026.09.12-r116

## 本次改動

- 基於現行 main 重整 #293 品牌資產，Header 使用金葫蘆深藍昭梧原圖，Apple／Android／favicon 使用獨立尺寸檔；不合併 #269 或舊 #293 分支歷史。
- 移除 Header 的舊圓形裁切，保留橫向字標辨識；保留其他功能圖示與夜間主題。
- 收攏 #300 訪客入口與 Logo 為同一批 r116 發布。

- 首頁改為訪客優先：未登入訪客不再看到 Header 的「登入／登录／Log in」入口，可直接填出生資料並進行免費分析。
- 保留既有匿名／訪客資料流程：出生資料只存在目前瀏覽器的 guest scope，免費分析照常執行；只有已登入 session 才寫入會員報告歷史。
- 完整保留 `/login`、Supabase Auth、`/account`、站主 Owner Console、站主圖庫、登出與 owner-only 權限，不刪除站主帳號或登入能力。
- `/account` 在未登入時仍維持受保護狀態並提供重新登入入口，作為站主／會員直接存取時的安全回復路徑。
- Service Worker cache 升至 `zhaowu-shell-r116`，讓已加入主畫面的版本可取得新的訪客優先 Header。

## 為什麼改

一般訪客目前的核心需求是「直接輸入 → 立即分析 → 看答案」，而不是先建立帳戶。現行程式其實已支援匿名分析與 guest localStorage，只是 Header 仍把登入當成主要入口。這一版採最小改動：不重寫 Auth、不用 IP 當身份、不新增匿名後端帳戶，只移除公開登入摩擦，同時完整保留站主登入與私有資料隔離。

## 影響範圍

- 公開 Header 的未登入狀態。
- 免費訪客首次使用體驗。
- PWA / Service Worker shell cache 版本。
- 公開版本號與更新記錄。

## 保護範圍

- 不修改 Bazi／命理計算。
- 不修改 Supabase schema、RLS、站主帳號、密碼、登入驗證、OAuth、會員資料或報告歷史。
- 不把 IP 當使用者身份；現有訪客計數 key 只維持站點統計用途。
- 不修改付款、paywall、付費報告或付費圖片流程。
- 已登入站主仍可看到 `/account`、站主後台與登出控制。

## 驗證

- Deploy gate 必須確認 guest-first contract、release ledger、build 與 TypeScript 全部通過。
- Engine suite 必須保持通過。
- iPhone Safari 回歸必須確認首頁可直接操作，且 Header 不因隱藏登入入口造成橫向溢出或阻塞。
- Production 驗證需確認 `/` HTTP 200、`/login` 仍可開啟、`/account` 未登入仍受保護、Vercel Production SHA 與 GitHub `main` 一致。

## 回滾

本批完整回滾應 revert 本批 commit，恢復 main 基底 fde6fd148b8837f028f6847595f0cb326bb5d2f8 的品牌引用、圖示產生腳本與測試；保留歷史發布記錄。

移除 `guest-first-r116.css` 的 import／規則、恢復 r115 release fallback 與 `zhaowu-shell-r115` 即可。Auth、Supabase 與站主帳號完全沒有被改動，因此不需要資料庫回滾。