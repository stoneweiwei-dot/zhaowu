# 昭梧歷史回填｜ZW-WEB-2026.09.14-r128

## 實際 commit
- `58ee4a9bd923a790b42a954b7764c753a7887454`
- r128: independent owner login without Supabase Auth

## 當時已實作
- standalone owner-key login。
- secure owner cookie path。
- owner access 不再依賴 Supabase Auth。
- login/account/auth provider 與 E2E/contracts 同步更新。

## 現行狀態
此架構仍是 CURRENT 的重要前提：owner cookie/session 與 Supabase Auth 分離。