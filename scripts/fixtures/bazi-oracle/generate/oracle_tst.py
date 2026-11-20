"""Independent true-solar-time oracle (no Meeus mean-longitude polynomial, no IERS download).

TST = hour angle of the *apparent* Sun + 12h, where
  hour angle = GAST + east_longitude - RA_apparent (true equator & equinox of date).
GAST from ERFA gst06a (UT1 ~= UTC, <0.9 s), RA from astropy get_sun -> TETE.
Usage: python3 oracle_tst.py <out.json>. Writes cases: for each case the signed shift (minutes) between local civil clock and true solar time.
"""
import json
import random
import sys
import warnings
from zoneinfo import ZoneInfo
from datetime import datetime, timedelta, timezone

import numpy as np
from astropy.coordinates import TETE, get_sun
from astropy.time import Time
from astropy.utils.exceptions import AstropyWarning

warnings.simplefilter("ignore", AstropyWarning)
import erfa  # noqa: E402

warnings.simplefilter("ignore", erfa.ErfaWarning)

random.seed(20261013)

# (label, east longitude, IANA tz)  -- real zones so DST/historical offsets come from zoneinfo (independent of Node ICU)
PLACES = [
    ("Sydney", 151.2093, "Australia/Sydney"),
    ("Melbourne", 144.9631, "Australia/Melbourne"),
    ("Auckland", 174.7633, "Pacific/Auckland"),
    ("Taipei", 121.5654, "Asia/Taipei"),
    ("HongKong", 114.1694, "Asia/Hong_Kong"),
    ("Beijing", 116.4074, "Asia/Shanghai"),
    ("Singapore", 103.8198, "Asia/Singapore"),
    ("KualaLumpur", 101.6869, "Asia/Kuala_Lumpur"),
    ("London", -0.1276, "Europe/London"),
    ("NewYork", -74.0060, "America/New_York"),
    ("LosAngeles", -118.2437, "America/Los_Angeles"),
    ("Vancouver", -123.1207, "America/Vancouver"),
    ("Tokyo", 139.6917, "Asia/Tokyo"),
    ("Seoul", 126.9780, "Asia/Seoul"),
]


def tst_hours(utc_ms: np.ndarray, lon_deg: np.ndarray) -> np.ndarray:
    t = Time(utc_ms / 1000.0, format="unix", scale="utc")
    tt = t.tt
    # GAST in radians (UT1 approximated by UTC)
    gast = erfa.gst06a(t.jd1, t.jd2, tt.jd1, tt.jd2)
    sun = get_sun(t).transform_to(TETE(obstime=t))
    ra = sun.ra.rad
    ha = gast + np.radians(lon_deg) - ra
    hours = (np.degrees(ha) / 15.0 + 12.0) % 24.0
    return hours


def main(n=1500, out="true-solar-cases.json"):
    cases = []
    for _ in range(n):
        label, lon, tzname = random.choice(PLACES)
        y = random.randint(1930, 2026)
        # civil local date-time (naive) -> instant via zoneinfo
        doy = random.randint(0, 364)
        base = datetime(y, 1, 1) + timedelta(days=doy)
        minute_of_day = random.randint(0, 1439)
        local = base + timedelta(minutes=minute_of_day)
        tz = ZoneInfo(tzname)
        aware = local.replace(tzinfo=tz)  # fold=0
        # skip nonexistent / ambiguous local times (DST gaps/overlaps): round-trip check
        utc = aware.astimezone(timezone.utc)
        back = utc.astimezone(tz).replace(tzinfo=None)
        if back != local:
            continue
        off_h = aware.utcoffset().total_seconds() / 3600.0
        cases.append(
            dict(
                place=label, tz=tzname, lon=lon, offsetHours=off_h,
                civil=[local.year, local.month, local.day, local.hour, local.minute],
                utcMs=int(utc.timestamp() * 1000),
            )
        )
    utc_ms = np.array([c["utcMs"] for c in cases], dtype=float)
    lons = np.array([c["lon"] for c in cases], dtype=float)
    hrs = tst_hours(utc_ms, lons)
    for c, h in zip(cases, hrs):
        civil_min = c["civil"][3] * 60 + c["civil"][4]
        shift = ((h * 60.0 - civil_min + 720.0) % 1440.0) - 720.0  # signed, minutes
        c["oracleShiftMin"] = round(float(shift), 4)
        c["oracleTstMinOfDay"] = round(float(h * 60.0), 4)
    json.dump(cases, open(out, "w"), ensure_ascii=False, separators=(",", ":"))
    print(len(cases), "cases written")


if __name__ == "__main__":
    main(out=sys.argv[1] if len(sys.argv) > 1 else "true-solar-cases.json")
