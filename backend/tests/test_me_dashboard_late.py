from datetime import date, time

from services.me_dashboard_service import _count_late_arrivals, _late_minutes_from_check_in


def test_late_cutoff_931_on_time():
    assert _late_minutes_from_check_in(time(9, 31)) == 0
    assert _late_minutes_from_check_in(time(9, 30)) == 0


def test_late_cutoff_932_is_late():
    assert _late_minutes_from_check_in(time(9, 32)) == 1
    assert _late_minutes_from_check_in(time(9, 33)) == 2


def test_count_late_ignores_weekend_and_stale_late_minutes():
    rows = [
        {"date": "2026-05-24", "check_in": "09:45:00", "late_minutes": 15},  # Saturday
        {"date": "2026-05-23", "check_in": None, "late_minutes": 30},  # no check-in
        {"date": "2026-05-22", "check_in": "09:33:00", "late_minutes": 0},  # Friday late
        {"date": "2026-05-21", "check_in": "09:15:00", "late_minutes": 99},  # stale DB late_minutes
    ]
    holidays: set[date] = set()
    leave: set[date] = set()
    assert _count_late_arrivals(rows, holiday_dates=holidays, leave_dates=leave) == 1


def test_count_late_excludes_approved_leave_days():
    rows = [{"date": "2026-05-22", "check_in": "10:00:00", "late_minutes": 30}]
    assert (
        _count_late_arrivals(
            rows,
            holiday_dates=set(),
            leave_dates={date(2026, 5, 22)},
        )
        == 0
    )
