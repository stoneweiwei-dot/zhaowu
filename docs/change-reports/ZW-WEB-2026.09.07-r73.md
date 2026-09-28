# 昭梧歷史回填｜ZW-WEB-2026.09.07-r73

## 實際 commit
- `744922765b079a44c562977af4dfb47134ca5afd`
- r73: make owner music activation SECURITY INVOKER

## 當時已實作
- 背景音樂 activation 改為 SECURITY INVOKER。
- 讓既有 owner-only RLS 繼續作權限真相。
- anon execute 維持撤銷。

## 現行狀態
後續 owner cookie／same-origin bridge 已改寫登入架構；不要由此檔復活舊 Supabase Auth 假設。