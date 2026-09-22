# 昭梧更新報告｜ZW-WEB-2026.09.22-r175

## 本次改動

- 修正 IntroGate 的 skip-after-seen：`shouldSkipIntroGate` 現在會讀取既有 `zhaowu.intro.seen.r148`。
- `zhaowu.intro.force=1` 維持最高優先級，可強制顯示開場。
- 首次一般訪客仍顯示開場；完成後同一瀏覽器重新整理或重新掛載 IntroGate 會直接跳過。
- 同步修正 intro regression test，避免 CI 再把「每次 app boot 都播放」當成正確行為。

## 為什麼改

`markIntroSeen` 原本已在正常結束與硬退出時寫入 seen key，但 `shouldSkipIntroGate` 沒有讀回該 key，造成重新整理或重新掛載時重播 Loading。這與現行 Registry 的 skip-after-seen 契約不一致。

## 影響範圍

- `src/lib/intro-gate-policy.ts`
- Loading 首訪／回訪判斷
- Intro regression test
- Release metadata

## 受保護範圍

- 不改 Loading 影片與 poster。
- 不改五秒最短顯示時間、八秒硬退出與 fade 時間。
- 不改 IntroGate 元件結構、聲音控制或 bootstrap。
- 不改命理計算、Auth、Payment、Supabase schema／資料。

## 驗證狀態

- 單元契約必須驗證：空 storage + 一般訪客＝顯示；seen=1＝跳過；force=1＝無論 seen／webdriver 都強制顯示。
- Production build 必須通過現有 Deploy gate。
- 上線後必須確認 Production SHA = main，並實測首次播放後重新整理不再重播。

## 回滾

若回訪判斷造成非預期行為，只需回滾本版 IntroGate policy 與對應測試；影片、元件與其他 runtime 未被修改。
