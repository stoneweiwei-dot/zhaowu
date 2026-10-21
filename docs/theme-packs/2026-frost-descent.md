# 昭梧｜霜降 Frost’s Descent · 2026 宋式主題設計包（待接入）
狀態：**設計稿／圖像已在對話中生成，GitHub binary 尚未上傳；未加入 SKINS、未套用、未部署**。
範圍：只使用現有 `stoneweiwei-dot/zhaowu` → `main` → `stone-zhaowu-official`；不得創建第二正式站。

## 1. 節氣與雙語標題
- 節氣（繁／簡）：**霜降**；英文：**Frost’s Descent**。
- 宋式畫題（繁）：**霜林歸靜**；簡：**霜林归静**；英文：**Quietude Among Autumn Trees**。
- 首頁、後台主題卡、分區畫題均要同時顯示中文節氣名和英文名；中文採繁／簡 locale，英文固定可見。網站 DOM/CSS 控制字體、標題、按鈕、候名、格言；無字原畫不可烘焙 UI。
- 三候（傳統中國北半球物候）：初候「豺乃祭獸」Jackals Present Their Prey；二候「草木黃落」Leaves and Grasses Turn Yellow；三候「蟄蟲咸俯」Hibernating Creatures Settle Down。悉尼僅作排程時區，不能把這些物候誤稱悉尼當地季節。

## 2. 悉尼 00:01 內容排程
- 2026-10-23 00:01 AEDT：霜降皮膚＋初候圖文；
- 2026-10-28 00:01 AEDT：二候圖文；
- 2026-11-02 00:01 AEDT：三候圖文；
- 下一節氣開始前停用霜降輪替；依權威節氣日曆校對下一節氣日期。
- **00:01 是站內排程時間，不是天文交節瞬間。** 若要求 00:01 準時顯示，資產必須提前生成、審核、發布，並由已部署的排程選擇器在當地日期切換；不能依賴 00:01 才開始付費／耗時生圖。

## 3. 無字圖資清單（已於本次 ChatGPT 對話生成，尚未上傳 repo）
| 角色 | 預期 repo 路徑 | 用途 |
| --- | --- | --- |
| 9:16 主圖 | `public/theme-skins/solar-frost-descent-hero.webp` | 首頁與主題預覽 |
| 9:16 備選一 | `public/theme-skins/solar-frost-descent-leaves.webp` | 二候與圖庫 |
| 9:16 備選二 | `public/theme-skins/solar-frost-descent-valley.webp` | 三候與圖庫 |
| 今日指引 | 主圖/備選按容器裁切 | 不額外增加重複大圖 |
| 深度解讀、命書、登入、帳戶、靈籤 | 同一套淡彩背景、細金線、局部插畫裁切 | 保留連續紙面 |
| Loading／空狀態 | CSS 細線和輕量 SVG（若經 QA） | 不烘焙文字 |

本次已從同一組原創宋式畫作另行裁切 8 張分區 WebP：`today-guide.webp`、`deep-reading.webp`、`report-cover.webp`、`login-wash.webp`、`account-wash.webp`、`spirit-slip.webp`、`loading-state.webp`、`empty-state.webp`；它們是分區裁切，不是 8 張獨立生圖。\n\n二進位 WebP 需經可驗證的上傳途徑放入 repo，確保 200/尺寸/色彩空間與許可，不能以本地設計包或圖片工具輸出冒充正式站資產。

## 4. 全站設計 token
- 宣紙底：`#F6F1E6`
- 主墨：`#253D38`
- 次墨：`#526963`
- 礦青綠：`#507D7C`
- 淡金：`#B59A70`
- 細線：`#C8B79C`
- 霜葉赭：`#B87345`
- 次層紙面：`#F2ECE0`
- 連續閱讀面、低對比細分隔線；不得使用亮白貼片、厚陰影、滿版金邊或低對比小字。互動目標至少 44px；390px 不可橫向溢出。

## 5. 原創短句／格言（三候）
| 候 | 繁體 | 簡體 | English |
| --- | --- | --- | --- |
| 初候 | 知進是勇，知止亦是智慧。 | 知进是勇，知止亦是智慧。 | Knowing when to advance takes courage; knowing when to stop takes wisdom. |
| 二候 | 葉落不為失去，是把生長交還土地。 | 叶落不为失去，是把生长交还土地。 | A falling leaf is not a loss; it returns growth to the earth. |
| 三候 | 懂得收斂的人，才守得住下一次生發。 | 懂得收敛的人，才守得住下一次生发。 | Those who know when to withdraw can protect their next beginning. |

## 6. 接入既有主題後台的必備條件
1. `src/lib/theme-skins.ts` 的 `SKINS` 加入獨立節氣皮膚定義，且主圖路徑已實際存在；
2. `lib/owner-site-skin-public.js` 的 `SITE_SKIN_IDS` 白名單同步，既有 owner cookie/same-origin POST 保持不變；
3. 依現有 `src/theme-skins.css`、`src/theme-skins-sets.css`、`src/theme-skins-full.css` 令全站一致；首頁 `PaintedHome` 與 owner manager 用真實 DOM 同時呈現「霜降 Frost’s Descent」；
4. **自動套用需要顯式的「節氣自動模式」與站主可操作的手動回退**，不能在未驗證時強行覆蓋現有共用主題選擇；
5. 確認正式站 runtime SHA、圖片 URL、三語、390px、可讀性、日／夜模式、回退，才可合併既有 main 並只部署一次；
6. 七十二候更新優先用已部署素材與日期計算切換，不每五天觸發新 Vercel build；
7. 不碰付款、登入、排盤、Supabase schema、秘密、額外付費服務。

## 7. 現有證據與阻塞
- 2026-10-21 查核 `main` SHA `35baa8d4bf0a636f4c83f24db059f9e1da5383b8`，唯一 Vercel Production `READY` 同 SHA。
- 既有主題目錄 25 款，`owner-theme-skins-manager.tsx` 使用 `SKINS`；`publishSkin` 向 `/api/owner-data` 以站主憑證提交；伺服器另有 `SITE_SKIN_IDS` 白名單。
- 本對話生成三張 9:16 WebP、三語 HTML 預覽與 manifest，可下載交付；**尚未將二進位圖資上傳至 GitHub**。
- 目前沒有經過正式站 390px、三語、無溢出和手動回退驗收；因此不允許宣稱上架／部署／自動套用完成。
