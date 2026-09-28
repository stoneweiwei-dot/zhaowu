# 昭梧歷史回填｜ZW-WEB-2026.09.07-r72

> r210 稽核回填；依真實 Git commit 補記。

## 實際 commit
- `815756cb0c54906bf2bc56f156b4cdf25b537691`
- r72: Supabase security advisor hardening

## 當時已實作
- 撤銷 anon 對 owner-only 背景音樂 RPC 的執行權。
- helper function 固定安全 search_path。
- 保留刻意 private 的 RLS-without-policy 表與受限 customer classic-passage RPC。

## 現行狀態
安全邊界已被後續 r162+ hardening 延續；本檔僅補齊歷史 release evidence。