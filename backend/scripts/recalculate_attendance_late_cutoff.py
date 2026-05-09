"""
Re-scan public.attendance and refresh late_minutes / final_status / derived hours using the current
late-after-9:31 rule, then rebuild monthly_attendance JSON for affected months.

Usage (from backend root, after activating venv):

  python scripts/recalculate_attendance_late_cutoff.py
  python scripts/recalculate_attendance_late_cutoff.py --dry-run
  python scripts/recalculate_attendance_late_cutoff.py --employee-id <uuid>

Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see backend/.env).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow `python scripts/…` without PYTHONPATH=. 
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from database.supabase_client import get_supabase  # noqa: E402
from services.attendance_late_cutoff_migration import run_attendance_late_cutoff_recalculation  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report row counts without writing to Supabase",
    )
    parser.add_argument(
        "--employee-id",
        default=None,
        help="Optional employees.id UUID to limit the migration",
    )
    args = parser.parse_args()

    supabase = get_supabase()
    stats = run_attendance_late_cutoff_recalculation(
        supabase,
        dry_run=args.dry_run,
        employee_id_filter=args.employee_id,
    )
    print(json.dumps(stats, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
