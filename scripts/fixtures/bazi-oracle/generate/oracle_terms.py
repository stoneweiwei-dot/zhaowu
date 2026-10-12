"""Independent solar-term oracle.

Source A: astropy/ERFA apparent geocentric ecliptic longitude of date (true equinox).
Source B: sxtwl (Xu Shi-ji SSQ algorithm used by the Chinese almanac), Beijing time -> UTC.
Usage: python3 oracle_terms.py 1900 2100 <out.json>
Writes <out.json>: {year: {term: [sxtwl_epoch_s, astropy_epoch_s]}} (UTC, integer seconds), the 12 month-opening 節.
Oracle agreement (measured): 1930-2025 max 16 s; 1900-29 max 36 s; 2026-50 max 58 s; 2051-2100 max 151 s (ΔT extrapolation).
"""
import json
import sys
import warnings

import numpy as np
import sxtwl
from astropy.coordinates import GeocentricTrueEcliptic, get_sun
from astropy.time import Time
from astropy.utils.exceptions import AstropyWarning

warnings.simplefilter("ignore", AstropyWarning)
import erfa  # noqa: E402

warnings.simplefilter("ignore", erfa.ErfaWarning)

# (name, ecliptic longitude, sxtwl jqIndex, approximate (month, day) in UTC)
JIE = [
    ("小寒", 285, 1, (1, 5)),
    ("立春", 315, 3, (2, 4)),
    ("驚蟄", 345, 5, (3, 5)),
    ("清明", 15, 7, (4, 5)),
    ("立夏", 45, 9, (5, 5)),
    ("芒種", 75, 11, (6, 6)),
    ("小暑", 105, 13, (7, 7)),
    ("立秋", 135, 15, (8, 7)),
    ("白露", 165, 17, (9, 7)),
    ("寒露", 195, 19, (10, 8)),
    ("立冬", 225, 21, (11, 7)),
    ("大雪", 255, 23, (12, 7)),
]
Y0, Y1, OUT = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
YEARS = list(range(Y0, Y1 + 1))


def sun_lon_deg(t: Time) -> np.ndarray:
    s = get_sun(t)
    return s.transform_to(GeocentricTrueEcliptic(equinox=t)).lon.deg


def solve_all():
    targets, guesses, keys = [], [], []
    for y in YEARS:
        for name, lon, _idx, (m, d) in JIE:
            targets.append(lon)
            guesses.append(Time(f"{y}-{m:02d}-{d:02d} 12:00:00", scale="utc").jd)
            keys.append((y, name))
    targets = np.array(targets, dtype=float)
    jd = np.array(guesses, dtype=float)
    for _ in range(8):
        t = Time(jd, format="jd", scale="utc")
        lon = sun_lon_deg(t)
        diff = ((lon - targets + 540.0) % 360.0) - 180.0
        jd = jd - diff / 0.985647
    # final residual check
    t = Time(jd, format="jd", scale="utc")
    resid = np.abs(((sun_lon_deg(t) - targets + 540.0) % 360.0) - 180.0)
    assert resid.max() < 1e-6, resid.max()
    epoch = (jd - 2440587.5) * 86400.0
    out = {}
    for (y, name), e in zip(keys, epoch):
        out.setdefault(y, {})[name] = float(e)
    return out


def sxtwl_all():
    out = {}
    for y in YEARS:
        by_idx = {j.jqIndex: j for j in sxtwl.getJieQiByYear(y)}
        row = {}
        for name, _lon, idx, _ in JIE:
            # sxtwl year runs 冬至..冬至; 小寒/立春.. of calendar year y may be listed under y
            # or y-1 depending on the term; resolve by requested calendar year.
            cand = None
            for yy in (y, y - 1, y + 1):
                for j in sxtwl.getJieQiByYear(yy):
                    if j.jqIndex == idx:
                        tt = sxtwl.JD2DD(j.jd)
                        if int(tt.Y) == y:
                            cand = (tt, j)
            assert cand, (y, name)
            tt, _j = cand
            # Beijing local -> UTC epoch seconds
            import calendar
            local = calendar.timegm((int(tt.Y), int(tt.M), int(tt.D), int(tt.h), int(tt.m), 0)) + float(tt.s)
            row[name] = local - 8 * 3600
        out[y] = row
    return out


if __name__ == "__main__":
    a = solve_all()
    b = sxtwl_all()
    diffs = []
    worst = (0, None)
    for y in YEARS:
        for name, *_ in JIE:
            d = a[y][name] - b[y][name]
            diffs.append(d)
            if abs(d) > abs(worst[0]):
                worst = (d, (y, name))
    diffs = np.array(diffs)
    print(f"years {Y0}-{Y1}, terms {len(diffs)}")
    print(f"astropy - sxtwl (seconds): mean {diffs.mean():+.1f}  max|d| {np.abs(diffs).max():.1f}  p99|d| {np.percentile(np.abs(diffs), 99):.1f}  worst {worst}")
    out = {str(y): {n: [round(b[y][n]), round(a[y][n])] for n, *_ in JIE} for y in YEARS}
    json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
