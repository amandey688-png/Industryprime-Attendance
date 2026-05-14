"""
Payroll policy constants.

Per-day rate and payslip proration use a fixed 30-day month for every calendar month
(February through January), regardless of 28/29/30/31 actual days.
Attendance counting still uses real calendar dates elsewhere.
"""

PAYROLL_SALARY_DAYS_PER_MONTH = 30
