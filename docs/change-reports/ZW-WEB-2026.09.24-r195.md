# 昭梧歷史回填｜ZW-WEB-2026.09.24-r195

## 實際 commit
- `71b41964bd2526798c2bbaf741de27fb6b48524a`
- r195: separate classic source nature from verification status

## 當時已實作
- Supabase migration：`20260924150000_classic_source_nature_status.sql`。
- 將 classic source 的「來源性質」與 passage verification status 分離，避免把古籍身份與逐條驗證狀態混為一談。

## 現行狀態
r208 的古籍來源治理建立在這個分離模型上。