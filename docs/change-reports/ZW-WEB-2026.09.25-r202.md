# 昭梧歷史回填｜ZW-WEB-2026.09.25-r202

## 實際 commit
- `51897b2f79fd347fc0e7c2051929b987de255808`
- r202: Home Screen PWA self-healing updates

## 當時已實作
- 新 service worker activate 後可刷新同源 Home Screen root client。
- 深層 route 保留既有 release checker，避免 navigation race。
- 更新 `scripts/pwa-live-update.test.mjs` 與 SW template。

## 現行狀態
r203 進一步補上 deep-route installed PWA 自癒；CURRENT 以 r203+ 為準。