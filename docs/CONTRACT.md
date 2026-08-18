# 昭梧技術契約（ZW-CONTRACT-1.0）

給 GPT／Grok 對碼用。改算法先改版本號，再改程式。聊天裡的口頭版本無效。

倉庫：https://github.com/stoneweiwei-dot/zhaowu  
域名（選定未掛）：https://zhaowu.soul-terminal.com

## 1. 請求管線（零歧義）

```
AnalyzeInput
  → parseInput          src/lib/actions.ts
  → buildChart          src/lib/bazi/chart.ts          0 AI
  → buildPalm           src/lib/palm/engine.ts         0 AI
  → classifyQuestion    src/lib/bazi/interpret.ts      0 AI
  → routeMethods        src/lib/core/method.ts         0 AI
  → interpret           src/lib/bazi/interpret.ts      0 AI
  → AnalysisResult
可選 writeFullReport
  kind === "past"  → composePalmReport                 0 AI
  其他 + XAI_API_KEY → grok-4.5 擴寫
  否則             → composeFullReport                 0 AI
```

`routeMethods` 的 `performance.aiCalls` 永遠是 `0`。前世題禁止再打模型。

## 2. 輸入契約 `AnalyzeInput`

| 欄位 | 型別 | 規則 |
|---|---|---|
| question | string | 必填，trim 後 ≤ 400 |
| year/month/day | int | 1900–2100，日須落在該月 |
| hour | 0–23 | `timeUnknown=true` 時強制 12 |
| minute | 0–59 | `timeUnknown=true` 時強制 0 |
| gender | male \| female \| unspecified | 缺則無大運、一掌經整盤不作判定 |
| relation | any \| hetero \| same \| unset | 只影響感情透鏡，不改盤 |
| city | CityHit | 必填（時區 + 經緯） |
| liveCity | CityHit \| null | 只改半球／生活節奏標註，**不改四柱** |
| ziPolicy | midnight \| late | late 且 hour≥23 才換日柱 |
| useTrueSolar | boolean | true 時用經度 + 均時差改排盤時刻 |

`CityHit`：`name, country, display, latitude, longitude, timezone`。

## 3. 問題分類（順序即優先級，不可重排）

`classifyQuestion` 在 `src/lib/bazi/interpret.ts`：

1. past ← 前世、前三世、六道、輪迴、哪一道、一掌經、三世因果、前世今生
2. home ← 家宅、搬家、店面、風水、住哪、買屋方位
3. choice ← 還是、或者、該不該、要不要、兩個選項、A還是B、選哪
4. health ← 健康、病、痛、醫療、手術、失眠、身體、復原、累、睡不著
5. love ← 感情、戀、愛、對象、結婚、伴侶、桃花、復合、分手、緣分…
6. career ← 工作、職業、轉職、升遷、事業、面試、創業…
7. money ← 財、錢、收入、投資、買房、理財、債務…
8. timing ← 什麼時候、何時、哪年、哪月、時間、窗口、時機、等到
9. self ← 以上皆非

「還是／或者」必須先於事業關鍵字，否則「留職還是離職」會被錯分成 career。

## 4. 方法路由矩陣 ZW-METHOD-1.1

`routeMethods(kind, { palmReady, palmMissing })`  
`selected` 最多 3 張專項 + 子平主判 = 最多 4 卡。

| kind | 主判 | 專項（現況一律資料未接入，除非另註） |
|---|---|---|
| past | 子平 | 達摩一掌經、三世因果歌（palmReady 時為已執行） |
| love | 子平 | 紫微、西方、宿曜 |
| career / money | 子平 | 紫微、吠陀、西方 |
| health | 子平 | 無專項 |
| home | 子平 | 風水、奇門 |
| timing / choice | 子平 | 六爻、大六壬 |
| self | 子平 | 西方、人類圖 |

狀態只准三個：`已執行`｜`資料未接入`｜`本題不啟用`。  
沒有獨立排盤就不得填星曜、宮位、相位、Dasha、卦爻、奇門盤。

剔除（不進付費主判）：天使數字、星際種子身份、阿卡西客觀斷言、五格筆畫、稱骨、純生肖、純納音。

## 5. 一掌經 ZW-PALM-1.0

檔案：`src/lib/palm/engine.ts`

```
yearZhi  = BRANCHES[(lunarYear - 4) mod 12]     // 年宮
monthCnt = lunar.month + (isLeap && day >= 15 ? 1 : 0)
monthZhi = step(yearZhi,  monthCnt,  forward)   // 月宮
dayZhi   = step(monthZhi, lunar.day, forward)   // 日宮
hourIdx  = BRANCHES.indexOf(hourBranchOf(hour)) + 1   // 子=1 … 亥=12
timeZhi  = step(dayZhi,   hourIdx,   forward)   // 時宮
forward  = gender === "male"                    // 男順女逆
step(start, count, fwd) = BRANCHES[ startIndex ± (count-1) ]
hourBranchOf(h) = BRANCHES[floor(((h+1) mod 24) / 2)]
```

