# 昭梧歷史回填｜ZW-WEB-2026.09.07-r74

## 實際 commit
- `2d06fda3c7dd8a691883503659ba10ddad4a7c54`
- r74: fix iPhone Safari duplicate #bazi target

## 當時已實作
- 移除首頁重複 `#bazi` id。
- 四柱 canonical section 保持唯一 anchor，讓 iPhone Safari regression 可穩定定位。

## 現行狀態
現行手機路由與 UI 以 current main + iPhone regression 為準。