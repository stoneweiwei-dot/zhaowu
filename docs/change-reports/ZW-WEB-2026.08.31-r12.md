# ZW-WEB-2026.08.31-r12

## What changed

- Added two new multilingual reader essays to `昭梧 · 觀世錄`:
  - `world-as-mirror-not-physics`
  - `karma-is-not-blame`
- Added `docs/research/2026-08-31-source-intake.md` to classify the 2026-08-30～31 source intake into:
  - public essay material
  - 子平補證
  - Buddhist/Daoist iconography reference
  - historical/astronomical research
  - unverified hypotheses
  - report-template reference
- Restored `supabase/functions/generate-decree-image/index.ts` to the last complete production-verified Gallery-direct implementation after the current main copy had been truncated and could no longer pass existing decree/gallery contracts.
- Removed the test-only contract for the unverified four-pillar premium composition edit because that edit never reached a READY production state and its source file was truncated in main.
- Bumped the public fallback release ledger to `ZW-WEB-2026.08.31-r12` / update `12`.

## Why

The user asked to finish integrating the previously uploaded source files into Zhaowu. The source material contains several different epistemic layers and cannot safely be merged into one destiny calculation system. This release preserves Zhaowu's 子平-first calculation contract while making suitable philosophical material readable in `觀世錄` and recording the remaining sources with explicit usage boundaries.

Production was also blocked by an unrelated but reproducible regression already present on `main`: `generate-decree-image/index.ts` had been reduced to only its opening helpers, causing existing Gallery/decree regression tests to fail. Restoring the last verified complete implementation is the smallest safe rollback required to make the requested content releasable.

## Affected scope

- Homepage `觀世錄` article content and multilingual rendering.
- Repository research/source classification documentation.
- Source copy of the decree-image Edge Function used by regression contracts and deployment build validation.
- Public release footer fallback metadata.

## Protected scope left unchanged

- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts`
- Bazi month-order / solar-term calculation
- Ziwei calculation truth layer
- Qizheng engine
- Palm / Yizhangjing core
- Auth and payment
- Supabase schema, permissions, environment variables and production data
- Existing customer reports and report history

## Source guardrails added

- 胎元、命宮、身宮：胎元可留，命宮可參，身宮慎用；三者只補證，不奪四柱主判權。
- 南北半球資料：保留全球統一天文節氣排盤；本地季節與氣候只作環境／調候旁證，不直接倒轉月令。
- 文玩五行：結構優先、喜用為綱、類象不等於功效，禁止「缺什麼補什麼」與療效宣稱。
- 佛教／道教對照：經典系統、象徵映射與創作映射分層，未核驗內容不標 authoritative。
- 八字 × 紫微寒燥共振：只作待驗證假說，不進 Calculation Truth Layer。
- 十二次／歲星／太歲：只作天文史研究，不能直接推出個人八字吉凶。
- 業力與災難：自然與物理機制優先，禁止以業力責難受災者。

## Rollback path

Revert this release commit. The previous public article sources remain independent, and the decree backend can be restored from the last READY production blob used before the truncation regression.

## Verification state before merge

- Source classification: reviewed against the uploaded files.
- Release ledger: updated in code fallback and matching change report created.
- Supabase `release_history`: intentionally not written in this change because the active project instruction forbids Supabase data writes without explicit authorization.
- CI / Vercel / production verification: pending the single GitHub → Vercel production build for this release.
