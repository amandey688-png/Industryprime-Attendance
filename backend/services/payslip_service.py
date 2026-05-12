from __future__ import annotations

from typing import Any, Dict, Optional


def _f(v: Any) -> Optional[float]:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def compute_payslip(
    employee: Dict[str, Any],
    *,
    month: int,
    year: int,
    calendar_days: int,
    present_days: int,
    absent_attendance_days: int,
    weekoff_days: int,
    holiday_days: int,
    salary_eligible_days: float,
    monthly_salary: float,
) -> Dict[str, Any]:
    """
    Build payslip numbers for one calendar month. Gross earned is monthly package
    (salary + HRA + conveyance + special) prorated by salary_eligible_days / calendar_days.
    Statutory lines: professional tax is the full monthly amount from the employee profile
    (not prorated). PF and TDS use the same attendance proration factor as gross when set.
    """
    cal_days = max(int(calendar_days or 0), 1)
    elig = max(float(salary_eligible_days or 0), 0.0)
    factor = elig / float(cal_days) if cal_days else 0.0

    monthly_full = max(float(monthly_salary or 0), 0.0)
    hra_m = _f(employee.get("hra_monthly"))
    conv_m = _f(employee.get("conveyance_monthly"))
    spec_m = _f(employee.get("special_allowance_monthly"))
    hra = hra_m if hra_m is not None else 0.0
    conv = conv_m if conv_m is not None else 0.0
    spec = spec_m if spec_m is not None else 0.0

    base_monthly = max(0.0, round(monthly_full - hra - conv - spec, 2))

    def prorate(amt: float) -> float:
        return round(float(amt) * factor, 2)

    salary_earned = prorate(base_monthly)
    hra_e = prorate(hra)
    conv_e = prorate(conv)
    spec_e = prorate(spec)
    gross_earned = round(salary_earned + hra_e + conv_e + spec_e, 2)

    pf_raw = _f(employee.get("pf_employee_monthly"))
    pt_raw = _f(employee.get("professional_tax"))
    tds_raw = _f(employee.get("income_tax_tds_monthly"))

    pf_amt = prorate(pf_raw) if pf_raw is not None else None
    # Full monthly professional tax — always deducted in full when set (not prorated).
    pt_amt = round(float(pt_raw), 2) if pt_raw is not None else None
    tds_amt = prorate(tds_raw) if tds_raw is not None else None
    late_amt: Optional[float] = None

    total_ded = round((pf_amt or 0) + (pt_amt or 0) + (tds_amt or 0) + (late_amt or 0), 2)
    net_pay = round(gross_earned - total_ded, 2)

    working_days = int(present_days + absent_attendance_days)

    return {
        "month": month,
        "year": year,
        "working_days": working_days,
        "present_days": int(present_days),
        "absent_days": int(absent_attendance_days),
        "late_days": 0,
        "weekoff_days": int(weekoff_days),
        "holiday_days": int(holiday_days),
        "salary_eligible_days": round(elig, 2),
        "proration_factor": round(factor, 6),
        "monthly_salary": monthly_full,
        "earnings": {
            "salary": salary_earned,
            "hra": hra_e if hra_m is not None else None,
            "conveyance": conv_e if conv_m is not None else None,
            "special_allowance": spec_e if spec_m is not None else None,
            "gross_earned": gross_earned,
        },
        "deductions": {
            "pf_employee": pf_amt,
            "professional_tax": pt_amt,
            "income_tax_tds": tds_amt,
            "late_deduction": late_amt,
            "total": total_ded,
        },
        "net_pay": net_pay,
        "display": {
            "salary_blank": False,
            "hra_blank": hra_m is None,
            "conveyance_blank": conv_m is None,
            "special_allowance_blank": spec_m is None,
            "pf_blank": pf_raw is None,
            "professional_tax_blank": pt_raw is None,
            "tds_blank": tds_raw is None,
            "late_blank": True,
        },
    }
