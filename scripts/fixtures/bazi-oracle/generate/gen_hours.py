"""Hour-pillar oracle table from sxtwl.getShiGz. Usage: python3 gen_hours.py <out.json>
Key "<dayStemIdx>-<hour>" -> pillar. Two modes:
  plain  (isZaoWanZiShi=False): 23:xx keeps the same civil day's stem   <- Zhaowu convention (ziPolicy "midnight")
  zaowan (isZaoWanZiShi=True) : 23:xx uses the NEXT day's stem (晚子時)  <- differs from repo for hour 23 only
"""
import json
import sys

import sxtwl

TG = "甲乙丙丁戊己庚辛壬癸"
DZ = "子丑寅卯辰巳午未申酉戌亥"


def table(zaowan: bool):
    return {
        f"{s}-{h}": TG[g.tg] + DZ[g.dz]
        for s in range(10)
        for h in range(24)
        for g in [sxtwl.getShiGz(s, h, zaowan)]
    }


json.dump({"plain": table(False), "zaowan": table(True)}, open(sys.argv[1], "w"), ensure_ascii=False, separators=(",", ":"))
