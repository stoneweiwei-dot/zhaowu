# BaZi independent-oracle fixtures

Consumed by `scripts/bazi-pillar-accuracy.test.mjs`. Every value comes from software that shares **no code or formulas** with `src/lib/bazi`.

| Fixture | Oracle | Content |
|---|---|---|
| `solar-terms-1900-2100.json` | sxtwl (Xu Shi-ji SSQ) + astropy/ERFA (apparent geocentric ecliptic longitude, Newton solve) | 12 month-opening 節 × 201 yrs, `[sxtwl_s, astropy_s]` UTC epoch seconds. Oracles agree ≤16 s (1930–2025), ≤36 s (1900–29), ≤58 s (2026–50), ≤151 s (2051–2100, ΔT extrapolation) |
| `true-solar-cases.json` | astropy/ERFA GAST − apparent RA, tz via python `zoneinfo` | 1499 seeded cases, 14 cities, 1930–2026: `oracleShiftMin`, `offsetHours` |
| `hour-pillar-sxtwl.json` | sxtwl `getShiGz` | 10 day-stems × 24 h, `plain` (23:xx keeps same-day stem = Zhaowu `ziPolicy:"midnight"`) and `zaowan` (晚子時) |
| `day-pillar-sxtwl.json` | sxtwl | 1054 anchor dates 1900–2100 |
| `dayun-cases.json` | lunar-javascript (6tail), sect 2 | 400 seeded charts: pillars, direction, first 大運 pillar & startYear |

Regenerate (deterministic seeds): see `generate/`. Needs `pip install sxtwl astropy` and, for dayun, `npm i --no-save lunar-javascript` (not committed).

```
python3 generate/oracle_terms.py 1900 2100 solar-terms-1900-2100.json
python3 generate/oracle_tst.py true-solar-cases.json
python3 generate/gen_hours.py hour-pillar-sxtwl.json
python3 generate/gen_days.py day-pillar-sxtwl.json
node    generate/gen_dayun.mjs dayun-cases.json 400     # run from a dir where lunar-javascript resolves
```

Known limits: tz offsets are only asserted ≤2026 (ICU vs zoneinfo tzdata versions diverge for future DST rules). Solar-term oracle precision outside 1930–2050 is bounded by ΔT, not by the engine.
