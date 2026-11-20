# 昭梧 ZHAOWU｜多工具 GitHub 交接規範

> **目前唯一交接板：[#1｜昭梧 CURRENT](https://github.com/stoneweiwei-dot/zhaowu/issues/1)。** 本文件說明工具協作方式，不是 CURRENT STATE、產品規格或部署證據。接任工作前，先讀 Issue #1、最新 `main`、`AGENTS.md`、`docs/AI-COORDINATION.md`、`docs/INSTRUCTION-REGISTRY.md` 與 `docs/CURRENT-STATE.md`，並確認相關 Issue、PR 及 task/file locks。上述文件若有衝突，依站主最新明確指示與專案治理文件處理。

## 多工具角色

- **Grok Bot**：在雲端電腦上使用 `gh` 派工與驗收。
- **Codex**：改程式。
- **Antigravity**：瀏覽器與手機版唯讀驗收。
- **智譜清言**：中文內容與插畫構思。
- **WorkBuddy、AI Studio**：登入 GitHub 後讀取 Issue 接任務。

## 共用規則

1. 每個任務只有一個修改者；其他工具只做唯讀審查。
2. 透過 Issue、PR 與獨立 worktree 交接。依 `docs/AI-COORDINATION.md` 宣告任務、檢查任務與檔案鎖，不共用工作分支，也不直接推送 `main`。
3. 每份任務報告附上基準／結果 SHA、測試結果及可核對證據；無法查證的狀態明確標為未驗證或受阻。
4. 未經 Stone 批准，不合併、不部署、不發布、不花錢。CI、本機結果、PR 狀態或 HTTP 200 不可替代所需的正式站或真機驗收。
5. 不在 Git、Issue、PR 或對話中存放金鑰、token、cookie、密碼、service role key 或不必要的個人資料。

## AI Studio GitHub 接入（工具專屬補充）

Google AI Studio Build mode 可使用 GitHub 匯入與同步。GitHub OAuth 授權須由站主在 Google 端完成，其他工具不能代替授權。接入時先唯讀載入倉庫並檢視差異；不得建立昭梧的第二個主倉庫，也不得將 AI Studio 變更直接推送至 `main`。使用獨立分支及 PR；若介面無法選擇分支或安全提交 PR，停止並回報，改用可審查的分支流程。

官方說明：https://ai.google.dev/gemini-api/docs/aistudio-build-mode

## 任務回報格式

```text
TASK | OWNER | STATUS | BASE_MAIN_SHA | BRANCH | PR | FILES_CHANGED | LOCKS_HELD | TESTS | EVIDENCE | NEXT_ACTION
```

本文件遵守 `docs/AI-COORDINATION.md` 的 task lock、file lock、分支隔離與證據規則；如需當前狀態或驗收任務，回到 [唯一交接板 Issue #1](https://github.com/stoneweiwei-dot/zhaowu/issues/1)。
