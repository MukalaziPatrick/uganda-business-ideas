"""
geo_status.py — baseline/growth tracker for Mukalazi's geography stack.

Measures the ONE thing that determines whether the geo apps work: how many
real, map-located records exist in the super base (Business Yoo Supabase).
Pure standard library — no installs.

Reads creds from env (never hard-code keys):
    SUPABASE_URL   e.g. https://cdjaqdxvvdiiivjjiqbr.supabase.co
    SUPABASE_KEY   anon or service_role key

Usage:
    python scripts/geo_status.py
    python scripts/geo_status.py --json   # machine-readable, for the morning briefing
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
import urllib.error

# Each tuple: (label, table, filter, target)
# target = where this asset should be to "work". Adjust as you grow.
ASSETS = [
    ("Businesses (map-located)", "businesses", "lat=not.is.null", 2000),
    ("Land listings (live)",     "land_market", "",                500),
    ("Jobs",                     "jobs",        "",                300),
    ("Travel destinations",      "travel_destinations", "",        100),
    ("Salons",                   "salons",      "",                100),
]


def count(base: str, key: str, table: str, flt: str) -> int:
    """Exact row count via Supabase REST (Prefer: count=exact)."""
    url = f"{base}/rest/v1/{table}?select=id"
    if flt:
        url += f"&{flt}"
    req = urllib.request.Request(url, headers={
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Prefer": "count=exact",
        "Range": "0-0",
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            cr = r.headers.get("Content-Range", "")  # e.g. "0-0/732"
            return int(cr.split("/")[-1]) if "/" in cr else 0
    except (urllib.error.URLError, ValueError) as e:
        print(f"  ! {table}: {e}", file=sys.stderr)
        return -1


def bar(value: int, target: int, width: int = 24) -> str:
    if target <= 0 or value < 0:
        return ""
    filled = min(width, int(width * value / target))
    return "[" + "#" * filled + "-" * (width - filled) + f"] {value}/{target}"


def collect() -> dict:
    base = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_KEY", "")
    if not base or not key:
        return {"error": "Set SUPABASE_URL and SUPABASE_KEY env vars."}
    out = {}
    for label, table, flt, target in ASSETS:
        out[label] = {"count": count(base, key, table, flt), "target": target}
    return out


def render(stats: dict) -> str:
    if "error" in stats:
        return "ERROR: " + stats["error"]
    lines = ["=" * 60, "  GEO SUPER BASE — STATUS", "=" * 60, ""]
    total = sum(v["count"] for v in stats.values() if v["count"] > 0)
    for label, v in stats.items():
        lines.append(f"  {label:<26}: {v['count']}")
        b = bar(v["count"], v["target"])
        if b:
            lines.append(f"  {'  toward target':<26}: {b}")
    lines += ["", f"  TOTAL geo records          : {total}", "=" * 60]
    return "\n".join(lines)


def main() -> None:
    stats = collect()
    print(json.dumps(stats, indent=2) if "--json" in sys.argv else render(stats))


if __name__ == "__main__":
    main()
