# 昭梧更新報告｜ZW-WEB-2026.09.15-r140

## 本次改動

r140 補上 r139 把 D60 從「前世今生」搬走之後，印度古法卷幾乎永遠空白的缺口。

### D60 分組確認分鐘後必須生成
- `/indian-astrology` 仍先確認「這是可核對到分鐘的出生時間」。
- 確認後一律渲染 `D60KarmaSection`：D1／D60 表、十二宮命盤、五個主題白話。
- ±2 分鐘會改上升細分時，盤面仍輸出，標為弱旁證；只有計算失敗才維持【不作判定】。
- 不用 D60 反向考時。不改 Astronomy Engine／Lahiri／Ascendant／D60 分段公式。不得 merge #304。

## 為什麼改

站主要求「把 D60 那個分組生成好，目前 d60 的分析在前世那裡，把它全部平移到 D60 自己的那個分組里」。r139 只完成平移。印度卷的 ±2 分鐘 Gate 對幾乎所有時辰都會判定不穩，結果使用者確認分鐘後仍只看到空白【不作判定】。前世頁原本的 D60 在不穩時仍會當弱旁證輸出；平移後不該比原來更空。

## 影響範圍

- `src/components/d60-reliability-gate.tsx`
- `src/lib/specialist-reading.ts` 本卷總覽文案
- `scripts/d60-reliability-gate.test.mjs`、`scripts/r139-home-d60-auth.test.mjs`
- PWA cache `zhaowu-shell-r140`

不改八字／紫微／D60／西洋計算公式，不改登入、音樂上傳、首頁生辰。

## 回滾

還原本 commit。回滾後確認分鐘若 ±2 分鐘不穩，印度卷會再回到空白【不作判定】。
