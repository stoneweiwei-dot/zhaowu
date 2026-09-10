# Japanese / Korean localisation status

Japanese and Korean are presentation languages. The calculation engine remains on the existing verified locale contract; switching display language must not alter BaZi calculations, stems/branches, chart inputs, timing rules, or stored chart facts.

Current rule:
- `zh-Hant`, `zh-Hans`, `en` remain calculation locales.
- `ja`, `ko` are display languages.
- Japanese/Korean UI strings are translated directly where verified.
- Any specialised narrative not yet localised falls back to English rather than leaking Chinese or changing calculations.

Do not mark Japanese/Korean as fully native report languages until all deterministic report templates have dedicated terminology QA.
