# Japanese / Korean / Hindi localisation status

Japanese, Korean, and Hindi are presentation languages. The calculation engine remains on the existing verified locale contract; switching display language must not alter BaZi calculations, stems/branches, chart inputs, timing rules, or stored chart facts.

Current rule:
- `zh-Hant`, `zh-Hans`, `en` remain calculation locales.
- `ja`, `ko`, `hi` are display languages.
- Fresh sessions default to `zh-Hans`; an existing saved display-language preference is preserved.
- The global selector order is `English → 简体 → 繁體 → 日本語 → 한국어 → हिन्दी`.
- Japanese/Korean/Hindi UI strings are translated directly where verified.
- Any specialised narrative not yet localised falls back to English rather than leaking Chinese or changing calculations.
- Hindi uses `hi-IN` for locale-sensitive number/date formatting.

Do not mark Japanese, Korean, or Hindi as fully native report languages until all deterministic report templates and specialised narrative modules have dedicated terminology QA.
