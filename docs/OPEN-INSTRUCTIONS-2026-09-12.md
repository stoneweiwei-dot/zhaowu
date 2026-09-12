# 昭梧未完成指令對帳｜2026-09-12

最新 runtime 核對基底：Production `4487edd0f921b04ad84f09636ed83838c1000dd0`，Vercel deployment `dpl_A8zzyGVSyekFpCDB5kK8FUTsmi7C` 為 READY／production。PR #306 起的 docs-only 合併會讓 GitHub `main` 前進，但不改 runtime Production；對應 Vercel deployment 依 ignore 規則標為 CANCELED。Sites appgprj_6aa51f3fb7e881919ef1b3ac22ce416a 是私人管理入口，並非第二個正式站。

| 指令 | 判定與處理 | 證據／剩餘驗證 |
|---|---|---|
| 訪客直接免費使用、保留站主登入 | r116 訪客入口；r119 收斂為 owner-only | 普通用戶無登入／註冊入口；唯一 `/login` 為站主 Email＋密碼，真實 owner session 仍待端到端驗證 |
| 金葫蘆＋深藍昭梧 Logo | r116 重整、r117 修正裁切；未合併 #269 | r117 正式 Header 132 × 54 完整顯示；Apple／Android／favicon 分別引用 |
| PWA 自動更新 | 保留並升 cache r117 | skipWaiting、clients.claim、舊 cache 清除保留；真 iPhone 已安裝更新仍待實測 |
| 五行穿衣與近日天象 | 已存在，不重做 | 正式首頁已顯示；/daily-colors、/sky-events；天象自動更新尚無本次證據 |
| 首頁各分組完整說明、客資與八字獨立、大師數合併 | 已有實作 | 正式首頁可讀；完整使用者報告仍須端到端驗證 |
| Supabase 公共美工節流、圖庫縮圖、延遲載入 | r111-r115 已有實作 | 公共媒體改同源；r115 發布記錄存在。未刪 storage 資料 |
| D60 精確分鐘與順逆切換 | 已有元件與 r113 修復 | 尚缺獨立星曆比對與真機完整流程；不捏造計算驗證 |
| 圖片失敗仍交付文字 | 已有 fallback 與測試 | 真 provider 成功、額度及登入存檔仍需真實流程證據 |
| 多語 | 現行公開繁中/en/ko/hi | 不復活舊公開簡中選項；各語完整報告仍需驗證 |
| 登入、私人歷史、付費流程 | r119 鎖為站主專用 | 缺真實 owner 登入／帳戶／報告重開／付費端到端證據，不能以頁面 HTTP 200 代替 |
| 付費圖片持久化 #295 | 站主明確暫停 | 不合併，不阻擋免費工作 |
| Netlify/AppDeploy 遷移、舊 23:00 換日 | 已取消／被取代 | Linear STO-16/STO-15，不恢復 |
| 正式自訂域名 DNS | 舊文件列待辦，未確認仍需要 | 唯一有效正式地址沿用 Vercel，無必要不改 DNS |
| 八字全格局取用驗證 | 研究驗證未完成 | 不以顏色數量模板取代現有判法 |

r117 的畫面驗證依 PR CI、Vercel Production、正式 URL 與發布帳更新；目前 main／Production exact SHA 已前進到 `4487edd…`。後續版本未重新驗證的項目不標完成，不得把這份對帳視為真機、真實登入或付費測試通過證明。
