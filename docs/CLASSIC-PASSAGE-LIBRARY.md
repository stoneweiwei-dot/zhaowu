# 昭梧｜經典句庫與個人匹配規則

## 目的

免費綜合命勢圖與完整報告可依每份命盤／問題／人生階段，從已核對的中國經典中選出一段真正存在的原文。不得由模型把自作文句冒充經文。

## 資料層

- `classic_sources`：經典與版本來源。
- `classic_passages`：可匹配段落、精確出處、繁簡原文、匹配標籤、驗證狀態。
- `classic_passage_matches`：將某份 `report_requests` 與選中的段落固定綁定，避免已保存報告日後重新抽到不同經文。

三表均啟用 RLS；`anon` / `authenticated` 不可直接讀取整個句庫。只允許 `service_role` 管理與匹配，防止前台直接把完整資料庫抓走。

## 真偽門檻

匹配引擎只讀：

1. `verification_status = 'verified'`
2. `is_direct_quote = true`
3. `verified_against` 非空且有 `verified_at`
4. 經典來源 `is_active = true`

`pending`、後世註解、昭梧自作文案、來源未核對文本一律不得當成經文輸出。

## 匹配輸入

`match_classic_passage(context, limit)` 接收 JSON：

- `themes`：順勢、清明、落地、不執等核心課題
- `elements`：木火土金水
- `stems`：甲乙丙丁戊己庚辛壬癸
- `branches`：十二地支
- `questions`：事業、關係、財務、健康、自我、選擇、時機等
- `life_stages`：起步、上升、轉折、守成、成熟、壓力等
- `avoid`：不適合輸出某段經文的高風險情境
- `stable_key`：同分時的穩定排序鍵

分數優先級：核心主題 > 問題類型 > 五行／天干 > 人生階段 > 地支；另有小幅 `score_bias`。`avoid_tags` 命中即排除。

## 報告固定

`select_classic_passage_for_report(report_id, context, slot)` 第一次選中後寫入 `classic_passage_matches`。同一報告、同一 slot 再次讀取時直接返回已保存段落，不重新抽取。

建議 slot：

- `free_summary`：免費綜合概括圖底部經典節錄
- `full_report`：完整報告中的對應經句
- `share_card`：分享圖卡（如日後需要）

## 前台呈現規則

經文必須顯示：`《經名》＋篇章／品名＋原文`。若需要昭梧另外寫四句命箴，必須另標「昭梧命箴」，不得和原經文連排成同一引文。

## v1 已核對來源

首批只放已核對的少量段落，不假裝資料庫已經有上千條。來源包含《道德經》《莊子》《周易》《太上老君說常清靜經》《黃帝陰符經》《金剛般若波羅蜜經》《般若波羅蜜多心經》《維摩詰所說經》。後續擴庫時沿用同一驗證門檻，逐條增加，不以數量犧牲真偽。
