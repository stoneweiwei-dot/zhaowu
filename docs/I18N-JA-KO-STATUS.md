# Localisation status

The calculation engine remains on the existing verified locale contract; switching display language must not alter BaZi calculations, stems/branches, chart inputs, timing rules, or stored chart facts.

Current rule (2026-10-02 owner three-language instruction; supersedes r102/r107 withdrawal of Simplified Chinese):
- `zh-Hant`, `zh-Hans`, `en` remain calculation locales.
- Front-end selector: `English → 繁體 → 简体`.
- Fresh sessions default to `zh-Hant`.
- Saved `zh-Hans` is a valid persisted choice. Saved `ja`, `ko`, `hi` preferences fold to `zh-Hant`.
- Japanese, Korean and Hindi remain withdrawn from the selector (dormant code only).
- Any specialised narrative not yet localised falls back to English rather than leaking Chinese or changing calculations.
- Hindi uses `hi-IN` for locale-sensitive number/date formatting.

Do not mark Korean or Hindi as fully native report languages until all deterministic report templates and specialised narrative modules have dedicated terminology QA.
