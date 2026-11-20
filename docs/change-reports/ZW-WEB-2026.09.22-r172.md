# 昭梧歷史回填｜ZW-WEB-2026.09.22-r172

## 實際 commit
- `564dc67a7ca0a48931168912988b9716be94b935`
- r172: final canonical and CSS entry cleanup

## 當時已實作
- 恢復 Vercel 為唯一 canonical public origin。
- 55 個歷史 global CSS imports 收斂到 compatibility bundle，同時保存 source order / cascade semantics。
- 大量 UI regression tests 同步。

## 現行狀態
Vercel-only canonical 規則仍有效；visual authority 後續由 `zhaowu-design-system.css` 明確鎖定。