缺性別：`ready=false`，四宮空，六道不作判定。  
缺時辰：年日月三宮可排，`latest=null`，`ready=false`。  
`ready===true` 才把一掌經／因果歌標成已執行。

第一句（有時宮）：`最近一世落在{dao}，主星是{zhi}・{star}。`

### 鎖定驗收向量

公曆 1988-10-04、寅時（03:00–04:59）、男命：

| 宮 | 支 | 星 | 道 |
|---|---|---|---|
| 年／前四世 | 辰 | 天奸星 | 修羅道 |
| 月／前三世 | 亥 | 天壽星 | 仙道 |
| 日／前二世 | 戌 | 天藝星 | 修羅道 |
| 時／前一世 | 子 | 天貴星 | 佛道 |

任一格錯 = 引擎退回，不准靠文案圓過去。

## 6. 子平：已實現 vs 憲法未實現

憲法順序（`docs/SPEC.md`）尚未逐步落地。現況只做到：

| 步 | 憲法 | 現況 |
|---|---|---|
| 資料校驗 | 要 | `parseInput` 有 |
| 從化 | 要 | **未做** |
| 月令司令 | 要 | 節氣月支有；司令透藏細則未做 |
| 寒暖燥濕／調候 | 要 | 冬水金→火木、夏火木→水金 等簡表 |
| 透藏根勢 | 要 | 藏干權重計分，非正式根氣表 |
| 格局體用 | 要 | **未做** |
| 病藥 | 要 | 用 `useful`/`drain` 近似，非正式病藥 |
| 流通／承載 | 要 | 文案層，非正式推演 |
| 刑沖合害庫 | 要 | **未做**（合≠化、沖≠凶 已寫進文案禁令） |
| 歲運 | 要 | 有大運＋流年干支；沒有歲運作用鏈 |

旺衰：得令／得地／得勢，hits≥2 偏旺，=1 中和，=0 偏弱。  
**禁止**用五行百分比當主判。`elementPercents` 只是內部計分，正文不得寫「木 32% 所以補木」。

月令 = 太陽黃經節氣月，不是公曆月。1988-10-04 必須是酉月，不是戌月。

南半球：`liveCity.latitude < 0` → `hemisphere="S"`。只改生活季節敘述，**八字五行不反轉**。

## 7. 直答與報告

`interpret()` 永遠 0 AI，回 `Reading`：

`kind, directAnswer, rhythm, work, love, money, body, home, action, decree, lastLine, guide`

`directAnswer` 硬規則：

- 第一句嵌原問並給判斷
- 禁開場：不知道、資料不足、難以判斷、僅供參考、不保證
- 缺時辰／缺大運：用原局＋流年＋日支繼續下判斷
- 選擇題：`leanChoice` 必須選邊。move 詞＝轉離走換創出國分手結束辭跳；stay 詞＝留穩先等維持繼續忍復合。偏旺取 move，偏弱取 stay
- 健康題必須寫「已有痛、失眠、掉力就去看醫生」
- 前世題第一句給六道＋主星；邊界句後置

`composeFullReport` 九段標題（規則底稿，不是付費九頁母稿）：

1 你真正問的問題　2 這張盤為什麼這樣排　3 整體人生節奏  
4 反覆出現的課題　5 個人命誥　6 生活使用說明  
7 顏色方位時段　8 一個最高優先行動　9 最後一句

付費九頁商業母稿、命誥圖 9:16 **尚未接線**。GPT 出結構，Grok 再接。

## 8. 檔案鎖

| 檔 | 誰可改 | 條件 |
|---|---|---|
| `src/lib/palm/engine.ts` | 僅 Grok | 升到 ZW-PALM-1.1，並重跑驗收向量 |
| `src/lib/core/method.ts` | 僅 Grok | 升到 ZW-METHOD-1.2 |
| `src/lib/bazi/calendar.ts` | 僅 Grok | 節氣／農曆表動了必須對月令驗收 |
| `src/lib/bazi/chart.ts` | 僅 Grok | 不得改成五行計數主判 |
| `src/lib/bazi/interpret.ts` 分類與選邊 | 僅 Grok | 文案句子 GPT 可提，分類順序不可私改 |
| `src/lib/actions.ts` 前世短路 | 僅 Grok | `kind==="past"` 必須 0 AI |
| 直答／命誥／九頁文案 | GPT 起草 | 不改函式簽名 |
| 命誥圖提示詞、卷軸版式 | GPT | 圖像與文字解耦 |
| WordPress / AppDeploy 舊站 | 誰都不要雙寫 | 禁止 MutationObserver 搶 form-title |

客單禁止：Stone 本人四柱、經歷、「靛淵龍星」。

民間課件分類見 `docs/lexicon/`。十神只作功能，神煞不進主判。

## 9. Issue 模板

標題：`[给Grok] …` 或 `[给GPT] …`

```
要改：
不要改：
驗收句：
鎖定檔案：
做完回：改了哪些檔 / 驗收過沒過 / 下一步交給誰
```

回覆表（GPT 審查用）：

| 項 | 判定 | 下一步 |
|---|---|---|
| … | 保留 / 簡陋 / 違規 | 改文案 / 交給 Grok 接線 / 不動 |
