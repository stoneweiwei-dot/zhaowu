# Localisation status

The calculation engine remains on the existing verified locale contract; switching display language must not alter BaZi calculations, stems/branches, chart inputs, timing rules, or stored chart facts.

Current rule (r107):
- `zh-Hant`, `zh-Hans`, `en` remain calculation locales.
- Front-end selector: `English → 繁體 → 한국어 → हिन्दी`.
- Fresh sessions default to `zh-Hant`.
- Saved `zh-Hans` or `ja` preferences fold to `zh-Hant`.
- Simplified Chinese and Japanese are withdrawn from the UI. Internal content tables may still keep `zh-Hans` so report tests do not need a mass rewrite.
- Korean and Hindi remain display languages.
- Any specialised narrative not yet localised falls back to English rather than leaking Chinese or changing calculations.
- Hindi uses `hi-IN` for locale-sensitive number/date formatting.

Do not mark Korean or Hindi as fully native report languages until all deterministic report templates and specialised narrative modules have dedicated terminology QA.
