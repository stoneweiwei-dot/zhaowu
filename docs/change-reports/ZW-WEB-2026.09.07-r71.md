# 昭梧歷史回填｜ZW-WEB-2026.09.07-r71

> r210 稽核回填。此檔只記錄既有 Git 歷史，不代表 2026-09-27 新增 runtime。

## 實際 commit
- `fdf1fc0a65b9f320bf9396402a279a57c1f25798`
- r71: adaptive homepage intro timing + QA report mode

## 當時已實作
- Loading 改為自適應約 3 秒目標、5 秒安全上限並保留 fail-open。
- 更新 intro timing regression。
- 新增 `docs/QA-CHECK-REPORT-MODE.md`，記錄站主 QA report workflow。

## 現行狀態
Loading／Intro 規則之後已多次被 r191–r204 supersede；不得從本歷史檔復活舊播放行為。