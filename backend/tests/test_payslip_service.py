"""Unit tests for payslip calculations (no I/O)."""

from __future__ import annotations

from services.payslip_service import compute_payslip


def test_professional_tax_full_month_not_prorated() -> None:
    """PT is stored monthly; deduction must not be scaled by attendance factor."""
    employee = {
        "hra_monthly": None,
        "conveyance_monthly": None,
        "special_allowance_monthly": None,
        "pf_employee_monthly": None,
        "income_tax_tds_monthly": None,
        "professional_tax": 200.0,
    }
    ps = compute_payslip(
        employee,
        month=5,
        year=2026,
        calendar_days=30,
        present_days=10,
        absent_attendance_days=5,
        weekoff_days=10,
        holiday_days=5,
        salary_eligible_days=10,
        monthly_salary=30_000.0,
    )
    assert ps["deductions"]["professional_tax"] == 200.0
    # Gross prorated: 30000 * (10/30) = 10000
    assert ps["earnings"]["gross_earned"] == 10_000.0
    assert ps["net_pay"] == 9_800.0


def test_payslip_blank_statutory_lines() -> None:
    employee = {
        "hra_monthly": None,
        "conveyance_monthly": None,
        "special_allowance_monthly": None,
        "pf_employee_monthly": None,
        "income_tax_tds_monthly": None,
        "professional_tax": None,
    }
    ps = compute_payslip(
        employee,
        month=1,
        year=2026,
        calendar_days=31,
        present_days=20,
        absent_attendance_days=2,
        weekoff_days=5,
        holiday_days=4,
        salary_eligible_days=31,
        monthly_salary=50_000.0,
    )
    assert ps["display"]["pf_blank"] is True
    assert ps["display"]["professional_tax_blank"] is True
    assert ps["display"]["tds_blank"] is True
    assert ps["deductions"]["pf_employee"] is None
    assert ps["deductions"]["professional_tax"] is None
    assert ps["deductions"]["total"] == 0.0
    assert ps["net_pay"] == ps["earnings"]["gross_earned"]
