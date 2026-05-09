"""
Recompute persisted attendance rows (`public.attendance`) using current late-cutoff logic
(IN after 9:31 counts as late) and refresh `monthly_attendance` snapshots.

Run once after changing the cutoff, or invoke POST /attendance/admin/recalculate-late-cutoff
(master_admin only, service-role persistence).

Pure SQL cannot express the same OT/SF/Late branching as calculate_attendance_row; use this job.
"""

from __future__ import annotations

from datetime import date
from typing import Any, Dict, List, Optional, Set, Tuple

from database.supabase_client import SupabaseRest
from services.attendance_management_service import (
    _WEEKEND_AUTO_PRESENT_EMAILS,
    calculate_attendance_row,
    ensure_month,
    _stored_attendance_row,
)

PAGE_SIZE = 400


def _employee_weekend_auto_map(supabase: SupabaseRest) -> Dict[str, bool]:
    rows: List[Dict[str, Any]] = []
    offset = 0
    while True:
        batch = supabase.select(
            table="employees",
            select="id,email",
            order="id.asc",
            items_range=(offset, offset + PAGE_SIZE - 1),
        )
        rows.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    mapping: Dict[str, bool] = {}
    for r in rows:
        eid = str(r.get("id") or "")
        if not eid:
            continue
        email = str(r.get("email") or "").strip().lower()
        mapping[eid] = email in _WEEKEND_AUTO_PRESENT_EMAILS
    return mapping


def _holiday_date_map(supabase: SupabaseRest) -> Dict[str, str]:
    try:
        rows: List[Dict[str, Any]] = []
        offset = 0
        while True:
            batch = supabase.select(
                table="holidays",
                select="holiday_date,name",
                order="holiday_date.asc",
                items_range=(offset, offset + PAGE_SIZE - 1),
            )
            rows.extend(batch)
            if len(batch) < PAGE_SIZE:
                break
            offset += PAGE_SIZE
    except RuntimeError as exc:
        msg = str(exc).lower()
        if "holidays" in msg or "schema cache" in msg:
            return {}
        raise
    out: Dict[str, str] = {}
    for r in rows or []:
        raw = r.get("holiday_date")
        dk = str(raw)[:10] if raw is not None else ""
        if dk:
            out[dk] = str(r.get("name") or "Holiday").strip()
    return out


def _attendance_batches(
    supabase: SupabaseRest,
    *,
    employee_id_filter: Optional[str],
) -> List[List[Dict[str, Any]]]:
    batches: List[List[Dict[str, Any]]] = []

    def fetch_page(items_range: Tuple[int, int]) -> List[Dict[str, Any]]:
        kw: Dict[str, Any] = {
            "table": "attendance",
            "select": (
                "id,employee_id,date,check_in,check_out,working_hours,status,"
                "late_minutes,overtime_hours,final_status,source,upload_id"
            ),
            "order": "id.asc",
            "items_range": items_range,
        }
        if employee_id_filter:
            kw["where_eq"] = {"employee_id": employee_id_filter.strip()}
        return supabase.select(**kw)

    offset = 0
    while True:
        batch = fetch_page((offset, offset + PAGE_SIZE - 1))
        if batch:
            batches.append(batch)
        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return batches


def _row_to_payload(
    db_row: Dict[str, Any],
    weekend_auto: Dict[str, bool],
    holidays: Dict[str, str],
) -> Optional[Dict[str, Any]]:
    employee_id = str(db_row.get("employee_id") or "")
    raw_date = db_row.get("date")
    if not employee_id or raw_date is None:
        return None
    d_str = str(raw_date)[:10]
    day = date.fromisoformat(d_str)

    normalized: Dict[str, Any] = {
        "employee_id": employee_id,
        "date": d_str,
        "in_time": db_row.get("check_in"),
        "out_time": db_row.get("check_out"),
    }

    calculated = calculate_attendance_row(
        day,
        normalized,
        weekend_auto_present=weekend_auto.get(employee_id, False),
        holiday_name=holidays.get(d_str),
    )

    if calculated.get("in_time") and (
        calculated.get("out_time") or calculated.get("use_calculated_calendar")
    ):
        store_row = {
            "employee_id": employee_id,
            "date": d_str,
            "status": str(db_row.get("status") or calculated.get("status") or "P"),
        }
        uid = db_row.get("upload_id")
        upload_kw = str(uid) if uid not in (None, "") else None
        payload = _stored_attendance_row(
            store_row,
            calculated,
            source=str(db_row.get("source") or "manual"),
            upload_id=upload_kw,
        )
        return payload
    return None


def run_attendance_late_cutoff_recalculation(
    supabase: SupabaseRest,
    *,
    dry_run: bool = False,
    employee_id_filter: Optional[str] = None,
) -> Dict[str, int]:
    weekend_auto = _employee_weekend_auto_map(supabase)
    holidays = _holiday_date_map(supabase)

    snapshots: Set[Tuple[str, int, int]] = set()
    rows_seen = 0
    payloads: List[Dict[str, Any]] = []
    would_change = 0

    for batch in _attendance_batches(supabase, employee_id_filter=employee_id_filter):
        for db_row in batch:
            rows_seen += 1
            payload = _row_to_payload(db_row, weekend_auto, holidays)
            if not payload:
                continue
            d = date.fromisoformat(str(payload["date"])[:10])
            snapshots.add((str(payload["employee_id"]), d.month, d.year))

            old_lm = int(db_row.get("late_minutes") or 0)
            old_wh = round(float(db_row.get("working_hours") or 0), 4)
            old_ot = round(float(db_row.get("overtime_hours") or 0), 4)
            old_fs = str(db_row.get("final_status") or "")
            new_lm = int(payload.get("late_minutes") or 0)
            new_wh = round(float(payload.get("working_hours") or 0), 4)
            new_ot = round(float(payload.get("overtime_hours") or 0), 4)
            new_fs = str(payload.get("final_status") or "")
            if (old_lm, old_wh, old_ot, old_fs) != (new_lm, new_wh, new_ot, new_fs):
                would_change += 1

            payloads.append(payload)

    rows_written = 0
    chunk = 120
    if not dry_run:
        for i in range(0, len(payloads), chunk):
            supabase.upsert_many(
                table="attendance",
                rows=payloads[i : i + chunk],
                on_conflict="employee_id,date",
            )
            rows_written += min(chunk, len(payloads) - i)

        for eid, m, y in sorted(snapshots):
            ensure_month(eid, m, y, supabase)

    return {
        "rows_scanned": rows_seen,
        "rows_ready_to_upsert": len(payloads),
        "rows_changed_by_rules": would_change,
        "rows_upserted": 0 if dry_run else rows_written,
        "monthly_snapshots_refreshed": 0 if dry_run else len(snapshots),
    }
