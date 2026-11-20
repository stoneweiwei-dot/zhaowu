# ZVec knowledge tool

This is an isolated, non-production knowledge-search tool for ZHAOWU.

## Purpose
- Index only CURRENT governance documents plus a sanitized snapshot of verified classical passages.
- Use ZVec full-text search (N-gram) for fast retrieval by maintainers/agents.
- Keep ZVec out of the browser bundle, auth, payments, Supabase schema, deterministic BaZi calculation, and Production runtime until a separate server-runtime validation is passed.

## Commands
```bash
cd .github/zvec-knowledge
npm ci
npm run smoke
npm run build-index
npm run search -- "R6.2.2 CURRENT MASTER"
npm run search -- "上善若水"
```

The index is rebuilt locally under `.cache/` and is never committed.

## Authority boundary
Default searchable governance corpus is a strict allowlist:
- AGENTS.md
- docs/CURRENT-STATE.md
- docs/FOCUSED-REPORT.md
- docs/ANALYSIS-INGESTION-POLICY.md
- current R6.2.2 master/declaration/six-patches
- R6.2.1 P2/P3 documents still referenced by the current master

Historical registry notes and superseded documents are intentionally excluded from the default index.

## Classical corpus
`verified-classics.json` is a read-only sanitized snapshot taken from active Supabase rows whose `verification_status='verified'` and source nature is `classic`. It contains no auth/user data.

Current limitation: the four Zi Ping core source records added in r208 do not yet have verified passage rows, so they are not fabricated into this index. Add them only after passage-level verification.

## Reliability gate
The smoke test:
1. builds the collection,
2. calls `optimizeSync()`,
3. closes it,
4. reopens it,
5. verifies both CURRENT governance and a verified classical quote are still searchable.

If this gate fails, ZVec remains tooling-only and must not be connected to customer report runtime.


## Media catalog

Media binaries stay in their real storage systems. ZVec indexes metadata and semantic labels only.

```bash
npm run media-inventory
npm run media-smoke
npm run build-media
npm run search-media -- "登入 影片"
npm run search-media -- "背景 音樂"
npm run search-media -- "水元素 山水"
```

Sources:
- Supabase `gallery_assets` + public approved `gallery_asset_knowledge`
- Supabase `background_assets`
- Supabase `background_music_assets`
- GitHub `owner-music` manifest as a legacy audio source

Private report images are intentionally excluded. See `docs/MEDIA-STORAGE-CONTRACT.md`.
