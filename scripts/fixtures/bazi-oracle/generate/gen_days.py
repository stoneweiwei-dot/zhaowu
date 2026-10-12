"""Day-pillar anchor dates from sxtwl. Usage: python3 gen_days.py <out.json>
[[y,m,d,"干支"],...] for Jan 1 / Feb 28 / Feb 29 / Mar 1 / Jul 1 / Dec 31 of every year 1900-2100."""
import json
import sys

import sxtwl

TG = "甲乙丙丁戊己庚辛壬癸"
DZ = "子丑寅卯辰巳午未申酉戌亥"
out = []
for y in range(1900, 2101):
    for m, d in [(1, 1), (2, 28), (2, 29), (3, 1), (7, 1), (12, 31)]:
        try:
            g = sxtwl.fromSolar(y, m, d).getDayGZ()
        except Exception:
            continue
        if m == 2 and d == 29 and not (y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)):
            continue
        out.append([y, m, d, TG[g.tg] + DZ[g.dz]])
json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False, separators=(",", ":"))
print(len(out), "anchors")
