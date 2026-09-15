# 昭梧命理系統能力地圖｜2026-09-15

狀態：`ACTIVE SYSTEM MAP`

目的：把 2026-09-15 上一輪完整系統盤點同步進正式網站與原始碼，避免「建議曾經說過」卻沒有可追蹤狀態，也避免把研究規格誤報成已完成功能。

Runtime source：`src/lib/system-capability-map.ts`
客戶可核對頁：`/knowledge/system-map`
主判母指令：`docs/STONE-R6.2.1-CURRENT-MASTER.md`
新資料入庫：`docs/ANALYSIS-INGESTION-POLICY.md`

## 狀態語義

- `active`：現行 Production 已有對應能力。
- `partial`：已有真實能力，但上一輪提出的完整形態尚未全部完成；不得把缺口冒充已實現。
- `planned`：已同步為正式系統規格／產品方向，但未完成 runtime。
- `research`：只進研究層，不進正式主判。
- `private`：私人文化檔案，不預設公開個資。
- `fun`：趣味／生活象意，與正式命盤分區。

## 2026-09-15 完整同步清單

1. `evidence-governance` · `P0 / active` 全站證據／可信度治理層：A/B/C/D、反證、資料不足、象徵邊界。
2. `core-variable-lock` · `P0 / partial` 核心變量鎖定＋矛盾檢測：月令、從化、寒暖燥濕、格局、病藥、承載；服從 R6.2.1 Stage Checkpoint / No Silent Reinterpretation。
3. `vedic-jyotish` · `P0 / partial` 獨立 Jyotish：D1 為根，Bhava／Moon／Dasha／Transit／Vargas 分權；D60 已有 Gate，但未驗證的 deterministic D1/D9/Dasha 不得偽造。
4. `dharma-one-palm` · `P0 / partial` 達摩一掌經：四世／星曜／六道／習氣定位為文化因果敘事；D60 不得嵌回 `/yizhangjing`。
5. `cross-system-synthesis` · `P0 / planned` 跨系統綜合報告：共同指向／新增／衝突／不可比較，禁止硬湊一致。
6. `birth-time-rectification` · `P1 / planned` 30 題考時定刻：候選時間、區分力、支持／反證矩陣、最佳／次佳；禁止用 D60 循環考時。
7. `bazi-relation-resolver-v2` · `P1 / partial` 八字動態關係 Resolver v2：月令＋透干＋根氣＋位置＋病藥＋歲運裁決合沖刑害破／三合三會的有效作用。
8. `daily-almanac-sacred-calendar` · `P1 / partial` 每日黃曆＋宗教聖日：傳統日曆與個人流日分層；聖誕／成道資料必須有可核來源。
9. `report-share-cards` · `P1 / active` 報告 → 9:16 分享卡：沿用現有 share-card，不重造第二套；程式排中文字層。
10. `metaphysics-source-library` · `P1 / partial` 命理知識來源庫：來源、版本、流派、可信度、superseded 狀態；古籍原文與今人整理分開。
11. `fengshui-form` · `P1 / research` 形勢風水：平面圖／照片／朝向，資料不足 fail closed；與八字／玄空分開。
12. `genealogy-name-culture` · `P2 / private` 宗族族譜＋姓名文化：族譜、世系、輩字、字源分證據；私人資料不預設公開。
13. `sixty-jiazi-encyclopedia` · `P2 / planned` 六十甲子日柱百科：單柱只是局部象義，不可取代四柱主判。
14. `five-element-music` · `LOW / fun` 五行 × 音樂／聲音偏好：生活象意／趣味，不能反證命局。
15. `fun-symbolic-tools` · `P2 / fun` Love Type／寵物命名／守護獸：可擴展，但不冒充正式命盤。

## 四條硬邊界

1. `symbolic-only` — **超自然身份只准象徵層**：Starseed、仙緣、童子、通靈、雙生火焰、具體前世身份不得進子平主判，也不得寫成已證實歷史事實。
2. `experimental-only` — **爭議模型只進研究室**：南北半球改四時、12 宮／海王星靈擾、五行之外「月行」等只可作研究假設。
3. `d60-gate` — **D60 嚴格分鐘 Gate**：精確分鐘才提高權重；±2 分鐘不穩降弱旁證；永遠不用 D60 循環反推出生時間。
4. `calculation-truth` — **計算真相與解釋真相分離**：沒有 deterministic engine、來源 profile、test vectors，不得聲稱盤面已算出；新研究資料不得偷改 calculation truth。

## Supersession / 去重

- 現有 `evidence-governance`、D60 Gate、share-card、每日指引、branch relations、四庫、病藥、knowledge modules 直接沿用；不因本次同步再造平行實作。
- 舊 V4／R6.1／Library Prompt 只吸收與 R6.2.1 不衝突的內容；衝突時以 R6.2.1、CURRENT-STATE、main / Production 為準。
- 「同步到系統」的完成條件是：15 項與 4 條邊界在 runtime map、文件與可核對頁中一一存在並有真實狀態；它不把 `planned/research/partial` 語義偷換成「功能全部開發完成」。
