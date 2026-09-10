# 昭梧｜多語言成本隔離政策

狀態：R102 日本語／한국어本地化硬規則。

## 目的

日本語、한국어以及其他固定網站文案的顯示與翻譯，不得在使用者每次切換語言、排盤、開啟報告時呼叫任何付費 LLM／翻譯 API。這些功能不得消耗站主的模型 token。

## 固定架構

1. 命盤計算層維持 deterministic/rule-based；語言切換不得重新計算四柱、真太陽時、大運或其他命盤資料。
2. 顯示語言層採預先審校的靜態字典、術語表與結構化句型模板，隨前端 bundle 發送到使用者裝置。
3. 日本語／한국어不得採「先生成中文或英文，再即時呼叫模型翻譯」的流程。
4. 本地化模組不得包含 `fetch()`、XHR、WebSocket 或任何 OpenAI、Anthropic、Gemini、Grok/xAI 等模型供應商呼叫。
5. 如果某段日韓文尚未完成，安全 fallback 為已審校英文；不得為了補翻譯而自動呼叫站主 API key。
6. 任何站主模型 API key 不得進入瀏覽器 bundle、localStorage、URL、前端日誌或使用者裝置。

## 關於「使用者自己的流量」

一般網路流量／行動數據與 AI token 帳單不是同一件事。把計算搬到瀏覽器只能讓使用者裝置承擔一般下載、CPU 與記憶體；如果網站後端用站主 API key 呼叫模型，模型供應商仍會向站主計費。

因此昭梧日韓本地化採零 runtime model call：使用者只下載靜態字典與程式碼，不產生任何模型 token 帳單。

## 未來自由生成 AI 功能

若未來增加真正需要 LLM 的自由問答，且要求站主不承擔 token 費用，只允許兩種模式：

- BYOK（Bring Your Own Key）：使用者明確連接自己的模型供應商帳號／key，費用由該使用者的供應商帳戶承擔；或
- 完全在使用者裝置執行的本地模型（只有在品質、下載大小與 iPhone Safari 相容性達標後才可啟用）。

禁止偷偷 fallback 到站主付費 key。

## 驗收

- `src/lib/display-language.ts` 不得包含任何模型／翻譯 API 網路呼叫。
- `ja` / `ko` 只屬 display language；核心 `AppLocale` 不為新增語言而改動計算語義。
- 日韓切換與固定文案顯示的 owner LLM token cost = 0。
- 未完成文案 fallback 不得觸發 runtime 翻譯。
